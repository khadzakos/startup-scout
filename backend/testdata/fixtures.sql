-- Test fixtures for startup-scout project
-- This file contains test data for all entities

-- Clear existing data (for clean test runs)
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE launches CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE launches_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE votes_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;

-- Test Users
INSERT INTO users (username, email, avatar, auth_type, auth_id, created_at, updated_at) VALUES
('testuser1', 'user1@test.com', 'https://t.me/i/userpic/320/user1.jpg', 'telegram', '123456789', NOW(), NOW()),
('testuser2', 'user2@test.com', 'https://t.me/i/userpic/320/user2.jpg', 'telegram', '987654321', NOW(), NOW()),
('testuser3', 'user3@test.com', 'https://t.me/i/userpic/320/user3.jpg', 'yandex', 'yandex_user_123', NOW(), NOW()),
('john_doe', 'john@startup.com', 'https://t.me/i/userpic/320/john.jpg', 'telegram', '111222333', NOW(), NOW()),
('jane_smith', 'jane@startup.com', 'https://t.me/i/userpic/320/jane.jpg', 'telegram', '444555666', NOW(), NOW());

-- Test Launches
INSERT INTO launches (name, start_date, end_date, is_active, created_at, updated_at) VALUES
('Weekly Launch #1', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', true, NOW(), NOW()),
('Weekly Launch #2', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days', false, NOW(), NOW()),
('Monthly Launch #1', NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days', true, NOW(), NOW()),
('Test Launch (Past)', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days', false, NOW(), NOW()),
('Future Launch', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days', false, NOW(), NOW());

-- Test Projects
INSERT INTO projects (name, description, full_description, images, creators, telegram_contact, website, upvotes, downvotes, rating, launch_id, created_at, updated_at) VALUES
('TaskMaster Pro', 'Умный планировщик задач с ИИ', 'TaskMaster Pro - это революционное приложение для управления задачами, которое использует искусственный интеллект для автоматической приоритизации и планирования ваших дел. Приложение анализирует ваши привычки, сроки и важность задач, чтобы создать оптимальный план на день.', ARRAY['https://example.com/taskmaster1.jpg', 'https://example.com/taskmaster2.jpg'], ARRAY['Иван Петров', 'Мария Сидорова'], '@taskmaster_support', 'https://taskmaster.pro', 15, 2, 13, 1, NOW(), NOW()),
('EcoTracker', 'Отслеживание экологического следа', 'EcoTracker помогает пользователям отслеживать и уменьшать их экологический след. Приложение анализирует повседневные действия и предлагает экологически дружественные альтернативы.', ARRAY['https://example.com/ecotracker1.jpg'], ARRAY['Алексей Зеленый'], '@ecotracker_bot', 'https://ecotracker.app', 8, 1, 7, 1, NOW(), NOW()),
('FitFlow', 'Персональный фитнес-тренер', 'FitFlow создает персонализированные программы тренировок на основе ваших целей, уровня подготовки и доступного оборудования. Приложение адаптируется к вашему прогрессу и корректирует программу.', ARRAY['https://example.com/fitflow1.jpg', 'https://example.com/fitflow2.jpg', 'https://example.com/fitflow3.jpg'], ARRAY['Анна Фитнес', 'Дмитрий Тренер'], '@fitflow_support', 'https://fitflow.fit', 22, 3, 19, 1, NOW(), NOW()),
('CodeMentor', 'ИИ-помощник для программистов', 'CodeMentor - это интеллектуальный помощник для разработчиков, который анализирует код, предлагает улучшения и помогает решать сложные задачи программирования.', ARRAY['https://example.com/codementor1.jpg'], ARRAY['Сергей Разработчик'], '@codementor_help', 'https://codementor.ai', 12, 5, 7, 1, NOW(), NOW()),
('PetCare Plus', 'Уход за домашними животными', 'PetCare Plus помогает владельцам домашних животных отслеживать здоровье, питание и активность своих питомцев. Приложение напоминает о вакцинации, кормлении и прогулках.', ARRAY['https://example.com/petcare1.jpg'], ARRAY['Елена Ветеринар'], '@petcare_support', 'https://petcare.plus', 6, 2, 4, 1, NOW(), NOW()),
('BudgetWise', 'Умное управление бюджетом', 'BudgetWise автоматически категоризирует расходы, анализирует траты и предлагает способы экономии. Приложение помогает достичь финансовых целей.', ARRAY['https://example.com/budgetwise1.jpg'], ARRAY['Михаил Финансист'], '@budgetwise_bot', 'https://budgetwise.money', 18, 4, 14, 1, NOW(), NOW()),
('StudyBuddy', 'Платформа для совместного обучения', 'StudyBuddy соединяет студентов для совместного изучения предметов, обмена знаниями и подготовки к экзаменам. Платформа включает в себя виртуальные комнаты для учебы.', ARRAY['https://example.com/studybuddy1.jpg'], ARRAY['Ольга Преподаватель', 'Павел Студент'], '@studybuddy_help', 'https://studybuddy.edu', 9, 1, 8, 1, NOW(), NOW()),
('HomeChef', 'Персональный кулинарный помощник', 'HomeChef предлагает рецепты на основе доступных ингредиентов, создает списки покупок и помогает планировать меню на неделю.', ARRAY['https://example.com/homechef1.jpg', 'https://example.com/homechef2.jpg'], ARRAY['Татьяна Шеф'], '@homechef_recipes', 'https://homechef.cook', 11, 2, 9, 1, NOW(), NOW());

-- Test Votes
INSERT INTO votes (user_id, project_id, launch_id, vote_type, created_at) VALUES
(1, 1, 1, 'up', NOW() - INTERVAL '2 hours'),
(1, 2, 1, 'up', NOW() - INTERVAL '1 hour'),
(1, 3, 1, 'down', NOW() - INTERVAL '30 minutes'),
(2, 1, 1, 'up', NOW() - INTERVAL '3 hours'),
(2, 3, 1, 'up', NOW() - INTERVAL '2 hours'),
(2, 4, 1, 'up', NOW() - INTERVAL '1 hour'),
(3, 1, 1, 'up', NOW() - INTERVAL '4 hours'),
(3, 2, 1, 'down', NOW() - INTERVAL '3 hours'),
(3, 5, 1, 'up', NOW() - INTERVAL '2 hours'),
(4, 1, 1, 'up', NOW() - INTERVAL '5 hours'),
(4, 3, 1, 'up', NOW() - INTERVAL '4 hours'),
(4, 6, 1, 'up', NOW() - INTERVAL '3 hours'),
(5, 1, 1, 'up', NOW() - INTERVAL '6 hours'),
(5, 2, 1, 'up', NOW() - INTERVAL '5 hours'),
(5, 7, 1, 'up', NOW() - INTERVAL '4 hours'),
(1, 4, 1, 'up', NOW() - INTERVAL '1 hour'),
(2, 5, 1, 'up', NOW() - INTERVAL '2 hours'),
(3, 6, 1, 'up', NOW() - INTERVAL '3 hours'),
(4, 7, 1, 'up', NOW() - INTERVAL '4 hours'),
(5, 8, 1, 'up', NOW() - INTERVAL '5 hours'),
(1, 6, 1, 'down', NOW() - INTERVAL '30 minutes'),
(2, 7, 1, 'down', NOW() - INTERVAL '1 hour'),
(3, 8, 1, 'down', NOW() - INTERVAL '2 hours');

-- Test Comments
INSERT INTO comments (user_id, project_id, content, created_at, updated_at) VALUES
(1, 1, 'Отличная идея! Очень нужное приложение для продуктивности.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(2, 1, 'Попробовал бета-версию, очень удобно!', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
(3, 2, 'Экология - важная тема. Поддерживаю!', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
(4, 3, 'Тренировки стали намного эффективнее с этим приложением', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
(5, 4, 'Помогло решить сложную задачу по программированию', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
(1, 5, 'Удобно отслеживать здоровье питомца', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
(2, 6, 'Научился лучше управлять бюджетом', NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours'),
(3, 7, 'Отличная платформа для студентов', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
(4, 8, 'Рецепты очень вкусные и простые в приготовлении', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours'),
(5, 1, 'Когда планируется релиз?', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
(1, 2, 'Будут ли интеграции с другими экологическими приложениями?', NOW() - INTERVAL '11 hours', NOW() - INTERVAL '11 hours'),
(2, 3, 'Поддерживает ли приложение различные виды спорта?', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

-- Update project ratings based on votes
UPDATE projects SET 
    upvotes = (SELECT COUNT(*) FROM votes WHERE project_id = projects.id AND vote_type = 'up'),
    downvotes = (SELECT COUNT(*) FROM votes WHERE project_id = projects.id AND vote_type = 'down'),
    rating = (SELECT COUNT(*) FROM votes WHERE project_id = projects.id AND vote_type = 'up') - 
             (SELECT COUNT(*) FROM votes WHERE project_id = projects.id AND vote_type = 'down');
