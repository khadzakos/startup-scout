package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"startup-scout/internal/entities"
	"startup-scout/internal/errors"
	"startup-scout/internal/repository"
	"startup-scout/internal/services"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Handlers struct {
	projectService *services.ProjectService
	authService    *services.AuthService
	commentService *services.CommentService
	imageService   *services.ImageService
	userRepo       repository.UserRepository
	logger         *zap.Logger
	jwtAuth        *jwtauth.JWTAuth
}

func NewHandlers(
	projectService *services.ProjectService,
	authService *services.AuthService,
	commentService *services.CommentService,
	imageService *services.ImageService,
	userRepo repository.UserRepository,
	logger *zap.Logger,
	jwtAuth *jwtauth.JWTAuth,
) *Handlers {
	return &Handlers{
		projectService: projectService,
		authService:    authService,
		commentService: commentService,
		imageService:   imageService,
		userRepo:       userRepo,
		logger:         logger,
		jwtAuth:        jwtAuth,
	}
}

// Projects handlers
func (h *Handlers) GetProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.projectService.GetActiveLaunchProjects(r.Context())
	if err != nil {
		h.logger.Error("failed to get projects", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if projects == nil {
		projects = []*entities.Project{}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"projects": projects,
	})
}

func (h *Handlers) GetProject(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	project, err := h.projectService.GetProject(r.Context(), projectID)
	if err != nil {
		h.logger.Error("failed to get project", zap.Error(err), zap.String("project_id", projectIDStr))
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(project)
}

func (h *Handlers) CreateProject(w http.ResponseWriter, r *http.Request) {
	var project entities.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Получаем пользователя из контекста (после аутентификации)
	userID := r.Context().Value("user_id").(uuid.UUID)

	project.UserID = userID

	if err := h.projectService.CreateProject(r.Context(), &project); err != nil {
		h.logger.Error("failed to create project", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(project)
}

func (h *Handlers) Vote(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		h.logger.Error("failed to parse project ID", zap.Error(err), zap.String("project_id", projectIDStr))
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	h.logger.Info("Vote request received", zap.String("project_id", projectIDStr))

	// Получаем пользователя из контекста (после аутентификации)
	userID := r.Context().Value("user_id").(uuid.UUID)

	h.logger.Info("Processing vote",
		zap.String("user_id", userID.String()),
		zap.String("project_id", projectIDStr))

	if err := h.projectService.Vote(r.Context(), userID, projectID); err != nil {
		h.logger.Error("failed to vote", zap.Error(err),
			zap.String("user_id", userID.String()),
			zap.String("project_id", projectIDStr))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	h.logger.Info("Vote processed successfully",
		zap.String("user_id", userID.String()),
		zap.String("project_id", projectIDStr))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// RemoveVote удаляет голос пользователя за проект
func (h *Handlers) RemoveVote(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		h.logger.Error("failed to parse project ID for remove vote", zap.Error(err), zap.String("project_id", projectIDStr))
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	// Получаем пользователя из контекста (после аутентификации)
	userID := r.Context().Value("user_id").(uuid.UUID)

	h.logger.Info("Remove vote request received",
		zap.String("user_id", userID.String()),
		zap.String("project_id", projectIDStr))

	if err := h.projectService.RemoveVote(r.Context(), userID, projectID); err != nil {
		h.logger.Error("failed to remove vote", zap.Error(err),
			zap.String("user_id", userID.String()),
			zap.String("project_id", projectIDStr))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	h.logger.Info("Vote removed successfully",
		zap.String("user_id", userID.String()),
		zap.String("project_id", projectIDStr))

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// Email регистрация
func (h *Handlers) RegisterEmail(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.authService.RegisterEmail(r.Context(), request.Email, request.Username, request.Password)
	if err != nil {
		h.logger.Error("failed to register user", zap.Error(err))

		var errorMessage string
		var statusCode int

		switch err {
		case errors.ErrEmailExists:
			errorMessage = "Пользователь с таким email уже существует"
			statusCode = http.StatusConflict
		case errors.ErrUsernameExists:
			errorMessage = "Пользователь с таким именем уже существует"
			statusCode = http.StatusConflict
		default:
			errorMessage = "Ошибка регистрации"
			statusCode = http.StatusInternalServerError
		}

		http.Error(w, errorMessage, statusCode)
		return
	}

	_, tokenString, err := h.jwtAuth.Encode(map[string]interface{}{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	if err != nil {
		h.logger.Error("failed to create JWT token", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

// Email авторизация
func (h *Handlers) AuthEmail(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.authService.AuthenticateEmail(r.Context(), request.Email, request.Password)
	if err != nil {
		h.logger.Error("failed to authenticate email", zap.Error(err))

		var errorMessage string
		var statusCode int

		switch err {
		case errors.ErrUserNotFound:
			errorMessage = "Пользователь с таким email не найден"
			statusCode = http.StatusNotFound
		case errors.ErrInvalidPassword:
			errorMessage = "Неверный пароль"
			statusCode = http.StatusUnauthorized
		default:
			errorMessage = "Ошибка аутентификации"
			statusCode = http.StatusInternalServerError
		}

		http.Error(w, errorMessage, statusCode)
		return
	}

	_, tokenString, err := h.jwtAuth.Encode(map[string]interface{}{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	if err != nil {
		h.logger.Error("failed to create JWT token", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

// Связывание Telegram с пользователем
func (h *Handlers) LinkTelegram(w http.ResponseWriter, r *http.Request) {
	// Получаем пользователя из контекста (после аутентификации)
	userID := r.Context().Value("user_id").(uuid.UUID)

	var data map[string]string
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		h.logger.Error("failed to decode telegram link data", zap.Error(err))
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.authService.LinkTelegramToUser(r.Context(), userID, data); err != nil {
		h.logger.Error("failed to link telegram", zap.Error(err))
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func (h *Handlers) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(uuid.UUID)

	// TODO: Получить профиль пользователя из базы данных
	// Пока возвращаем базовую информацию
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id": userID,
		"message": "Profile endpoint - to be implemented",
	})
}

func (h *Handlers) GetUserVotes(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(uuid.UUID)

	votes, err := h.projectService.GetUserVotes(r.Context(), userID)
	if err != nil {
		h.logger.Error("failed to get user votes", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"votes": votes,
	})
}

func (h *Handlers) GetUserProjects(w http.ResponseWriter, r *http.Request) {
	userIDStr := chi.URLParam(r, "id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Проверяем, что пользователь запрашивает свои проекты
	requestingUserID := r.Context().Value("user_id").(uuid.UUID)
	if requestingUserID != userID {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	projects, err := h.projectService.GetUserProjects(r.Context(), userID)
	if err != nil {
		h.logger.Error("failed to get user projects", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"projects": projects,
	})
}

// Comment handlers
func (h *Handlers) GetProjectComments(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	comments, err := h.commentService.GetProjectCommentsWithUsers(r.Context(), projectID)
	if err != nil {
		h.logger.Error("failed to get project comments", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if comments == nil {
		comments = []*entities.CommentWithUser{}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"comments": comments,
	})
}

func (h *Handlers) CreateComment(w http.ResponseWriter, r *http.Request) {
	projectIDStr := chi.URLParam(r, "id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		http.Error(w, "Invalid project ID", http.StatusBadRequest)
		return
	}

	var request struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if request.Content == "" {
		http.Error(w, "Comment content is required", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(uuid.UUID)

	comment, err := h.commentService.CreateComment(r.Context(), userID, projectID, request.Content)
	if err != nil {
		h.logger.Error("failed to create comment", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}

func (h *Handlers) UpdateComment(w http.ResponseWriter, r *http.Request) {
	commentIDStr := chi.URLParam(r, "commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		http.Error(w, "Invalid comment ID", http.StatusBadRequest)
		return
	}

	var request struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if request.Content == "" {
		http.Error(w, "Comment content is required", http.StatusBadRequest)
		return
	}

	userID := r.Context().Value("user_id").(uuid.UUID)

	if err := h.commentService.UpdateComment(r.Context(), commentID, userID, request.Content); err != nil {
		h.logger.Error("failed to update comment", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func (h *Handlers) DeleteComment(w http.ResponseWriter, r *http.Request) {
	commentIDStr := chi.URLParam(r, "commentId")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		http.Error(w, "Invalid comment ID", http.StatusBadRequest)
		return
	}

	// Получаем пользователя из контекста (после аутентификации)
	userID := r.Context().Value("user_id").(uuid.UUID)

	if err := h.commentService.DeleteComment(r.Context(), commentID, userID); err != nil {
		h.logger.Error("failed to delete comment", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// GetStats возвращает общую статистику сайта
func (h *Handlers) GetStats(w http.ResponseWriter, r *http.Request) {
	// Получаем количество активных пользователей
	userCount, err := h.userRepo.GetTotalCount(r.Context())
	if err != nil {
		h.logger.Error("failed to get user count", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Получаем количество активных проектов
	projects, err := h.projectService.GetActiveLaunchProjects(r.Context())
	if err != nil {
		h.logger.Error("failed to get projects for stats", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	projectCount := 0
	if projects != nil {
		projectCount = len(projects)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_count":    userCount,
		"project_count": projectCount,
	})
}

// Image handlers
func (h *Handlers) UploadImage(w http.ResponseWriter, r *http.Request) {
	// Проверяем аутентификацию
	_, claims, err := jwtauth.FromContext(r.Context())
	if err != nil {
		h.logger.Error("failed to get JWT claims", zap.Error(err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		h.logger.Error("user_id not found in JWT claims")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Error("invalid user_id in JWT claims", zap.Error(err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Парсим multipart form
	err = r.ParseMultipartForm(32 << 20) // 32 MB max
	if err != nil {
		h.logger.Error("failed to parse multipart form", zap.Error(err))
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		h.logger.Error("failed to get uploaded file", zap.Error(err))
		http.Error(w, "No image file provided", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Загружаем изображение
	fileName, err := h.imageService.UploadImage(fileHeader)
	if err != nil {
		h.logger.Error("failed to upload image", zap.Error(err))
		http.Error(w, "Failed to upload image", http.StatusInternalServerError)
		return
	}

	// Возвращаем URL изображения
	imageURL := h.imageService.GetImageURL(fileName)

	h.logger.Info("image uploaded successfully",
		zap.String("user_id", userID.String()),
		zap.String("file_name", fileName),
		zap.String("image_url", imageURL))

	// Устанавливаем Content-Type и записываем JSON ответ
	response := map[string]interface{}{
		"success":   true,
		"file_name": fileName,
		"image_url": imageURL,
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		h.logger.Error("failed to marshal response", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handlers) GetImage(w http.ResponseWriter, r *http.Request) {
	fileName := chi.URLParam(r, "filename")
	h.logger.Info("GetImage called", zap.String("filename", fileName), zap.String("method", r.Method))

	if fileName == "" {
		h.logger.Error("Filename is empty")
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}

	// Проверяем, что файл существует (для безопасности)
	filePath := filepath.Join(h.imageService.GetConfig().LocalPath, fileName)
	h.logger.Info("Looking for file", zap.String("file_path", filePath))

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		h.logger.Error("File not found", zap.String("file_path", filePath), zap.Error(err))
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	h.logger.Info("Serving file", zap.String("file_path", filePath))
	// Отдаем файл
	http.ServeFile(w, r, filePath)
}

// UpdateAvatar обновляет аватарку пользователя
func (h *Handlers) UpdateAvatar(w http.ResponseWriter, r *http.Request) {
	// Проверяем аутентификацию
	_, claims, err := jwtauth.FromContext(r.Context())
	if err != nil {
		h.logger.Error("failed to get JWT claims", zap.Error(err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		h.logger.Error("user_id not found in JWT claims")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Error("invalid user_id in JWT claims", zap.Error(err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Парсим JSON запрос
	var request struct {
		Avatar string `json:"avatar"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("failed to decode request", zap.Error(err))
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if request.Avatar == "" {
		http.Error(w, "Avatar URL is required", http.StatusBadRequest)
		return
	}

	// Обновляем аватарку пользователя
	err = h.userRepo.UpdateAvatar(r.Context(), userID, request.Avatar)
	if err != nil {
		h.logger.Error("failed to update avatar", zap.Error(err))
		http.Error(w, "Failed to update avatar", http.StatusInternalServerError)
		return
	}

	h.logger.Info("avatar updated successfully", zap.String("user_id", userID.String()))

	// Возвращаем успешный ответ
	response := map[string]interface{}{
		"success": true,
		"message": "Avatar updated successfully",
		"avatar":  request.Avatar,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateProfile обновляет профиль пользователя
func (h *Handlers) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	// Проверяем аутентификацию
	_, claims, err := jwtauth.FromContext(r.Context())
	if err != nil {
		h.logger.Error("failed to get JWT claims", zap.Error(err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		h.logger.Error("user_id not found in JWT claims")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Error("invalid user_id in JWT claims", zap.Error(err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Парсим JSON запрос
	var request struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.logger.Error("failed to decode request", zap.Error(err))
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Получаем текущего пользователя
	user, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil {
		h.logger.Error("failed to get user", zap.Error(err))
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Обновляем поля
	if request.FirstName != "" {
		user.FirstName = request.FirstName
	}
	if request.LastName != "" {
		user.LastName = request.LastName
	}
	if request.Username != "" {
		user.Username = request.Username
	}

	// Сохраняем изменения
	err = h.userRepo.Update(r.Context(), user)
	if err != nil {
		h.logger.Error("failed to update profile", zap.Error(err))
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	h.logger.Info("profile updated successfully", zap.String("user_id", userID.String()))

	// Возвращаем обновленного пользователя
	response := map[string]interface{}{
		"success": true,
		"message": "Profile updated successfully",
		"user":    user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
