# 🚀 Быстрый деплой RefService на Vercel

## 1. Установка Vercel CLI
```bash
npm i -g vercel
```

## 2. Логин в Vercel
```bash
vercel login
```

## 3. Деплой проекта
```bash
vercel
```

Следуйте инструкциям:
- Set up and deploy? → `Y`
- Which scope? → выберите ваш аккаунт
- Link to existing project? → `N`
- What's your project's name? → `ref-service`
- In which directory is your code located? → `./`

## 4. Настройка переменных окружения

После деплоя настройте переменные в панели Vercel:

1. Перейдите в ваш проект на [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Добавьте:
   ```
   SUPABASE_URL = https://jisldsqqxbcumhekwzem.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc2xkc3FxeGJjdW1oZWt3emVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAxNTksImV4cCI6MjA3Njk4NjE1OX0.w-xGepxlMuCVIxkMtuZouJKMHCgtDfY6P1_9qqaxYuo
   ```

## 5. Передеплой с переменными
```bash
vercel --prod
```

## 6. Тестирование через Postman

### Импорт коллекции:
1. Откройте Postman
2. Import → выберите `postman/RefService-API.postman_collection.json`
3. Import → выберите `postman/RefService-Environment.postman_environment.json`

### Настройка URL:
1. В коллекции измените переменную `baseUrl` на ваш Vercel URL
2. Выберите окружение "RefService Environment"

### Тестирование:
1. **Health Check** - проверка статуса
2. **Process JSON Data** - отправка данных
3. **Get All Records** - получение записей

## 📋 Готовые файлы для деплоя:

- ✅ `vercel.json` - конфигурация Vercel
- ✅ `package.json` - обновлен для Vercel
- ✅ `DEPLOY.md` - подробная инструкция
- ✅ `postman/` - коллекция для тестирования

## 🔗 После деплоя:

Ваш API будет доступен по адресу:
`https://ref-service-xxx.vercel.app`

Проверьте работу:
```bash
curl https://your-url.vercel.app/health
```
