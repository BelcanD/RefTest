# RefService - Сервис для обработки JSON и записи в Supabase

Этот сервис предназначен для получения JSON файлов с данными пользователей и записи их в базу данных Supabase.

## Возможности

- Загрузка JSON файлов через API
- Прямая отправка JSON данных через API
- Автоматическая обработка данных и запись в Supabase
- Получение всех записей из базы данных
- Проверка статуса сервиса

## Установка и настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

#### 2.1 Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации проекта

#### 2.2 Получение ключей API

1. В панели управления Supabase перейдите в раздел "Settings" → "API"
2. Скопируйте:
   - **Project URL** (SUPABASE_URL)
   - **anon public** ключ (SUPABASE_ANON_KEY)

#### 2.3 Создание таблицы в базе данных

1. Перейдите в раздел "SQL Editor" в панели Supabase
2. Выполните SQL скрипт из файла `database/schema.sql`:

```sql
-- Создание таблицы для хранения данных пользователей
CREATE TABLE IF NOT EXISTS user_identities (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    identity_data JSONB NOT NULL,
    last_sign_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_identities_email ON user_identities(email);
CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_provider ON user_identities(provider);
CREATE INDEX IF NOT EXISTS idx_user_identities_processed_at ON user_identities(processed_at);

-- Создание уникального индекса для предотвращения дублирования
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_identities_unique 
ON user_identities(id, provider, provider_id);
```

### 3. Настройка переменных окружения

1. Скопируйте файл `env.example` в `.env`:
```bash
cp env.example .env
```

2. Отредактируйте файл `.env` и укажите ваши данные:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

### 4. Сборка и запуск

#### Режим разработки:
```bash
npm run dev
```

#### Продакшн режим:
```bash
npm run build
npm start
```

## API Endpoints

### POST /upload
Загрузка JSON файла

**Параметры:**
- `jsonFile` (multipart/form-data) - JSON файл

**Пример использования:**
```bash
curl -X POST -F "jsonFile=@data.json" http://localhost:3000/upload
```

### POST /process
Прямая отправка JSON данных

**Тело запроса:**
```json
{
  "type": "INSERT",
  "table": "identities",
  "record": {
    "id": "53de3e5d-3421-4d74-b255-fe322c7f0b53",
    "email": "belcandd@gmail.com",
    "user_id": "75983ce4-5eb-48ef-a0ad-164f04a7421c",
    "provider": "google",
    "created_at": "2025-10-24T13:03:10.999288+00:00",
    "updated_at": "2025-10-24T13:03:10.999288+00:00",
    "provider_id": "108457488958606932343",
    "identity_data": {
      "iss": "https://accounts.google.com",
      "sub": "108457488958606932343",
      "name": "Sergey BelcanD",
      "email": "belcandd@gmail.com",
      "picture": "https://lh3.googleusercontent.com/a/ACg8ocL5m8HTsvqJ0_8or_Tqjjv2r2C-40vUAZE-AfcHvXw7AF06Rw=s96-c",
      "full_name": "Sergey BelcanD",
      "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocL5m8HTsvqJ0_8or_Tqjjv2r2C-40vUAZE-AfcHvXw7AF06Rw=s96-c",
      "provider_id": "108457488958606932343",
      "email_verified": true,
      "phone_verified": false
    },
    "last_sign_in_at": "2025-10-24T13:03:10.999239+00:00"
  },
  "schema": "auth",
  "old_record": null
}
```

**Пример использования:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d @data.json http://localhost:3000/process
```

### GET /records
Получение всех записей из базы данных

**Пример использования:**
```bash
curl http://localhost:3000/records
```

### GET /health
Проверка статуса сервиса

**Пример использования:**
```bash
curl http://localhost:3000/health
```

## Структура проекта

```
RefService/
├── src/
│   ├── index.ts              # Основной файл сервера
│   ├── config/
│   │   └── supabase.ts       # Конфигурация Supabase
│   └── services/
│       └── jsonProcessor.ts  # Обработка JSON данных
├── database/
│   └── schema.sql            # SQL схема базы данных
├── package.json              # Зависимости проекта
├── tsconfig.json             # Конфигурация TypeScript
├── env.example               # Пример переменных окружения
└── README.md                 # Документация
```

## Обработка ошибок

Сервис обрабатывает следующие типы ошибок:

- Отсутствие файла при загрузке
- Неверный формат JSON
- Неподдерживаемый тип операции (только INSERT)
- Неподдерживаемая таблица (только identities)
- Ошибки подключения к базе данных
- Ошибки записи в базу данных

## Безопасность

- Валидация типов файлов (только JSON)
- Проверка структуры JSON данных
- Обработка ошибок без раскрытия внутренней информации
- Автоматическое удаление временных файлов

## Мониторинг

Сервис предоставляет endpoint `/health` для проверки статуса и может быть интегрирован с системами мониторинга.

## Развертывание

Для развертывания в продакшн среде:

1. Установите переменные окружения на сервере
2. Соберите проект: `npm run build`
3. Запустите: `npm start`
4. Настройте reverse proxy (nginx) для обработки запросов
5. Настройте SSL сертификаты для HTTPS

## Поддержка

При возникновении проблем проверьте:

1. Правильность настройки переменных окружения
2. Доступность Supabase проекта
3. Корректность SQL схемы в базе данных
4. Логи сервиса для диагностики ошибок

