import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { processJsonFile } from './services/jsonProcessor';
import { supabaseClient } from './config/supabase';

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
      details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
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
      details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
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

app.listen(port, () => {
  console.log(`Сервис запущен на порту ${port}`);
  console.log(`API доступен по адресу: http://localhost:${port}`);
});

