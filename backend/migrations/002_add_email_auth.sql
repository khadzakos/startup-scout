-- Добавляем поддержку email авторизации
ALTER TABLE users 
ADD COLUMN password_hash VARCHAR(255),
ADD COLUMN telegram_id BIGINT,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Создаем индекс для email
CREATE INDEX idx_users_email ON users(email);

-- Создаем индекс для telegram_id
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Добавляем уникальность для email
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE(email);

-- Обновляем существующих пользователей
UPDATE users SET auth_type = 'email' WHERE auth_type IS NULL;
