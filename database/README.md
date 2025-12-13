# Database Optimization

## Індекси PostgreSQL

Для оптимізації продуктивності бази даних необхідно створити індекси.

### Як запустити:

```bash
# Варіант 1: Через psql
psql $DATABASE_URL -f database/indexes.sql

# Варіант 2: Через psql з явним підключенням
psql "postgresql://user:password@host:port/database" -f database/indexes.sql

# Варіант 3: Якщо DATABASE_URL в .env
psql $(grep DATABASE_URL .env | cut -d '=' -f2) -f database/indexes.sql
```

### Що роблять індекси:

- **idx_products_category_id** - прискорює фільтрацію по категорії
- **idx_products_subcategory_id** - прискорює фільтрацію по підкатегорії
- **idx_products_top_sale** - partial index для топ продажів (ефективніший)
- **idx_products_limited** - partial index для лімітованих товарів
- **idx_products_created_at** - прискорює сортування по даті створення
- **idx_products_season_gin** - GIN індекс для пошуку по масиву сезонів
- **idx_product_media_product_id** - прискорює завантаження медіа товарів
- **idx_product_sizes_product_size** - критичний для оновлення stock
- **idx_orders_payment_status** - прискорює фільтрацію замовлень
- **idx_subcategories_name_lower** - expression index для case-insensitive пошуку

### Перевірка індексів:

```sql
-- Перевірити всі індекси на таблиці products
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'products';

-- Перевірити використання індексів
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Очікуваний результат:

- **TTFB зменшиться в 2-3 рази**
- **PostgreSQL CPU використання знизиться на 40-60%**
- **RAM використання зменшиться завдяки меншому seq scan**
- **Підвищиться стабільність при піковому навантаженні**

