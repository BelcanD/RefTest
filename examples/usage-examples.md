# Примеры использования RefService

## Тестирование с помощью curl

### 1. Проверка статуса сервиса
```bash
curl http://localhost:3000/health
```

### 2. Загрузка JSON файла
```bash
curl -X POST -F "jsonFile=@examples/sample-data.json" http://localhost:3000/upload
```

### 3. Прямая отправка JSON данных
```bash
curl -X POST -H "Content-Type: application/json" \
  -d @examples/sample-data.json http://localhost:3000/process
```

### 4. Получение всех записей
```bash
curl http://localhost:3000/records
```

## Тестирование с помощью JavaScript/Node.js

```javascript
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Загрузка файла
async function uploadFile() {
  const form = new FormData();
  form.append('jsonFile', fs.createReadStream('examples/sample-data.json'));
  
  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: form
  });
  
  const result = await response.json();
  console.log(result);
}

// Прямая отправка данных
async function sendData() {
  const data = JSON.parse(fs.readFileSync('examples/sample-data.json', 'utf-8'));
  
  const response = await fetch('http://localhost:3000/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  console.log(result);
}

// Получение записей
async function getRecords() {
  const response = await fetch('http://localhost:3000/records');
  const result = await response.json();
  console.log(result);
}

// Запуск тестов
uploadFile();
sendData();
getRecords();
```

## Тестирование с помощью Python

```python
import requests
import json

# Загрузка файла
def upload_file():
    url = 'http://localhost:3000/upload'
    files = {'jsonFile': open('examples/sample-data.json', 'rb')}
    
    response = requests.post(url, files=files)
    print(response.json())
    files['jsonFile'].close()

# Прямая отправка данных
def send_data():
    url = 'http://localhost:3000/process'
    
    with open('examples/sample-data.json', 'r') as f:
        data = json.load(f)
    
    response = requests.post(url, json=data)
    print(response.json())

# Получение записей
def get_records():
    url = 'http://localhost:3000/records'
    response = requests.get(url)
    print(response.json())

# Запуск тестов
upload_file()
send_data()
get_records()
```

## Тестирование с помощью Postman

### 1. Загрузка файла (POST /upload)
- Method: POST
- URL: http://localhost:3000/upload
- Body: form-data
- Key: jsonFile, Type: File, Value: выберите файл sample-data.json

### 2. Прямая отправка данных (POST /process)
- Method: POST
- URL: http://localhost:3000/process
- Headers: Content-Type: application/json
- Body: raw, JSON, скопируйте содержимое sample-data.json

### 3. Получение записей (GET /records)
- Method: GET
- URL: http://localhost:3000/records

### 4. Проверка статуса (GET /health)
- Method: GET
- URL: http://localhost:3000/health

## Ожидаемые ответы

### Успешная обработка:
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

### Ошибка:
```json
{
  "error": "Описание ошибки",
  "details": "Детали ошибки"
}
```

### Статус сервиса:
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX:XX:XX.XXXZ",
  "service": "RefService"
}
```

