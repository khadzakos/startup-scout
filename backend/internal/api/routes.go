package api

import (
	"context"
	"net/http"
	"startup-scout/internal/entities"
	"startup-scout/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
)

func SetupRoutes(handlers *Handlers, jwtAuth *jwtauth.JWTAuth, userRepo repository.UserRepository) http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://startup-scout.ru", "https://www.startup-scout.ru", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Public routes
	r.Group(func(r chi.Router) {
		r.Get("/projects", handlers.GetProjects)
		r.Get("/projects/{id}", handlers.GetProject)
		r.Get("/projects/{id}/comments", handlers.GetProjectComments)
		r.Get("/stats", handlers.GetStats)

		// Image routes (public access to view images)
		r.Get("/images/{filename}", handlers.GetImage)
		r.Head("/images/{filename}", handlers.GetImage)

		// Auth routes
		r.Post("/auth/email/register", handlers.RegisterEmail)
		r.Post("/auth/email/login", handlers.AuthEmail)
		r.Post("/auth/logout", handlers.Logout)
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(cookieJWTVerifier(jwtAuth))
		r.Use(jwtauth.Verifier(jwtAuth))
		r.Use(jwtauth.Authenticator)
		r.Use(userContextMiddleware(userRepo))

		r.Post("/projects", handlers.CreateProject)
		r.Get("/users/{id}/projects", handlers.GetUserProjects)
		r.Post("/projects/{id}/vote", handlers.Vote)
		r.Delete("/projects/{id}/vote", handlers.RemoveVote)
		r.Post("/projects/{id}/comments", handlers.CreateComment)
		r.Put("/comments/{commentId}", handlers.UpdateComment)
		r.Delete("/comments/{commentId}", handlers.DeleteComment)
		r.Get("/profile", handlers.GetProfile)
		r.Put("/profile", handlers.UpdateProfile)
		r.Put("/profile/avatar", handlers.UpdateAvatar)
		r.Get("/votes", handlers.GetUserVotes)
		r.Post("/auth/telegram/link", handlers.LinkTelegram)

		// Image upload (protected)
		r.Post("/images/upload", handlers.UploadImage)
	})

	return r
}

func userContextMiddleware(userRepo repository.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, claims, err := jwtauth.FromContext(r.Context())
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Извлекаем данные пользователя из JWT claims
			userIDString, ok := claims["user_id"].(string)
			if !ok {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			userID, err := uuid.Parse(userIDString)
			if err != nil {
				http.Error(w, "Invalid user ID format", http.StatusUnauthorized)
				return
			}

			// Создаем объект пользователя из claims (кеш в JWT)
			user := &entities.User{
				ID:        userID,
				Email:     getStringFromClaims(claims, "email"),
				Username:  getStringFromClaims(claims, "username"),
				Avatar:    getStringFromClaims(claims, "avatar"),
				FirstName: getStringFromClaims(claims, "first_name"),
				LastName:  getStringFromClaims(claims, "last_name"),
			}

			// Добавляем пользователя в контекст
			ctx := context.WithValue(r.Context(), "user", user)
			ctx = context.WithValue(ctx, "user_id", userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// cookieJWTVerifier извлекает JWT токен из cookies и добавляет в контекст
func cookieJWTVerifier(jwtAuth *jwtauth.JWTAuth) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Извлекаем токен из cookie
			cookie, err := r.Cookie("auth_token")
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			// Добавляем токен в заголовок Authorization для jwtauth
			r.Header.Set("Authorization", "Bearer "+cookie.Value)
			
			next.ServeHTTP(w, r)
		})
	}
}

// getStringFromClaims безопасно извлекает строку из claims
func getStringFromClaims(claims map[string]interface{}, key string) string {
	if value, ok := claims[key].(string); ok {
		return value
	}
	return ""
}

