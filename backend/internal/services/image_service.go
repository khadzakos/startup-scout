package services

import (
	"crypto/md5"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"startup-scout/config"

	"github.com/google/uuid"
)

type ImageService struct {
	config *config.StorageConfig
}

// GetConfig возвращает конфигурацию хранилища (для доступа из handlers)
func (s *ImageService) GetConfig() *config.StorageConfig {
	return s.config
}

func NewImageService(cfg *config.StorageConfig) *ImageService {
	// Создаем директорию для загрузок если её нет
	if cfg.Type == "local" {
		if err := os.MkdirAll(cfg.LocalPath, 0755); err != nil {
			panic(fmt.Sprintf("Failed to create uploads directory: %v", err))
		}
	}

	return &ImageService{
		config: cfg,
	}
}

// UploadImage загружает изображение и возвращает URL
func (s *ImageService) UploadImage(file *multipart.FileHeader) (string, error) {
	// Проверяем размер файла
	if file.Size > s.config.MaxFileSize {
		return "", fmt.Errorf("file size exceeds maximum allowed size of %d bytes", s.config.MaxFileSize)
	}

	// Открываем файл
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %v", err)
	}
	defer src.Close()

	// Читаем первые 512 байт для определения MIME типа
	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil && err != io.EOF {
		return "", fmt.Errorf("failed to read file header: %v", err)
	}

	// Определяем MIME тип
	mimeType := http.DetectContentType(buffer)
	if !s.isAllowedMimeType(mimeType) {
		return "", fmt.Errorf("file type %s is not allowed", mimeType)
	}

	// Возвращаемся к началу файла
	if _, err := src.Seek(0, 0); err != nil {
		return "", fmt.Errorf("failed to seek to beginning of file: %v", err)
	}

	// Генерируем уникальное имя файла
	fileName := s.generateFileName(file.Filename, mimeType)

	// Сохраняем файл
	if s.config.Type == "local" {
		return s.saveToLocal(src, fileName)
	}

	return "", fmt.Errorf("unsupported storage type: %s", s.config.Type)
}

// GetImageURL возвращает полный URL изображения
func (s *ImageService) GetImageURL(fileName string) string {
	if s.config.Type == "local" {
		return fmt.Sprintf("%s/%s", s.config.BaseURL, fileName)
	}
	return ""
}

// DeleteImage удаляет изображение
func (s *ImageService) DeleteImage(fileName string) error {
	if s.config.Type == "local" {
		filePath := filepath.Join(s.config.LocalPath, fileName)
		return os.Remove(filePath)
	}
	return fmt.Errorf("unsupported storage type: %s", s.config.Type)
}

// isAllowedMimeType проверяет, разрешен ли MIME тип
func (s *ImageService) isAllowedMimeType(mimeType string) bool {
	for _, allowedType := range s.config.AllowedTypes {
		if mimeType == allowedType {
			return true
		}
	}
	return false
}

// generateFileName генерирует уникальное имя файла
func (s *ImageService) generateFileName(originalName, mimeType string) string {
	// Получаем расширение из MIME типа
	ext := s.getExtensionFromMimeType(mimeType)

	// Генерируем уникальный хеш
	hash := md5.Sum([]byte(fmt.Sprintf("%s-%d", originalName, time.Now().UnixNano())))
	hashStr := fmt.Sprintf("%x", hash)

	// Создаем UUID для дополнительной уникальности
	id := uuid.New().String()

	return fmt.Sprintf("%s_%s%s", id[:8], hashStr[:8], ext)
}

// getExtensionFromMimeType возвращает расширение файла на основе MIME типа
func (s *ImageService) getExtensionFromMimeType(mimeType string) string {
	switch mimeType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	default:
		return ".jpg" // fallback
	}
}

// saveToLocal сохраняет файл локально
func (s *ImageService) saveToLocal(src io.Reader, fileName string) (string, error) {
	filePath := filepath.Join(s.config.LocalPath, fileName)

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return fileName, nil
}
