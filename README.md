# Startup Scout

Platform that showcases new and innovative products, services, and tech creations to a community of early adopters, entrepreneurs, investors, and tech enthusiasts

<img width="1442" height="1044" alt="Screenshot 2025-09-11 at 18 52 12" src="https://github.com/user-attachments/assets/15b713e2-918a-4c01-a226-f97d65e8451e" />

## Функционал MVP

1. **Витрина проектов** - обновляется каждую неделю, ранжируется по рейтингу
2. **Система голосования** - upvote с авторизацией
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

3. Приложение будет доступно по адресу: http://localhost:3000

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

Если хотите контрибьютить в проект, то пишите мне в тг: @khadzakos

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
