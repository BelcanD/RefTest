-- Создание таблицы для хранения данных пользователей
CREATE TABLE IF NOT EXISTS user_identities (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    identity_data JSONB NOT NULL,
    last_sign_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_identities_email ON user_identities(email);
CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_provider ON user_identities(provider);
CREATE INDEX IF NOT EXISTS idx_user_identities_processed_at ON user_identities(processed_at);

-- Создание уникального индекса для предотвращения дублирования
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_identities_unique 
ON user_identities(id, provider, provider_id);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE user_identities IS 'Таблица для хранения данных идентификации пользователей';
COMMENT ON COLUMN user_identities.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN user_identities.email IS 'Email адрес пользователя';
COMMENT ON COLUMN user_identities.user_id IS 'ID пользователя в системе';
COMMENT ON COLUMN user_identities.provider IS 'Провайдер аутентификации (google, facebook, etc.)';
COMMENT ON COLUMN user_identities.created_at IS 'Дата создания записи в оригинальной системе';
COMMENT ON COLUMN user_identities.updated_at IS 'Дата последнего обновления записи';
COMMENT ON COLUMN user_identities.provider_id IS 'ID пользователя у провайдера';
COMMENT ON COLUMN user_identities.identity_data IS 'Дополнительные данные от провайдера в формате JSON';
COMMENT ON COLUMN user_identities.last_sign_in_at IS 'Дата последнего входа';
COMMENT ON COLUMN user_identities.processed_at IS 'Дата обработки записи нашим сервисом';

