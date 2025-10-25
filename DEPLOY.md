# Деплой RefService на Vercel

## Шаги для деплоя

### 1. Подготовка проекта

Убедитесь, что у вас есть:
- Аккаунт на [vercel.com](https://vercel.com)
- Настроенный проект Supabase
- Git репозиторий с кодом

### 2. Деплой через Vercel CLI

#### Установка Vercel CLI:
```bash
npm i -g vercel
```

#### Логин в Vercel:
```bash
vercel login
```

#### Деплой проекта:
```bash
vercel
```

Следуйте инструкциям:
- Set up and deploy? `Y`
- Which scope? Выберите ваш аккаунт
- Link to existing project? `N`
- What's your project's name? `ref-service`
- In which directory is your code located? `./`

### 3. Настройка переменных окружения

После деплоя настройте переменные окружения в панели Vercel:

1. Перейдите в ваш проект на [vercel.com](https://vercel.com)
2. Откройте раздел "Settings" → "Environment Variables"
3. Добавьте переменные:

```
SUPABASE_URL = https://jisldsqqxbcumhekwzem.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc2xkc3FxeGJjdW1oZWt3emVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAxNTksImV4cCI6MjA3Njk4NjE1OX0.w-xGepxlMuCVIxkMtuZouJKMHCgtDfY6P1_9qqaxYuo
PORT = 3000
```

4. Нажмите "Save"
5. Передеплойте проект: `vercel --prod`

### 4. Альтернативный способ - через GitHub

1. Загрузите код в GitHub репозиторий
2. Подключите репозиторий к Vercel:
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Выберите ваш GitHub репозиторий
   - Настройте переменные окружения
   - Нажмите "Deploy"

### 5. Проверка деплоя

После успешного деплоя вы получите URL вида:
`https://ref-service-xxx.vercel.app`

Проверьте работу API:
```bash
curl https://your-project-url.vercel.app/health
```

## Структура для Vercel

Проект настроен для работы с Vercel:
- `vercel.json` - конфигурация деплоя
- `package.json` - добавлен скрипт `vercel-build`
- Поддержка TypeScript из коробки
- Автоматическая сборка при деплое

## Переменные окружения

Vercel автоматически подхватывает переменные из файла `.env` или из настроек проекта.

## Обновление проекта

Для обновления проекта:
```bash
vercel --prod
```

Или просто сделайте push в GitHub, если настроен автодеплой.
