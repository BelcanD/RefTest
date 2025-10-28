import fs from 'fs';
import { sql } from '../config/db';
import { processUserRefCode } from './referralService';

export interface IdentityRecord {
  id: string;
  email: string;
  user_id: string;
  provider: string;
  created_at: string;
  updated_at: string;
  provider_id: string;
  identity_data: {
    iss: string;
    sub: string;
    name: string;
    email: string;
    picture: string;
    full_name: string;
    avatar_url: string;
    provider_id: string;
    email_verified: boolean;
    phone_verified: boolean;
  };
  last_sign_in_at: string;
}

export interface JsonData {
  type: string;
  table: string;
  record: IdentityRecord;
  schema: string;
  old_record: any;
}

export async function processJsonFile(filePath?: string | null, jsonData?: JsonData): Promise<any> {
  let data: JsonData;

  if (filePath) {
    // Читаем JSON из файла
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(fileContent);
  } else if (jsonData) {
    // Используем переданные данные
    data = jsonData;
  } else {
    throw new Error('Не предоставлены данные для обработки');
  }

  // Проверяем тип операции
  if (data.type !== 'INSERT') {
    throw new Error(`Неподдерживаемый тип операции: ${data.type}`);
  }

  // Проверяем таблицу
  if (data.table !== 'identities') {
    throw new Error(`Неподдерживаемая таблица: ${data.table}`);
  }

  // Извлекаем только необходимые данные (email и id)
  const { id, email } = data.record;

  // Подготавливаем данные для вставки в нашу таблицу (только email и id)
  const insertData = {
    id,
    email,
    processed_at: new Date().toISOString()
  };

  try {
    // Проверяем, существует ли пользователь в базе
    const { rows: existingRows } = await sql`
      SELECT * FROM user_identities WHERE id = ${id} LIMIT 1
    `;

    let result: any[] = [];

    if (!existingRows || existingRows.length === 0) {
      // Пользователь не найден - создаем нового
      console.log(`Создание нового пользователя: ${email}`);

      const { rows: insertRows } = await sql`
        INSERT INTO user_identities (id, email, processed_at)
        VALUES (${insertData.id}, ${insertData.email}, ${insertData.processed_at})
        RETURNING *
      `;

      result = insertRows;
      console.log('Данные успешно записаны в базу данных:', result);
    } else {
      // Пользователь уже существует - обновляем только processed_at
      console.log(`Пользователь уже существует: ${email}`);

      const { rows: updateRows } = await sql`
        UPDATE user_identities
        SET processed_at = ${new Date().toISOString()}
        WHERE id = ${id}
        RETURNING *
      `;

      result = updateRows;
      console.log('Данные успешно обновлены:', result);
    }

    // Генерируем и сохраняем реферальный код для пользователя
    if (result && result.length > 0) {
      try {
        const referralLink = await processUserRefCode(id, email);
        console.log(`Реферальная ссылка создана: ${referralLink}`);
        
        // Добавляем реферальную ссылку к результату
        (result[0] as any).referral_link = referralLink;
      } catch (refError) {
        console.error('Ошибка при создании реферальной ссылки:', refError);
        // Не прерываем выполнение, просто логируем ошибку
      }
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка при записи в базу данных:', error);
    throw error;
  }
}

