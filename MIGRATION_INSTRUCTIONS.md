# Database Migration Instructions

## Опис
Ця міграція додає нові поля до таблиці `products`:
- `old_price` - стара ціна (до знижки)
- `discount_percentage` - відсоток знижки
- `priority` - пріоритет показу товару

## Варіанти запуску міграції

### 1. Через API endpoint (рекомендовано)
```bash
# Перевірити статус міграції
curl -X GET https://your-domain.com/api/migrate

# Запустити міграцію
curl -X POST https://your-domain.com/api/migrate
```

### 2. Через SQL файл
```bash
# Якщо у вас є доступ до psql
psql $DATABASE_URL -f migration_products_fields.sql

# Або через pgAdmin/інший клієнт БД
# Виконайте SQL з файлу migration_products_fields.sql
```

### 3. Через Neon Console
1. Відкрийте Neon Console
2. Перейдіть до SQL Editor
3. Скопіюйте та виконайте SQL з файлу `migration_products_fields.sql`

## Перевірка міграції
Після запуску міграції перевірте, що нові колонки створені:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('old_price', 'discount_percentage', 'priority')
ORDER BY column_name;
```

Очікуваний результат:
- `discount_percentage` | `integer` | `YES` | `null`
- `old_price` | `numeric` | `YES` | `null`  
- `priority` | `integer` | `YES` | `0`

## Важливо
- Міграція використовує `ADD COLUMN IF NOT EXISTS`, тому безпечно запускати кілька разів
- Всі нові поля є опціональними (nullable)
- Поле `priority` має значення за замовчуванням `0`
