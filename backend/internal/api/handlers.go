package api

import (
	"encoding/json"
	"net/http"
	"startup-scout/internal/entities"
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
	logger         *zap.Logger
	jwtAuth        *jwtauth.JWTAuth
}

func NewHandlers(
	projectService *services.ProjectService,
	authService *services.AuthService,
	commentService *services.CommentService,
	logger *zap.Logger,
	jwtAuth *jwtauth.JWTAuth,
) *Handlers {
	return &Handlers{
		projectService: projectService,
		authService:    authService,
		commentService: commentService,
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

func (h *Handlers) AuthYandex(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Authorization code is required", http.StatusBadRequest)
		return
	}

	user, err := h.authService.AuthenticateYandex(r.Context(), code)
	if err != nil {
		h.logger.Error("failed to authenticate yandex", zap.Error(err))
		http.Error(w, "Authentication failed", http.StatusUnauthorized)
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
		http.Error(w, err.Error(), http.StatusBadRequest)
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
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
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

	comments, err := h.commentService.GetProjectComments(r.Context(), projectID)
	if err != nil {
		h.logger.Error("failed to get project comments", zap.Error(err))
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if comments == nil {
		comments = []*entities.Comment{}
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
