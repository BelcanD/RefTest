import { supabaseClient } from '../config/supabase';

export interface ReferralUser {
  id: string;
  email: string;
  ref_code: string;
  ref_parent: string | null;
  ref_tree: any;
  plan_type: 'free' | 'active';
  balance_eur: number;
  balance_jbc: number;
  kyc_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Генерация уникального реферального кода
 */
export function generateRefCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Генерируем код длиной 6 символов
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Создание пользователя с реферальным кодом
 */
export async function createUserWithRef(email: string, refParentCode?: string): Promise<ReferralUser | null> {
  try {
    // Генерируем уникальный ref_code
    let refCode = generateRefCode();
    
    // Проверяем уникальность кода
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabaseClient
        .from('users')
        .select('ref_code')
        .eq('ref_code', refCode)
        .single();
      
      if (!existing) break;
      
      refCode = generateRefCode();
      attempts++;
    }
    
    // Получаем родителя по коду, если указан
    let refParent: string | null = null;
    let refTree: any = null;
    
    if (refParentCode) {
      const { data: parent } = await supabaseClient
        .from('users')
        .select('id, ref_tree')
        .eq('ref_code', refParentCode)
        .single();
      
      if (parent) {
        refParent = parent.id;
        
        // Обновляем дерево родителей
        if (parent.ref_tree) {
          refTree = {
            ...parent.ref_tree,
            // Добавляем текущего родителя в начало цепи
            chain: [parent.id, ...(parent.ref_tree.chain || [])]
          };
        } else {
          refTree = {
            chain: [parent.id],
            level: 1
          };
        }
      }
    }
    
    // Создаем пользователя
    const { data: user, error } = await supabaseClient
      .from('users')
      .insert([
        {
          email,
          ref_code: refCode,
          ref_parent: refParent,
          ref_tree: refTree,
          plan_type: 'free',
          balance_eur: 0,
          balance_jbc: 0,
          kyc_status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Ошибка при создании пользователя:', error);
      return null;
    }
    
    // Если есть родитель, начисляем JBC
    if (refParent) {
      await awardReferralRewards(user.id, refParent, refTree?.level || 1);
    }
    
    console.log('Пользователь создан с реферальным кодом:', user);
    return user;
    
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return null;
  }
}

/**
 * Начисление реферальных вознаграждений
 */
export async function awardReferralRewards(
  newUserId: string,
  parentId: string,
  level: number
): Promise<void> {
  try {
    if (level > 12) return; // Максимум 12 уровней
    
    // Вычисляем количество JBC по формуле: 1 / 2^(level-1)
    const jbcAmount = 1 / Math.pow(2, level - 1);
    
    // Создаем транзакцию
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert([
        {
          user_id: parentId,
          type: 'jbc',
          amount: jbcAmount,
          level: level,
          status: 'confirmed',
          source_user: newUserId
        }
      ]);
    
    if (transactionError) {
      console.error('Ошибка при создании транзакции:', transactionError);
      return;
    }
    
    // Обновляем баланс пользователя
    const { data: user } = await supabaseClient
      .from('users')
      .select('balance_jbc')
      .eq('id', parentId)
      .single();
    
    if (user) {
      const newBalance = (user.balance_jbc || 0) + jbcAmount;
      
      await supabaseClient
        .from('users')
        .update({ balance_jbc: newBalance })
        .eq('id', parentId);
    }
    
    console.log(`Начислено ${jbcAmount} JBC пользователю ${parentId} за уровень ${level}`);
    
    // Если есть родитель родителя, продолжаем цепочку
    const { data: grandParent } = await supabaseClient
      .from('users')
      .select('id, ref_parent')
      .eq('id', parentId)
      .single();
    
    if (grandParent?.ref_parent && level < 12) {
      await awardReferralRewards(newUserId, grandParent.ref_parent, level + 1);
    }
    
  } catch (error) {
    console.error('Ошибка при начислении вознаграждений:', error);
  }
}

/**
 * Получение информации о пользователе по email
 */
export async function getUserByEmail(email: string): Promise<ReferralUser | null> {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Ошибка при получении пользователя:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
}

/**
 * Получение реферальной ссылки пользователя
 */
export function getReferralLink(refCode: string): string {
  return `jobsy.com/ref/${refCode}`;
}

/**
 * Получение статистики рефералов
 */
export async function getReferralStats(userId: string) {
  try {
    // Получаем количество прямых рефералов
    const { data: directRefs } = await supabaseClient
      .from('users')
      .select('id')
      .eq('ref_parent', userId);
    
    // Получаем общий баланс
    const { data: user } = await supabaseClient
      .from('users')
      .select('balance_eur, balance_jbc')
      .eq('id', userId)
      .single();
    
    // Получаем историю транзакций
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    return {
      directReferrals: directRefs?.length || 0,
      balanceEur: user?.balance_eur || 0,
      balanceJbc: user?.balance_jbc || 0,
      transactions: transactions || []
    };
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    return null;
  }
}
