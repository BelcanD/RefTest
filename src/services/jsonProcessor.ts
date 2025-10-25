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
    // Вставляем данные в базу данных
    const { data: result, error } = await supabaseClient
      .from('user_identities')
      .insert([insertData])
      .select();

    if (error) {
      throw error;
    }

    console.log('Данные успешно записаны в базу данных:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при записи в базу данных:', error);
    throw error;
  }
}

