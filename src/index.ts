import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { processJsonFile } from './services/jsonProcessor';
import { supabaseClient } from './config/supabase';
import { 
  createUserWithRef, 
  getUserByEmail, 
  getReferralLink,
  getReferralStats 
} from './services/referralService';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Только JSON файлы разрешены'));
    }
  }
});

// Маршрут для загрузки JSON файла
app.post('/upload', upload.single('jsonFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    const filePath = req.file.path;
    const result = await processJsonFile(filePath);
    
    // Удаляем временный файл
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'Данные успешно обработаны',
      data: result
    });
  } catch (error) {
    console.error('Ошибка при обработке файла:', error);
    res.status(500).json({ 
      error: 'Ошибка при обработке файла',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Маршрут для прямой отправки JSON данных
app.post('/process', async (req, res) => {
  try {
    const jsonData = req.body;
    const result = await processJsonFile(null, jsonData);
    
    res.json({
      success: true,
      message: 'Данные успешно обработаны',
      data: result
    });
  } catch (error) {
    console.error('Ошибка при обработке данных:', error);
    res.status(500).json({ 
      error: 'Ошибка при обработке данных',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Маршрут для проверки статуса сервиса
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'RefService'
  });
});

// Маршрут для получения всех записей из базы данных
app.get('/records', async (req, res) => {
  try {
    const { data, error } = await supabaseClient
      .from('user_identities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении записей',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Маршрут для регистрации с реферальным кодом
app.post('/api/referral/register', async (req, res) => {
  try {
    const { email, refParentCode } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email обязателен' });
    }
    
    // Проверяем, существует ли пользователь
    let user = await getUserByEmail(email);
    
    if (!user) {
      // Создаем нового пользователя
      user = await createUserWithRef(email, refParentCode);
    }
    
    if (!user) {
      return res.status(500).json({ error: 'Не удалось создать пользователя' });
    }
    
    const referralLink = getReferralLink(user.ref_code);
    
    res.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        id: user.id,
        email: user.email,
        ref_code: user.ref_code,
        referral_link: referralLink
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ 
      error: 'Ошибка при регистрации',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Маршрут для получения реферальной ссылки по email
app.get('/api/referral/link', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email обязателен' });
    }
    
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const referralLink = getReferralLink(user.ref_code);
    
    res.json({
      success: true,
      data: {
        ref_code: user.ref_code,
        referral_link: referralLink
      }
    });
  } catch (error) {
    console.error('Ошибка при получении ссылки:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении ссылки',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Маршрут для получения статистики рефералов
app.get('/api/referral/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId обязателен' });
    }
    
    const stats = await getReferralStats(userId);
    
    if (!stats) {
      return res.status(404).json({ error: 'Статистика не найдена' });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении статистики',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Маршрут для получения информации о пользователе по email
app.get('/api/referral/user', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email обязателен' });
    }
    
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const referralLink = getReferralLink(user.ref_code);
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        ref_code: user.ref_code,
        referral_link: referralLink,
        plan_type: user.plan_type,
        balance_eur: user.balance_eur,
        balance_jbc: user.balance_jbc,
        kyc_status: user.kyc_status,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении пользователя',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

app.listen(port, () => {
  console.log(`Сервис запущен на порту ${port}`);
  console.log(`API доступен по адресу: http://localhost:${port}`);
});

