import fs from 'fs';
import { supabaseClient } from '../config/supabase';
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
    const { data: existing, error: checkError } = await supabaseClient
      .from('user_identities')
      .select('*')
      .eq('id', id)
      .single();

    let result;

    if (checkError && checkError.code === 'PGRST116') {
      // Пользователь не найден - создаем нового
      console.log(`Создание нового пользователя: ${email}`);
      
      const { data: insertResult, error: insertError } = await supabaseClient
        .from('user_identities')
        .insert([insertData])
        .select();

      if (insertError) {
        throw insertError;
      }

      result = insertResult;
      console.log('Данные успешно записаны в базу данных:', result);
    } else if (existing) {
      // Пользователь уже существует - обновляем только processed_at
      console.log(`Пользователь уже существует: ${email}`);
      
      const { data: updateResult, error: updateError } = await supabaseClient
        .from('user_identities')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (updateError) {
        throw updateError;
      }

      result = updateResult;
      console.log('Данные успешно обновлены:', result);
    }

    // Генерируем и сохраняем реферальный код для пользователя
    if (result && result.length > 0) {
      try {
        const referralLink = await processUserRefCode(id, email);
        console.log(`Реферальная ссылка создана: ${referralLink}`);
        
        // Добавляем реферальную ссылку к результату
        result[0].referral_link = referralLink;
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

