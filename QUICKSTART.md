# Быстрый старт RefService

## 1. Установка зависимостей
```bash
npm install
```

## 2. Настройка Supabase

### Создайте проект в Supabase:
1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте Project URL и anon key

### Создайте таблицу:
Выполните SQL из файла `database/schema.sql` в SQL Editor Supabase

## 3. Настройка переменных окружения
```bash
cp env.example .env
```

Отредактируйте `.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

## 4. Запуск
```bash
# Режим разработки
npm run dev

# Продакшн
npm run build
npm start
```

## 5. Тестирование
```bash
# Проверка статуса
curl http://localhost:3000/health

# Загрузка файла
curl -X POST -F "jsonFile=@examples/sample-data.json" http://localhost:3000/upload

# Получение записей
curl http://localhost:3000/records
```

## API Endpoints
- `POST /upload` - загрузка JSON файла
- `POST /process` - прямая отправка JSON данных
- `GET /records` - получение всех записей
- `GET /health` - проверка статуса

Подробная документация в файле `README.md`

