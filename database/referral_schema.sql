-- Создание таблицы для хранения реферальных данных
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    ref_code VARCHAR(10) NOT NULL UNIQUE,
    ref_parent UUID REFERENCES users(id),
    ref_tree JSONB,
    plan_type VARCHAR(20) DEFAULT 'free',
    balance_eur DECIMAL(10, 2) DEFAULT 0,
    balance_jbc BIGINT DEFAULT 0,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для хранения email и id из внешней системы
CREATE TABLE IF NOT EXISTS external_identities (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для транзакций
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('jbc', 'eur')),
    amount DECIMAL(10, 8) NOT NULL,
    level INT NOT NULL CHECK (level BETWEEN 1 AND 12),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    source_user UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ref_code ON users(ref_code);
CREATE INDEX IF NOT EXISTS idx_users_ref_parent ON users(ref_parent);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Политики доступа
CREATE POLICY "Allow insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow update on users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow insert on external_identities" ON external_identities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on external_identities" ON external_identities FOR SELECT USING (true);

CREATE POLICY "Allow insert on transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on transactions" ON transactions FOR SELECT USING (true);

-- Функция для генерации уникального ref_code
CREATE OR REPLACE FUNCTION generate_ref_code() RETURNS VARCHAR(10) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code VARCHAR(10);
BEGIN
    LOOP
        code := '';
        FOR i IN 1..6 LOOP
            code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
        END LOOP;
        
        EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE ref_code = code);
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;
