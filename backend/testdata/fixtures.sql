-- Test fixtures for startup-scout project
-- This file contains test data for all entities

-- Clear existing data (for clean test runs)
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE launches CASCADE;
TRUNCATE TABLE users CASCADE;

-- Test Users (using UUIDs)
INSERT INTO users (id, username, email, avatar, auth_type, auth_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'testuser1', 'user1@test.com', 'https://t.me/i/userpic/320/user1.jpg', 'telegram', '123456789', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'testuser2', 'user2@test.com', 'https://t.me/i/userpic/320/user2.jpg', 'telegram', '987654321', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'testuser3', 'user3@test.com', 'https://t.me/i/userpic/320/user3.jpg', 'yandex', 'yandex_user_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'john_doe', 'john@startup.com', 'https://t.me/i/userpic/320/john.jpg', 'telegram', '111222333', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'jane_smith', 'jane@startup.com', 'https://t.me/i/userpic/320/jane.jpg', 'telegram', '444555666', NOW(), NOW());

-- Test Launches (using UUIDs)
INSERT INTO launches (id, name, start_date, end_date, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Weekly Launch #1', NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440102', 'Weekly Launch #2', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440103', 'Monthly Launch #1', NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440104', 'Test Launch (Past)', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440105', 'Future Launch', NOW() + INTERVAL '7 days', NOW() + INTERVAL '14 days', false, NOW(), NOW());

-- Test Projects (using UUIDs for launch_id and user_id)
INSERT INTO projects (id, name, description, full_description, images, creators, telegram_contact, website, upvotes, rating, launch_id, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'TaskMaster Pro', 'Умный планировщик задач с ИИ', 'TaskMaster Pro - это революционное приложение для управления задачами, которое использует искусственный интеллект для автоматической приоритизации и планирования ваших дел. Приложение анализирует ваши привычки, сроки и важность задач, чтобы создать оптимальный план на день.', ARRAY['https://example.com/taskmaster1.jpg', 'https://example.com/taskmaster2.jpg'], ARRAY['Иван Петров', 'Мария Сидорова'], '@taskmaster_support', 'https://taskmaster.pro', 15, 15, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440202', 'EcoTracker', 'Отслеживание экологического следа', 'EcoTracker помогает пользователям отслеживать и уменьшать их экологический след. Приложение анализирует повседневные действия и предлагает экологически дружественные альтернативы.', ARRAY['https://example.com/ecotracker1.jpg'], ARRAY['Алексей Зеленый'], '@ecotracker_bot', 'https://ecotracker.app', 8, 8, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440203', 'FitFlow', 'Персональный фитнес-тренер', 'FitFlow создает персонализированные программы тренировок на основе ваших целей, уровня подготовки и доступного оборудования. Приложение адаптируется к вашему прогрессу и корректирует программу.', ARRAY['https://example.com/fitflow1.jpg', 'https://example.com/fitflow2.jpg', 'https://example.com/fitflow3.jpg'], ARRAY['Анна Фитнес', 'Дмитрий Тренер'], '@fitflow_support', 'https://fitflow.fit', 22, 22, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440204', 'CodeMentor', 'ИИ-помощник для программистов', 'CodeMentor - это интеллектуальный помощник для разработчиков, который анализирует код, предлагает улучшения и помогает решать сложные задачи программирования.', ARRAY['https://example.com/codementor1.jpg'], ARRAY['Сергей Разработчик'], '@codementor_help', 'https://codementor.ai', 12, 12, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440205', 'PetCare Plus', 'Уход за домашними животными', 'PetCare Plus помогает владельцам домашних животных отслеживать здоровье, питание и активность своих питомцев. Приложение напоминает о вакцинации, кормлении и прогулках.', ARRAY['https://example.com/petcare1.jpg'], ARRAY['Елена Ветеринар'], '@petcare_support', 'https://petcare.plus', 6, 6, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440206', 'BudgetWise', 'Умное управление бюджетом', 'BudgetWise автоматически категоризирует расходы, анализирует траты и предлагает способы экономии. Приложение помогает достичь финансовых целей.', ARRAY['https://example.com/budgetwise1.jpg'], ARRAY['Михаил Финансист'], '@budgetwise_bot', 'https://budgetwise.money', 18, 18, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440207', 'StudyBuddy', 'Платформа для совместного обучения', 'StudyBuddy соединяет студентов для совместного изучения предметов, обмена знаниями и подготовки к экзаменам. Платформа включает в себя виртуальные комнаты для учебы.', ARRAY['https://example.com/studybuddy1.jpg'], ARRAY['Ольга Преподаватель', 'Павел Студент'], '@studybuddy_help', 'https://studybuddy.edu', 9, 9, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440208', 'HomeChef', 'Персональный кулинарный помощник', 'HomeChef предлагает рецепты на основе доступных ингредиентов, создает списки покупок и помогает планировать меню на неделю.', ARRAY['https://example.com/homechef1.jpg', 'https://example.com/homechef2.jpg'], ARRAY['Татьяна Шеф'], '@homechef_recipes', 'https://homechef.cook', 11, 11, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW());

-- Test Votes (using UUIDs for all foreign keys)
INSERT INTO votes (id, user_id, project_id, launch_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '4 hours'),
('550e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440308', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '5 hours'),
('550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '4 hours'),
('550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440311', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '6 hours'),
('550e8400-e29b-41d4-a716-446655440312', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '5 hours'),
('550e8400-e29b-41d4-a716-446655440313', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '4 hours'),
('550e8400-e29b-41d4-a716-446655440314', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440315', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440316', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440317', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '4 hours'),
('550e8400-e29b-41d4-a716-446655440318', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440101', NOW() - INTERVAL '5 hours');

-- Test Comments (using UUIDs for user_id and project_id)
INSERT INTO comments (id, user_id, project_id, content, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', 'Отличная идея! Очень нужное приложение для продуктивности.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440201', 'Попробовал бета-версию, очень удобно!', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440202', 'Экология - важная тема. Поддерживаю!', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440203', 'Тренировки стали намного эффективнее с этим приложением', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440204', 'Помогло решить сложную задачу по программированию', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440205', 'Удобно отслеживать здоровье питомца', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440206', 'Научился лучше управлять бюджетом', NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours'),
('550e8400-e29b-41d4-a716-446655440408', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440207', 'Отличная платформа для студентов', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
('550e8400-e29b-41d4-a716-446655440409', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440208', 'Рецепты очень вкусные и простые в приготовлении', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours'),
('550e8400-e29b-41d4-a716-446655440410', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440201', 'Когда планируется релиз?', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
('550e8400-e29b-41d4-a716-446655440411', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440202', 'Будут ли интеграции с другими экологическими приложениями?', NOW() - INTERVAL '11 hours', NOW() - INTERVAL '11 hours'),
('550e8400-e29b-41d4-a716-446655440412', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440203', 'Поддерживает ли приложение различные виды спорта?', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

-- Update project ratings based on votes (теперь рейтинг = количество лайков)
UPDATE projects SET 
    upvotes = (SELECT COUNT(*) FROM votes WHERE project_id = projects.id),
    rating = (SELECT COUNT(*) FROM votes WHERE project_id = projects.id);
