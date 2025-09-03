-- Миграция: Переход на UUID и добавление user_id в projects
-- 004_migrate_to_uuid.sql

-- 1. Удаляем существующие таблицы если они есть (для чистого старта)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS launches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Создаем таблицу users с UUID
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    avatar VARCHAR(500),
    auth_type VARCHAR(20) NOT NULL,
    auth_id VARCHAR(255),
    telegram_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Создаем таблицу launches с UUID
CREATE TABLE launches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Создаем таблицу projects с UUID
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    images TEXT[],
    creators TEXT[],
    telegram_contact VARCHAR(255),
    website VARCHAR(255),
    upvotes INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    launch_id UUID NOT NULL,
    user_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Создаем таблицу votes с UUID
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    launch_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Создаем таблицу comments с UUID
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Создаем индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_launch_id ON projects(launch_id);
CREATE INDEX idx_projects_rating ON projects(rating DESC);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_project_id ON votes(project_id);
CREATE INDEX idx_votes_launch_id ON votes(launch_id);
CREATE INDEX idx_votes_user_project_launch ON votes(user_id, project_id, launch_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 8. Создаем внешние ключи
ALTER TABLE projects ADD CONSTRAINT fk_projects_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_launch_id FOREIGN KEY (launch_id) REFERENCES launches(id);
ALTER TABLE votes ADD CONSTRAINT fk_votes_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE votes ADD CONSTRAINT fk_votes_project_id FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE votes ADD CONSTRAINT fk_votes_launch_id FOREIGN KEY (launch_id) REFERENCES launches(id);
ALTER TABLE comments ADD CONSTRAINT fk_comments_project_id FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE comments ADD CONSTRAINT fk_comments_user_id FOREIGN KEY (user_id) REFERENCES users(id);

-- 9. Добавляем уникальные ограничения
ALTER TABLE votes ADD CONSTRAINT unique_user_project_launch UNIQUE(user_id, project_id, launch_id);

-- 10. Вставляем дефолтный активный launch
INSERT INTO launches (name, start_date, end_date, is_active) 
VALUES (
    'Weekly Launch #1', 
    NOW(), 
    NOW() + INTERVAL '7 days',
    TRUE
);
