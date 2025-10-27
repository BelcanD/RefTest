import { supabaseClient } from '../config/supabase';

/**
 * Генерация уникального реферального кода
 */
function generateRefCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Генерируем код длиной 6 символов
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Генерация уникального реферального кода с проверкой в базе данных
 * @returns Реферальный код
 */
export async function generateUniqueRefCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const refCode = generateRefCode();
    
    // Проверяем, существует ли этот код в базе
    const { data, error } = await supabaseClient
      .from('user_identities')
      .select('ref_code')
      .eq('ref_code', refCode)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Код не найден - можем использовать
      return refCode;
    }
    
    if (data) {
      // Код уже существует - генерируем новый
      attempts++;
      continue;
    }
    
    // Если произошла другая ошибка
    break;
  }
  
  // Если не удалось сгенерировать уникальный код за maxAttempts попыток
  throw new Error('Не удалось сгенерировать уникальный реферальный код');
}

/**
 * Сохранение реферального кода в базу данных
 * @param id - ID пользователя
 * @param refCode - Реферальный код
 */
export async function saveRefCodeToDatabase(id: string, refCode: string): Promise<void> {
  const { error } = await supabaseClient
    .from('user_identities')
    .update({ ref_code: refCode })
    .eq('id', id);
  
  if (error) {
    console.error('Ошибка при сохранении реферального кода:', error);
    throw new Error('Не удалось сохранить реферальный код');
  }
}

/**
 * Получение реферальной ссылки по email
 * @param email - Email пользователя
 * @returns Реферальная ссылка или null если пользователь не найден
 */
export async function getReferralLinkByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('user_identities')
    .select('ref_code')
    .eq('email', email)
    .single();
  
  if (error || !data || !data.ref_code) {
    return null;
  }
  
  return `jobsy.com/ref/${data.ref_code}`;
}

/**
 * Обработка пользователя: генерация и сохранение реферального кода
 * @param id - ID пользователя
 * @param email - Email пользователя
 * @returns Реферальная ссылка
 */
export async function processUserRefCode(id: string, email: string): Promise<string> {
  try {
    // Проверяем, есть ли уже реферальный код у этого пользователя
    const { data: existing, error: fetchError } = await supabaseClient
      .from('user_identities')
      .select('ref_code')
      .eq('id', id)
      .single();
    
    if (existing && existing.ref_code) {
      // Код уже существует, возвращаем его
      console.log(`Реферальный код уже существует для пользователя ${email}: ${existing.ref_code}`);
      return `jobsy.com/ref/${existing.ref_code}`;
    }
    
    // Генерируем новый уникальный код
    const refCode = await generateUniqueRefCode();
    
    // Сохраняем код в базу данных
    const { error: saveError } = await supabaseClient
      .from('user_identities')
      .update({ ref_code: refCode })
      .eq('id', id);
    
    if (saveError) {
      console.error('Ошибка при сохранении реферального кода:', saveError);
      throw new Error('Не удалось сохранить реферальный код');
    }
    
    console.log(`Реферальный код ${refCode} успешно создан и сохранен для пользователя ${email}`);
    
    return `jobsy.com/ref/${refCode}`;
    
  } catch (error) {
    console.error('Ошибка при обработке реферального кода:', error);
    throw error;
  }
}
