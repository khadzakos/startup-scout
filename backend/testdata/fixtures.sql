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
-- Текущий активный запуск (начинается в понедельник 00:00, заканчивается в воскресенье 23:59)
INSERT INTO launches (id, name, start_date, end_date, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Weekly Launch #3', 
    -- Начало: понедельник этой недели в 00:00
    DATE_TRUNC('week', NOW()) + INTERVAL '1 day' + INTERVAL '0 hours',
    -- Конец: воскресенье этой недели в 23:59:59
    DATE_TRUNC('week', NOW()) + INTERVAL '7 days' + INTERVAL '23 hours' + INTERVAL '59 minutes' + INTERVAL '59 seconds',
    true, NOW(), NOW()),

-- Предыдущий завершенный запуск (прошлая неделя)
('550e8400-e29b-41d4-a716-446655440102', 'Weekly Launch #2', 
    -- Начало: понедельник прошлой недели в 00:00
    DATE_TRUNC('week', NOW()) - INTERVAL '6 days' + INTERVAL '1 day' + INTERVAL '0 hours',
    -- Конец: воскресенье прошлой недели в 23:59:59
    DATE_TRUNC('week', NOW()) + INTERVAL '1 day' + INTERVAL '23 hours' + INTERVAL '59 minutes' + INTERVAL '59 seconds',
    false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

-- Еще более старый завершенный запуск (2 недели назад)
('550e8400-e29b-41d4-a716-446655440103', 'Weekly Launch #1', 
    -- Начало: понедельник 2 недели назад в 00:00
    DATE_TRUNC('week', NOW()) - INTERVAL '13 days' + INTERVAL '1 day' + INTERVAL '0 hours',
    -- Конец: воскресенье 2 недели назад в 23:59:59
    DATE_TRUNC('week', NOW()) - INTERVAL '6 days' + INTERVAL '1 day' + INTERVAL '23 hours' + INTERVAL '59 minutes' + INTERVAL '59 seconds',
    false, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),

-- Очень старый завершенный запуск (2 месяца назад)
('550e8400-e29b-41d4-a716-446655440104', 'Weekly Launch #0', 
    -- Начало: понедельник 2 месяца назад в 00:00
    DATE_TRUNC('week', NOW() - INTERVAL '60 days') + INTERVAL '1 day' + INTERVAL '0 hours',
    -- Конец: воскресенье 2 месяца назад в 23:59:59
    DATE_TRUNC('week', NOW() - INTERVAL '60 days') + INTERVAL '7 days' + INTERVAL '23 hours' + INTERVAL '59 minutes' + INTERVAL '59 seconds',
    false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days');

-- Test Projects (using UUIDs for launch_id and user_id)
-- Проекты для текущего активного запуска (Weekly Launch #3)
INSERT INTO projects (id, name, description, full_description, logo, images, creators, telegram_contact, website, upvotes, rating, launch_id, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'TaskMaster Pro', 'Умный планировщик задач с ИИ', 'TaskMaster Pro - это революционное приложение для управления задачами, которое использует искусственный интеллект для автоматической приоритизации и планирования ваших дел. Приложение анализирует ваши привычки, сроки и важность задач, чтобы создать оптимальный план на день.', 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=TM', ARRAY['https://example.com/taskmaster1.jpg', 'https://example.com/taskmaster2.jpg'], ARRAY['Иван Петров', 'Мария Сидорова'], '@taskmaster_support', 'https://taskmaster.pro', 15, 15, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440202', 'EcoTracker', 'Отслеживание экологического следа', 'EcoTracker помогает пользователям отслеживать и уменьшать их экологический след. Приложение анализирует повседневные действия и предлагает экологически дружественные альтернативы.', 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=ET', ARRAY['https://example.com/ecotracker1.jpg'], ARRAY['Алексей Зеленый'], '@ecotracker_bot', 'https://ecotracker.app', 8, 8, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440203', 'FitFlow', 'Персональный фитнес-тренер', 'FitFlow создает персонализированные программы тренировок на основе ваших целей, уровня подготовки и доступного оборудования. Приложение адаптируется к вашему прогрессу и корректирует программу.', 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=FF', ARRAY['https://example.com/fitflow1.jpg', 'https://example.com/fitflow2.jpg', 'https://example.com/fitflow3.jpg'], ARRAY['Анна Фитнес', 'Дмитрий Тренер'], '@fitflow_support', 'https://fitflow.fit', 22, 22, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440204', 'CodeMentor', 'ИИ-помощник для программистов', 'CodeMentor - это интеллектуальный помощник для разработчиков, который анализирует код, предлагает улучшения и помогает решать сложные задачи программирования.', 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=CM', ARRAY['https://example.com/codementor1.jpg'], ARRAY['Сергей Разработчик'], '@codementor_help', 'https://codementor.ai', 12, 12, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440205', 'PetCare Plus', 'Уход за домашними животными', 'PetCare Plus помогает владельцам домашних животных отслеживать здоровье, питание и активность своих питомцев. Приложение напоминает о вакцинации, кормлении и прогулках.', 'https://via.placeholder.com/64x64/EF4444/FFFFFF?text=PC', ARRAY['https://example.com/petcare1.jpg'], ARRAY['Елена Ветеринар'], '@petcare_support', 'https://petcare.plus', 6, 6, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440206', 'BudgetWise', 'Умное управление бюджетом', 'BudgetWise автоматически категоризирует расходы, анализирует траты и предлагает способы экономии. Приложение помогает достичь финансовых целей.', 'https://via.placeholder.com/64x64/059669/FFFFFF?text=BW', ARRAY['https://example.com/budgetwise1.jpg'], ARRAY['Михаил Финансист'], '@budgetwise_bot', 'https://budgetwise.money', 18, 18, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440207', 'StudyBuddy', 'Платформа для совместного обучения', 'StudyBuddy соединяет студентов для совместного изучения предметов, обмена знаниями и подготовки к экзаменам. Платформа включает в себя виртуальные комнаты для учебы.', 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=SB', ARRAY['https://example.com/studybuddy1.jpg'], ARRAY['Ольга Преподаватель', 'Павел Студент'], '@studybuddy_help', 'https://studybuddy.edu', 9, 9, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440208', 'HomeChef', 'Персональный кулинарный помощник', 'HomeChef предлагает рецепты на основе доступных ингредиентов, создает списки покупок и помогает планировать меню на неделю.', 'https://via.placeholder.com/64x64/DC2626/FFFFFF?text=HC', ARRAY['https://example.com/homechef1.jpg', 'https://example.com/homechef2.jpg'], ARRAY['Татьяна Шеф'], '@homechef_recipes', 'https://homechef.cook', 11, 11, '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW());

-- Проекты для предыдущего запуска (Weekly Launch #2) - завершенного
INSERT INTO projects (id, name, description, full_description, logo, images, creators, telegram_contact, website, upvotes, rating, launch_id, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440209', 'WeatherWise', 'Умный прогноз погоды с ИИ', 'WeatherWise использует машинное обучение для точного прогнозирования погоды. Приложение анализирует данные с множества источников и предоставляет персонализированные рекомендации по одежде и планам.', 'https://via.placeholder.com/64x64/0EA5E9/FFFFFF?text=WW', ARRAY['https://example.com/weatherwise1.jpg'], ARRAY['Андрей Метеоролог'], '@weatherwise_bot', 'https://weatherwise.app', 25, 25, '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440210', 'MedTracker', 'Отслеживание здоровья и лекарств', 'MedTracker помогает пациентам отслеживать прием лекарств, записывать симптомы и вести медицинский дневник. Интегрируется с медицинскими устройствами и напоминает о приемах.', 'https://via.placeholder.com/64x64/EF4444/FFFFFF?text=MT', ARRAY['https://example.com/medtracker1.jpg'], ARRAY['Доктор Смирнов'], '@medtracker_support', 'https://medtracker.health', 19, 19, '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440211', 'TravelCompanion', 'Персональный гид для путешествий', 'TravelCompanion создает индивидуальные маршруты путешествий, находит лучшие места для посещения и помогает с бронированием. Учитывает бюджет, интересы и предпочтения пользователя.', 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=TC', ARRAY['https://example.com/travel1.jpg', 'https://example.com/travel2.jpg'], ARRAY['Мария Путешественница'], '@travel_companion', 'https://travelcompanion.trip', 14, 14, '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440212', 'SmartHome Hub', 'Управление умным домом', 'SmartHome Hub объединяет все устройства умного дома в одном приложении. Позволяет создавать сценарии автоматизации, управлять освещением, климатом и безопасностью.', 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=SH', ARRAY['https://example.com/smarthome1.jpg'], ARRAY['Алексей Технолог'], '@smarthome_hub', 'https://smarthome.hub', 21, 21, '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440213', 'LanguageBuddy', 'Изучение языков с ИИ-репетитором', 'LanguageBuddy использует искусственный интеллект для персонализированного обучения языкам. Адаптируется к темпу обучения, исправляет произношение и предлагает интересные упражнения.', 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=LB', ARRAY['https://example.com/language1.jpg'], ARRAY['Елена Лингвист'], '@language_buddy', 'https://languagebuddy.learn', 16, 16, '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Проекты для старого запуска (Weekly Launch #0) - завершенного
INSERT INTO projects (id, name, description, full_description, logo, images, creators, telegram_contact, website, upvotes, rating, launch_id, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440214', 'BookWorm', 'Социальная сеть для любителей книг', 'BookWorm объединяет читателей со всего мира. Пользователи могут делиться отзывами, создавать списки для чтения, участвовать в книжных клубах и находить новые интересные книги.', 'https://via.placeholder.com/64x64/DC2626/FFFFFF?text=BW', ARRAY['https://example.com/bookworm1.jpg'], ARRAY['Анна Библиотекарь'], '@bookworm_club', 'https://bookworm.social', 31, 31, '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),
('550e8400-e29b-41d4-a716-446655440215', 'ArtGallery VR', 'Виртуальная галерея искусств', 'ArtGallery VR позволяет посещать мировые музеи и галереи в виртуальной реальности. Пользователи могут рассматривать произведения искусства в высоком разрешении и узнавать их историю.', 'https://via.placeholder.com/64x64/8B5CF6/FFFFFF?text=AG', ARRAY['https://example.com/artgallery1.jpg'], ARRAY['Михаил Искусствовед'], '@artgallery_vr', 'https://artgallery.vr', 27, 27, '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
('550e8400-e29b-41d4-a716-446655440216', 'PlantCare', 'Уход за комнатными растениями', 'PlantCare помогает ухаживать за комнатными растениями. Приложение напоминает о поливе, подкормке и пересадке, а также диагностирует проблемы по фотографии листьев.', 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=PC', ARRAY['https://example.com/plantcare1.jpg'], ARRAY['Ольга Садовод'], '@plantcare_bot', 'https://plantcare.garden', 23, 23, '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '53 days', NOW() - INTERVAL '53 days'),
('550e8400-e29b-41d4-a716-446655440217', 'MusicMood', 'Персональный музыкальный ассистент', 'MusicMood анализирует настроение пользователя и подбирает подходящую музыку. Использует ИИ для создания плейлистов и открытия новых исполнителей.', 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=MM', ARRAY['https://example.com/musicmood1.jpg'], ARRAY['Дмитрий Музыкант'], '@musicmood_ai', 'https://musicmood.stream', 29, 29, '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '52 days', NOW() - INTERVAL '52 days'),
('550e8400-e29b-41d4-a716-446655440218', 'NewsFilter', 'Персонализированные новости', 'NewsFilter использует машинное обучение для фильтрации новостей. Показывает только релевантные новости, избегает фейков и создает персонализированную ленту.', 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=NF', ARRAY['https://example.com/newsfilter1.jpg'], ARRAY['Сергей Журналист'], '@newsfilter_ai', 'https://newsfilter.media', 33, 33, '550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '51 days', NOW() - INTERVAL '51 days');

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

-- Голоса для проектов из Weekly Launch #2 (предыдущий запуск)
INSERT INTO votes (id, user_id, project_id, launch_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440319', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '5 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440320', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '5 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440321', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '5 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440322', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '4 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440323', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '4 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440324', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '4 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440325', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '4 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440326', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '4 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440327', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '3 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440328', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '3 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440329', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '3 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440330', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '3 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440331', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '3 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440332', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '2 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440333', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '2 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440334', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '2 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440335', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '2 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440336', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '2 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440337', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440338', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '1 day' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440339', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440340', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '1 day' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440341', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '1 day' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440342', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440343', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440102', NOW() - INTERVAL '1 hour');

-- Голоса для проектов из Weekly Launch #0 (старый запуск)
INSERT INTO votes (id, user_id, project_id, launch_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440344', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '55 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440345', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '55 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440346', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '55 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440347', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '54 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440348', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '54 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440349', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '54 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440350', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '54 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440351', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '54 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440352', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '53 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440353', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '53 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440354', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '53 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440355', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '53 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440356', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '53 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440357', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '52 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440358', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '52 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440359', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '52 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440360', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '52 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440361', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '52 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440362', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '51 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440363', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '51 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440364', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '51 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440365', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '51 days' - INTERVAL '1 hour'),
('550e8400-e29b-41d4-a716-446655440366', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '51 days' - INTERVAL '30 minutes'),
('550e8400-e29b-41d4-a716-446655440367', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '50 days' - INTERVAL '2 hours'),
('550e8400-e29b-41d4-a716-446655440368', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440104', NOW() - INTERVAL '50 days' - INTERVAL '1 hour');

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
