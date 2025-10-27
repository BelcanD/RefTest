# 📋 Новые API Endpoints для реферальной системы

## 🎯 Обзор

Добавлены новые endpoints для работы с реферальной системой:
- Регистрация пользователей с генерацией реферального кода
- Получение реферальной ссылки
- Получение статистики рефералов
- Автоматическое начисление JBC по уровням

---

## 🔗 Новые Endpoints

### 1. POST /api/referral/register
**Регистрация пользователя с реферальным кодом**

**Request:**
```json
{
  "email": "user@example.com",
  "refParentCode": "ABC123" // опционально
}
```

**Response:**
```json
{
  "success": true,
  "message": "Пользователь успешно зарегистрирован",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "ref_code": "XYZ789",
    "referral_link": "jobsy.com/ref/XYZ789"
  }
}
```

---

### 2. GET /api/referral/link?email=user@example.com
**Получение реферальной ссылки по email**

**Query Parameters:**
- `email` (string) - Email пользователя

**Response:**
```json
{
  "success": true,
  "data": {
    "ref_code": "XYZ789",
    "referral_link": "jobsy.com/ref/XYZ789"
  }
}
```

---

### 3. GET /api/referral/stats?userId=123
**Получение статистики рефералов**

**Query Parameters:**
- `userId` (string) - ID пользователя

**Response:**
```json
{
  "success": true,
  "data": {
    "directReferrals": 5,
    "balanceEur": 0,
    "balanceJbc": 12.5,
    "transactions": [...]
  }
}
```

---

### 4. GET /api/referral/user?email=user@example.com
**Получение информации о пользователе**

**Query Parameters:**
- `email` (string) - Email пользователя

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "ref_code": "XYZ789",
    "referral_link": "jobsy.com/ref/XYZ789",
    "plan_type": "free",
    "balance_eur": 0,
    "balance_jbc": 12.5,
    "kyc_status": "pending",
    "created_at": "2025-01-15T10:30:45.123Z"
  }
}
```

---

## 🧩 Как работает система

### 1. Генерация реферального кода
- При регистрации автоматически генерируется уникальный `ref_code` (6 символов)
- Код сохраняется в базе данных вместе с email

### 2. Реферальное дерево
- Если указан `refParentCode`, создается связь родитель → ребенок
- Система сохраняет всю цепочку до 12 уровней вверх
- При регистрации нового пользователя автоматически начисляются JBC

### 3. Начисление JBC
- **Уровень 1**: 1.00 JBC
- **Уровень 2**: 0.50 JBC
- **Уровень 3**: 0.25 JBC
- И так далее до уровня 12

### 4. Формат реферальной ссылки
```
jobsy.com/ref/XYZ789
```

---

## 🧪 Примеры использования

### Пример 1: Регистрация без реферального кода
```bash
curl -X POST http://localhost:3000/api/referral/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com"
  }'
```

### Пример 2: Регистрация с реферальным кодом
```bash
curl -X POST http://localhost:3000/api/referral/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "refParentCode": "ABC123"
  }'
```

### Пример 3: Получение реферальной ссылки
```bash
curl "http://localhost:3000/api/referral/link?email=user@example.com"
```

### Пример 4: Получение статистики
```bash
curl "http://localhost:3000/api/referral/stats?userId=123e4567-e89b-12d3-a456-426614174000"
```

---

## 🗄️ Структура базы данных

### Таблица `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    ref_code VARCHAR(10) NOT NULL UNIQUE,
    ref_parent UUID REFERENCES users(id),
    ref_tree JSONB,
    plan_type VARCHAR(20) DEFAULT 'free',
    balance_eur DECIMAL(10, 2) DEFAULT 0,
    balance_jbc BIGINT DEFAULT 0,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Таблица `transactions`
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('jbc', 'eur')),
    amount DECIMAL(10, 8) NOT NULL,
    level INT NOT NULL CHECK (level BETWEEN 1 AND 12),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    source_user UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📝 Примечания

1. **Уникальность**: Каждый email может быть зарегистрирован только один раз
2. **Реферальное дерево**: Максимум 12 уровней вглубь
3. **Начисление JBC**: Автоматическое при регистрации по реферальной ссылке
4. **Формат ref_code**: 6 символов (A-Z, 0-9)

---

## 🚀 Развертывание

### 1. Обновите базу данных в Supabase
```bash
# Выполните SQL из файла database/referral_schema.sql
```

### 2. Соберите проект
```bash
npm run build
```

### 3. Деплой
```bash
vercel --prod
```

---

## 📋 Тестирование

После деплоя протестируйте endpoints через Postman или curl:

1. **Регистрация первого пользователя**
2. **Регистрация второго пользователя по реферальной ссылке первого**
3. **Проверка начисления JBC**
4. **Получение статистики**

Пример сценария:
```bash
# 1. Регистрация первого пользователя
curl -X POST https://your-url.vercel.app/api/referral/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com"}'

# Сохраните ref_code из ответа (например: "ABC123")

# 2. Регистрация второго пользователя по реферальной ссылке
curl -X POST https://your-url.vercel.app/api/referral/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "refParentCode": "ABC123"
  }'

# 3. Проверка статистики первого пользователя
curl "https://your-url.vercel.app/api/referral/stats?userId=ID_FROM_STEP_1"
```
