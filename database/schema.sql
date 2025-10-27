-- Создание таблицы для хранения данных пользователей (email, id и реферальная ссылка)
CREATE TABLE IF NOT EXISTS user_identities (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ref_code VARCHAR(10) UNIQUE,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_identities_email ON user_identities(email);
CREATE INDEX IF NOT EXISTS idx_user_identities_ref_code ON user_identities(ref_code);
CREATE INDEX IF NOT EXISTS idx_user_identities_processed_at ON user_identities(processed_at);

-- Создание уникального индекса для предотвращения дублирования
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_identities_unique 
ON user_identities(id);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE user_identities IS 'Таблица для хранения email и id пользователей';
COMMENT ON COLUMN user_identities.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN user_identities.email IS 'Email адрес пользователя';
COMMENT ON COLUMN user_identities.processed_at IS 'Дата обработки записи нашим сервисом';

