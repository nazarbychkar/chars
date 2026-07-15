#!/usr/bin/env node
/**
 * Restructure catalog categories/subcategories to the approved nav tree.
 * Run: node scripts/migrate-nav-structure.mjs
 * Safe to re-run (idempotent name matches + ON CONFLICT-style upserts).
 */
import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

function loadEnvUrl() {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) process.env.DATABASE_URL = match[1].replace(/['"]/g, "").trim();
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  return process.env.DATABASE_URL;
}

async function findCategory(client, names) {
  const list = Array.isArray(names) ? names : [names];
  const res = await client.query(
    `SELECT * FROM categories
     WHERE TRIM(BOTH FROM name) = ANY($1::text[])
        OR TRIM(BOTH FROM name) ILIKE ANY($2::text[])
     ORDER BY id ASC LIMIT 1`,
    [list, list]
  );
  return res.rows[0] || null;
}

async function upsertCategory(client, { aliases, name, name_en, name_de, priority }) {
  let cat = await findCategory(client, aliases);
  if (cat) {
    await client.query(
      `UPDATE categories
       SET name = $1, name_en = $2, name_de = $3, priority = $4
       WHERE id = $5`,
      [name, name_en, name_de, priority, cat.id]
    );
    console.log(`  ✓ category #${cat.id}: ${cat.name} → ${name} (priority ${priority})`);
    return { ...cat, name, name_en, name_de, priority };
  }
  const inserted = await client.query(
    `INSERT INTO categories (name, name_en, name_de, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, name_en, name_de, priority]
  );
  console.log(`  + category #${inserted.rows[0].id}: ${name}`);
  return inserted.rows[0];
}

async function findSub(client, parentId, names) {
  const list = Array.isArray(names) ? names : [names];
  const res = await client.query(
    `SELECT * FROM subcategories
     WHERE category_id = $1
       AND (
         TRIM(BOTH FROM name) = ANY($2::text[])
         OR TRIM(BOTH FROM name) ILIKE ANY($2::text[])
       )
     ORDER BY id ASC LIMIT 1`,
    [parentId, list]
  );
  return res.rows[0] || null;
}

async function findSubAnywhere(client, names) {
  const list = Array.isArray(names) ? names : [names];
  const res = await client.query(
    `SELECT * FROM subcategories
     WHERE TRIM(BOTH FROM name) = ANY($1::text[])
        OR TRIM(BOTH FROM name) ILIKE ANY($1::text[])
     ORDER BY id ASC LIMIT 1`,
    [list]
  );
  return res.rows[0] || null;
}

async function ensureSub(
  client,
  parentId,
  { aliases, name, name_en, name_de, priority }
) {
  let sub =
    (await findSub(client, parentId, aliases)) ||
    (await findSubAnywhere(client, aliases));

  if (sub) {
    await client.query(
      `UPDATE subcategories
       SET name = $1, name_en = $2, name_de = $3,
           category_id = $4, priority = $5
       WHERE id = $6`,
      [name, name_en, name_de, parentId, priority, sub.id]
    );
    if (sub.category_id !== parentId) {
      await client.query(
        `UPDATE products SET category_id = $1, subcategory_id = $2
         WHERE subcategory_id = $2`,
        [parentId, sub.id]
      );
      console.log(
        `  ✓ moved subcategory #${sub.id} ${sub.name} → ${name} (parent ${parentId})`
      );
    } else {
      console.log(`  ✓ subcategory #${sub.id}: ${name} (priority ${priority})`);
    }
    return;
  }

  const inserted = await client.query(
    `INSERT INTO subcategories (name, name_en, name_de, category_id, priority)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [name, name_en, name_de, parentId, priority]
  );
  console.log(`  + subcategory #${inserted.rows[0].id}: ${name}`);
}

async function hideCategory(client, aliases) {
  const cat = await findCategory(client, aliases);
  if (!cat) return;
  await client.query(`UPDATE categories SET priority = -100 WHERE id = $1`, [
    cat.id,
  ]);
  console.log(`  ✓ hidden category #${cat.id}: ${cat.name}`);
}

async function main() {
  const dbUrl = loadEnvUrl();
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
  });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0`
    );
    await client.query(
      `ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0`
    );
    await client.query(
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT`
    );
    await client.query(
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_de TEXT`
    );
    await client.query(
      `ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_en TEXT`
    );
    await client.query(
      `ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS name_de TEXT`
    );

    console.log("→ Updating parent categories…");

    const shirts = await upsertCategory(client, {
      aliases: ["TOPS", "Сорочки | Футболки", "Сорочки|Футболки"],
      name: "Сорочки | Футболки",
      name_en: "Shirts | T-shirts",
      name_de: "Hemden | T-Shirts",
      priority: 70,
    });

    const hoodies = await upsertCategory(client, {
      aliases: ["Худі | Світшоти", "Худі|Світшоти"],
      name: "Худі | Світшоти",
      name_en: "Hoodies | Sweatshirts",
      name_de: "Hoodies | Sweatshirts",
      priority: 60,
    });

    const bottoms = await upsertCategory(client, {
      aliases: ["BOTTOMS", "Штани | Шорти", "Штани|Шорти"],
      name: "Штани | Шорти",
      name_en: "Pants | Shorts",
      name_de: "Hosen | Shorts",
      priority: 50,
    });

    const suits = await upsertCategory(client, {
      aliases: ["Костюми"],
      name: "Костюми",
      name_en: "Suits",
      name_de: "Anzüge",
      priority: 40,
    });

    const outerwear = await upsertCategory(client, {
      aliases: ["Верхній одяг", "Верхній одяг "],
      name: "Верхній одяг",
      name_en: "Outerwear",
      name_de: "Oberbekleidung",
      priority: 30,
    });

    const underwear = await upsertCategory(client, {
      aliases: [
        "UNDERWEAR",
        "Білизна | Піжамні костюми",
        "Білизна|Піжамні костюми",
      ],
      name: "Білизна | Піжамні костюми",
      name_en: "Underwear | Sleepwear",
      name_de: "Unterwäsche | Nachtwäsche",
      priority: 20,
    });

    const accessories = await upsertCategory(client, {
      aliases: ["Аксесуари", "Аксесуари "],
      name: "Аксесуари",
      name_en: "Accessories",
      name_de: "Accessoires",
      priority: 10,
    });

    console.log("→ Syncing subcategories…");

    // Сорочки | Футболки
    await ensureSub(client, shirts.id, {
      aliases: ["Сорочки"],
      name: "Сорочки",
      name_en: "Shirts",
      name_de: "Hemden",
      priority: 60,
    });
    await ensureSub(client, shirts.id, {
      aliases: ["Футболки"],
      name: "Футболки",
      name_en: "T-shirts",
      name_de: "T-Shirts",
      priority: 50,
    });
    await ensureSub(client, shirts.id, {
      aliases: ["Майки"],
      name: "Майки",
      name_en: "Tank tops",
      name_de: "Tanktops",
      priority: 40,
    });
    await ensureSub(client, shirts.id, {
      aliases: ["Топи"],
      name: "Топи",
      name_en: "Tops",
      name_de: "Tops",
      priority: 30,
    });
    await ensureSub(client, shirts.id, {
      aliases: ["Корсети"],
      name: "Корсети",
      name_en: "Corsets",
      name_de: "Korsetts",
      priority: 20,
    });
    await ensureSub(client, shirts.id, {
      aliases: ["Лонгсліви", "Longsleeve", "Long sleeves"],
      name: "Лонгсліви",
      name_en: "Long sleeves",
      name_de: "Longsleeves",
      priority: 10,
    });

    // Худі | Світшоти
    await ensureSub(client, hoodies.id, {
      aliases: ["Худі", "Худі та світшоти", "Худі та Світшоти"],
      name: "Худі",
      name_en: "Hoodies",
      name_de: "Hoodies",
      priority: 20,
    });
    await ensureSub(client, hoodies.id, {
      aliases: ["Світшоти", "Светри"],
      name: "Світшоти",
      name_en: "Sweatshirts",
      name_de: "Sweatshirts",
      priority: 10,
    });

    // Штани | Шорти
    await ensureSub(client, bottoms.id, {
      aliases: ["Палаццо"],
      name: "Палаццо",
      name_en: "Palazzo",
      name_de: "Palazzo",
      priority: 70,
    });
    await ensureSub(client, bottoms.id, {
      aliases: [
        "З високою посадкою",
        "Штани з високою посадкою",
        "Штани з високою посадкою",
      ],
      name: "З високою посадкою",
      name_en: "High waist",
      name_de: "High Waist",
      priority: 60,
    });
    await ensureSub(client, bottoms.id, {
      aliases: ["Штани - Беггі", "Штани-беггі", "Штани-Беггі", "Беггі"],
      name: "Штани - Беггі",
      name_en: "Baggy pants",
      name_de: "Baggy-Hosen",
      priority: 50,
    });
    await ensureSub(client, bottoms.id, {
      aliases: ["Спортивні штани"],
      name: "Спортивні штани",
      name_en: "Joggers",
      name_de: "Jogginghosen",
      priority: 40,
    });
    await ensureSub(client, bottoms.id, {
      aliases: ["Джинси"],
      name: "Джинси",
      name_en: "Jeans",
      name_de: "Jeans",
      priority: 30,
    });
    await ensureSub(client, bottoms.id, {
      aliases: ["Бріджі"],
      name: "Бріджі",
      name_en: "Capri pants",
      name_de: "Caprihosen",
      priority: 20,
    });
    await ensureSub(client, bottoms.id, {
      aliases: ["Шорти"],
      name: "Шорти",
      name_en: "Shorts",
      name_de: "Shorts",
      priority: 10,
    });

    // Костюми
    await ensureSub(client, suits.id, {
      aliases: ["Джинсові", "Костюми джинсові"],
      name: "Джинсові",
      name_en: "Denim",
      name_de: "Denim",
      priority: 20,
    });
    await ensureSub(client, suits.id, {
      aliases: ["Спортивні", "Костюми спортивні"],
      name: "Спортивні",
      name_en: "Sport",
      name_de: "Sport",
      priority: 10,
    });
    // Hide leftover generic "Костюми" subcategory under shirts if present as name only on old parent
    const oldSuitsSub = await findSub(client, shirts.id, ["Костюми"]);
    if (oldSuitsSub) {
      await client.query(`UPDATE subcategories SET priority = -100 WHERE id = $1`, [
        oldSuitsSub.id,
      ]);
      console.log(`  ✓ hidden leftover subcategory #${oldSuitsSub.id}: Костюми`);
    }

    // Верхній одяг
    await ensureSub(client, outerwear.id, {
      aliases: ["Пальта"],
      name: "Пальта",
      name_en: "Coats",
      name_de: "Mäntel",
      priority: 30,
    });
    await ensureSub(client, outerwear.id, {
      aliases: ["Плащі"],
      name: "Плащі",
      name_en: "Raincoats",
      name_de: "Mäntel/Trench",
      priority: 20,
    });
    await ensureSub(client, outerwear.id, {
      aliases: ["Куртки"],
      name: "Куртки",
      name_en: "Jackets",
      name_de: "Jacken",
      priority: 10,
    });

    // Білизна | Піжамні костюми
    await ensureSub(client, underwear.id, {
      aliases: ["Піжамні костюми", "Піжами"],
      name: "Піжамні костюми",
      name_en: "Pajama sets",
      name_de: "Schlafanzüge",
      priority: 30,
    });
    await ensureSub(client, underwear.id, {
      aliases: ["Сімейки"],
      name: "Сімейки",
      name_en: "Briefs",
      name_de: "Slips",
      priority: 20,
    });
    // Rename underwear "Шорти" → "Шорти домашні" (only within this parent — not bottoms Шорти)
    {
      const lounge =
        (await findSub(client, underwear.id, ["Шорти домашні"])) ||
        (await findSub(client, underwear.id, ["Шорти"]));
      if (lounge) {
        await client.query(
          `UPDATE subcategories
           SET name = 'Шорти домашні', name_en = 'Lounge shorts',
               name_de = 'Hausshorts', priority = 10
           WHERE id = $1`,
          [lounge.id]
        );
        console.log(`  ✓ subcategory #${lounge.id}: Шорти домашні`);
      } else {
        await ensureSub(client, underwear.id, {
          aliases: ["Шорти домашні"],
          name: "Шорти домашні",
          name_en: "Lounge shorts",
          name_de: "Hausshorts",
          priority: 10,
        });
      }
    }

    // Аксесуари (+ headwear merged)
    await ensureSub(client, accessories.id, {
      aliases: ["Краватки"],
      name: "Краватки",
      name_en: "Ties",
      name_de: "Krawatten",
      priority: 30,
    });
    await ensureSub(client, accessories.id, {
      aliases: ["Кепки"],
      name: "Кепки",
      name_en: "Caps",
      name_de: "Caps",
      priority: 20,
    });
    await ensureSub(client, accessories.id, {
      aliases: ["Папайки"],
      name: "Папайки",
      name_en: "Dad hats",
      name_de: "Dad Caps",
      priority: 10,
    });

    console.log("→ Hiding obsolete categories…");
    await hideCategory(client, ["Головні убори", "Headwear"]);

    // Merge duplicate «Світшоти» left under shirts into Худі | Світшоти
    const shirtSweat = await findSub(client, shirts.id, ["Світшоти", "Светри"]);
    const hoodieSweat = await findSub(client, hoodies.id, ["Світшоти"]);
    if (shirtSweat && hoodieSweat && shirtSweat.id !== hoodieSweat.id) {
      await client.query(
        `UPDATE products SET category_id = $1, subcategory_id = $2
         WHERE subcategory_id = $3`,
        [hoodies.id, hoodieSweat.id, shirtSweat.id]
      );
      await client.query(
        `UPDATE subcategories SET priority = -100 WHERE id = $1`,
        [shirtSweat.id]
      );
      console.log(
        `  ✓ merged shirt sweatshirts #${shirtSweat.id} → #${hoodieSweat.id}`
      );
    } else if (shirtSweat && !hoodieSweat) {
      await client.query(
        `UPDATE subcategories
         SET category_id = $1, name = 'Світшоти',
             name_en = 'Sweatshirts', name_de = 'Sweatshirts', priority = 10
         WHERE id = $2`,
        [hoodies.id, shirtSweat.id]
      );
      await client.query(
        `UPDATE products SET category_id = $1 WHERE subcategory_id = $2`,
        [hoodies.id, shirtSweat.id]
      );
      console.log(`  ✓ moved leftover sweater subcategory to hoodies`);
    }

    // Hide extras not in the approved tree
    for (const name of ["Жилетки", "Бомбери"]) {
      const extra = await client.query(
        `SELECT id, category_id FROM subcategories
         WHERE TRIM(BOTH FROM name) = $1 LIMIT 1`,
        [name]
      );
      if (!extra.rows[0]) continue;
      if (name === "Бомбери") {
        const jackets = await findSub(client, outerwear.id, ["Куртки"]);
        if (jackets) {
          await client.query(
            `UPDATE products SET category_id = $1, subcategory_id = $2
             WHERE subcategory_id = $3`,
            [outerwear.id, jackets.id, extra.rows[0].id]
          );
          console.log(`  ✓ moved bombers into jackets #${jackets.id}`);
        }
      }
      await client.query(
        `UPDATE subcategories SET priority = -100 WHERE id = $1`,
        [extra.rows[0].id]
      );
      console.log(`  ✓ hidden subcategory: ${name}`);
    }

    await client.query("COMMIT");
    console.log("Navigation structure migration complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
