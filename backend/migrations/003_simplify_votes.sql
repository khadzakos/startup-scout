-- Упрощаем систему голосования - убираем downvotes и vote_type

-- Удаляем старую таблицу votes
DROP TABLE IF EXISTS votes CASCADE;

-- Создаем новую таблицу votes (только лайки)
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    launch_id BIGINT REFERENCES launches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id, launch_id)
);

-- Убираем поле downvotes из projects
ALTER TABLE projects DROP COLUMN IF EXISTS downvotes;

-- Обновляем рейтинг проектов (теперь рейтинг = количество лайков)
UPDATE projects SET rating = upvotes WHERE rating IS NOT NULL;

-- Создаем индексы
CREATE INDEX idx_votes_user_project_launch ON votes(user_id, project_id, launch_id);
CREATE INDEX idx_votes_project ON votes(project_id);
