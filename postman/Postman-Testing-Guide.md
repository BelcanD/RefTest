# Тестирование RefService через Postman

## Импорт коллекции

1. Откройте Postman
2. Нажмите "Import" в левом верхнем углу
3. Выберите файл `postman/RefService-API.postman_collection.json`
4. Коллекция "RefService API" будет добавлена

## Настройка переменных

1. В коллекции "RefService API" нажмите на три точки (...)
2. Выберите "Edit"
3. Перейдите на вкладку "Variables"
4. Измените значение `baseUrl` на ваш URL деплоя Vercel:
   ```
   https://your-project-name.vercel.app
   ```

## Тестирование API

### 1. Health Check (GET /health)

**Цель:** Проверка работоспособности сервиса

**Шаги:**
1. Выберите запрос "Health Check"
2. Нажмите "Send"

**Ожидаемый ответ:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX:XX:XX.XXXZ",
  "service": "RefService"
}
```

### 2. Process JSON Data (POST /process)

**Цель:** Отправка JSON данных напрямую

**Шаги:**
1. Выберите запрос "Process JSON Data"
2. В теле запроса уже есть пример данных
3. Нажмите "Send"

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "Данные успешно обработаны",
  "data": [
    {
      "id": "53de3e5d-3421-4d74-b255-fe322c7f0b53",
      "email": "belcandd@gmail.com",
      "user_id": "75983ce4-5e9b-48ef-a0ad-164f04a7421c",
      "provider": "google",
      "created_at": "2025-10-24T13:03:10.999288+00:00",
      "updated_at": "2025-10-24T13:03:10.999288+00:00",
      "provider_id": "108457488958606932343",
      "identity_data": {...},
      "last_sign_in_at": "2025-10-24T13:03:10.999239+00:00",
      "processed_at": "2025-01-XX:XX:XX.XXX+00:00"
    }
  ]
}
```

### 3. Upload JSON File (POST /upload)

**Цель:** Загрузка JSON файла

**Шаги:**
1. Выберите запрос "Upload JSON File"
2. В разделе "Body" → "form-data"
3. В поле "jsonFile" выберите "File" вместо "Text"
4. Нажмите "Select Files" и выберите файл `examples/sample-data.json`
5. Нажмите "Send"

**Ожидаемый ответ:** Аналогичен предыдущему

### 4. Get All Records (GET /records)

**Цель:** Получение всех записей из базы данных

**Шаги:**
1. Выберите запрос "Get All Records"
2. Нажмите "Send"

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "53de3e5d-3421-4d74-b255-fe322c7f0b53",
      "email": "belcandd@gmail.com",
      "user_id": "75983ce4-5e9b-48ef-a0ad-164f04a7421c",
      "provider": "google",
      "created_at": "2025-10-24T13:03:10.999288+00:00",
      "updated_at": "2025-10-24T13:03:10.999288+00:00",
      "provider_id": "108457488958606932343",
      "identity_data": {...},
      "last_sign_in_at": "2025-10-24T13:03:10.999239+00:00",
      "processed_at": "2025-01-XX:XX:XX.XXX+00:00"
    }
  ]
}
```

## Тестирование ошибок

### Неверный JSON формат

**Тест:** Отправьте невалидный JSON в `/process`

**Ожидаемый ответ:**
```json
{
  "error": "Ошибка при обработке данных",
  "details": "Unexpected token..."
}
```

### Неподдерживаемый тип операции

**Тест:** Измените `"type": "INSERT"` на `"type": "UPDATE"` в `/process`

**Ожидаемый ответ:**
```json
{
  "error": "Ошибка при обработке данных",
  "details": "Неподдерживаемый тип операции: UPDATE"
}
```

## Автоматическое тестирование

### Создание тестов в Postman

Добавьте следующие тесты в каждый запрос:

**Health Check:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has status OK", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("OK");
});
```

**Process JSON Data:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Data contains email", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data[0].email).to.eql("belcandd@gmail.com");
});
```

**Get All Records:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is successful", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Data is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

## Запуск коллекции

1. Нажмите на коллекцию "RefService API"
2. Выберите вкладку "Tests"
3. Нажмите "Run collection"
4. Выберите все запросы
5. Нажмите "Run RefService API"

## Мониторинг

После успешного тестирования проверьте данные в Supabase:
1. Откройте панель Supabase
2. Перейдите в "Table Editor"
3. Выберите таблицу "user_identities"
4. Убедитесь, что данные записались корректно
