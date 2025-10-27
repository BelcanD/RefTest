# Тестовые данные для RefService

## Использование

### Тестовый файл с одним пользователем
Используйте файл `examples/test-users/user1.json` для тестирования отправки одного пользователя.

### Тестовый файл со всеми пользователями
Используйте файл `examples/test-data.json` для массового тестирования (содержит 10 пользователей в массиве).

## Команды для тестирования

### 1. Отправка одного пользователя через Postman
- Method: POST
- URL: http://localhost:3000/process
- Body: raw JSON
- Скопируйте содержимое из `examples/test-users/user1.json`

### 2. Отправка через curl
```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d @examples/test-users/user1.json
```

### 3. Отправка из файла
```bash
curl -X POST -F "jsonFile=@examples/test-users/user1.json" http://localhost:3000/upload
```

## Список тестовых пользователей

1. **user1@example.com** - John Doe (Google)
2. **user2@example.com** - Jane Smith (Google)
3. **user3@example.com** - Alice Johnson (GitHub)
4. **user4@example.com** - Bob Wilson (Facebook)
5. **user5@example.com** - Charlie Brown (Google)
6. **user6@example.com** - David Martinez (GitHub)
7. **user7@example.com** - Eva Thompson (Google)
8. **user8@example.com** - Frank Lee (Facebook)
9. **user9@example.com** - Grace White (Google)
10. **user10@example.com** - Henry Taylor (GitHub)

## Проверка результата

После отправки каждого пользователя:
- Проверьте логи сервиса (должен появиться реферальный код)
- Проверьте базу данных Supabase (таблица `user_identities`)
- Должен быть создан уникальный `ref_code` для каждого пользователя

## Примечания

- Все ID генерируются уникальными
- Email адреса тестовые и не используются в реальной системе
- Каждый пользователь будет иметь свой уникальный реферальный код
