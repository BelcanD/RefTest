import fs from 'fs';
import { supabaseClient } from '../config/supabase';

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

  try {
    if (filePath) {
      // Читаем JSON из файла
      console.log('Чтение файла:', filePath);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    } else if (jsonData) {
      // Используем переданные данные
      console.log('Использование переданных данных');
      data = jsonData;
    } else {
      throw new Error('Не предоставлены данные для обработки');
    }

    console.log('Полученные данные:', JSON.stringify(data, null, 2));

    // Проверяем тип операции
    if (data.type !== 'INSERT') {
      throw new Error(`Неподдерживаемый тип операции: ${data.type}`);
    }

    // Проверяем таблицу
    if (data.table !== 'identities') {
      throw new Error(`Неподдерживаемая таблица: ${data.table}`);
    }

    // Проверяем наличие record
    if (!data.record) {
      throw new Error('Отсутствует поле record в данных');
    }

    // Извлекаем необходимые данные
    const { id, email, user_id, provider, created_at, updated_at, provider_id, identity_data, last_sign_in_at } = data.record;

    // Проверяем обязательные поля
    if (!id || !email || !user_id || !provider) {
      throw new Error(`Отсутствуют обязательные поля: id=${!!id}, email=${!!email}, user_id=${!!user_id}, provider=${!!provider}`);
    }

    // Подготавливаем данные для вставки в нашу таблицу
    const insertData = {
      id,
      email,
      user_id,
      provider,
      created_at,
      updated_at,
      provider_id,
      identity_data: JSON.stringify(identity_data),
      last_sign_in_at,
      processed_at: new Date().toISOString()
    };

    console.log('Данные для вставки:', JSON.stringify(insertData, null, 2));

    // Вставляем данные в базу данных
    const { data: result, error } = await supabaseClient
      .from('user_identities')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Ошибка Supabase:', error);
      throw new Error(`Ошибка базы данных: ${error.message}`);
    }

    console.log('Данные успешно записаны в базу данных:', result);
    return result;
  } catch (error) {
    console.error('Детальная ошибка:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Неизвестная ошибка: ${JSON.stringify(error)}`);
    }
  }
}

