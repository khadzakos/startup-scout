# Startup Scout

Platform that showcases new and innovative products, services, and tech creations to a community of early adopters, entrepreneurs, investors, and tech enthusiasts

## Функционал MVP

1. **Витрина проектов** - обновляется каждую неделю, ранжируется по рейтингу
2. **Система голосования** - upvote/downvote с авторизацией через Telegram или Яндекс
3. **Карточки проектов** - детальная информация о проектах
4. **Личный кабинет** - профиль пользователя и история голосов

## Технологический стек

- **Backend**: Go, Chi (роутер), JWT аутентификация
- **База данных**: PostgreSQL
- **Логирование**: Zap
- **Контейнеризация**: Docker, Docker Compose

## Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- Go 1.21+ (для локальной разработки)

### Запуск с Docker

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd startup-scout
```

2. Запустите приложение:
```bash
docker-compose up -d
```

3. Приложение будет доступно по адресу: http://localhost:8080

### Локальная разработка

1. Установите зависимости:
```bash
go mod tidy
```

2. Запустите базу данных:
```bash
docker-compose up postgres -d
```

3. Запустите приложение:
```bash
go run cmd/app/main.go
```

## API Endpoints

### Публичные endpoints

- `GET /projects` - получить список проектов активного запуска
- `GET /projects/{id}` - получить детали проекта
- `GET /auth/telegram` - аутентификация через Telegram
- `GET /auth/yandex` - аутентификация через Яндекс

### Защищенные endpoints (требуют JWT токен)

- `POST /projects` - создать новый проект
- `POST /projects/{id}/vote` - проголосовать за проект
- `GET /profile` - получить профиль пользователя
- `GET /votes` - получить историю голосов пользователя

## Конфигурация

Настройки приложения задаются через переменные окружения:

```bash
# Сервер
SERVER_PORT=8080
SERVER_READ_TIMEOUT=30s
SERVER_WRITE_TIMEOUT=30s

# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=startup_scout
DB_SSLMODE=disable


# Аутентификация
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
YANDEX_CLIENT_ID=your_yandex_client_id
YANDEX_CLIENT_SECRET=your_yandex_client_secret
JWT_SECRET=your_jwt_secret
SESSION_DURATION=24h

# Логирование
LOG_LEVEL=info
```

## Структура проекта

```
startup-scout/
├── cmd/app/           # Точка входа приложения
├── config/            # Конфигурация
├── internal/
│   ├── api/          # HTTP handlers и роуты
│   ├── auth/         # Аутентификация
│   ├── entities/     # Модели данных
│   ├── infrastructure/ # Внешние зависимости
│   ├── repository/   # Интерфейсы репозиториев
│   └── services/     # Бизнес-логика
├── migrations/       # SQL миграции
├── pkg/             # Публичные пакеты
├── Dockerfile
├── docker-compose.yml
└── go.mod
```

## Разработка

### Добавление новых функций

1. Создайте модель в `internal/entities/`
2. Добавьте интерфейс репозитория в `internal/repository/`
3. Реализуйте бизнес-логику в `internal/services/`
4. Создайте HTTP handler в `internal/api/`
5. Добавьте роут в `internal/api/routes.go`

### Миграции базы данных

Добавьте новые SQL файлы в папку `migrations/` с префиксом номера версии.

## Лицензия

MIT
