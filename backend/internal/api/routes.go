package api

import (
	"context"
	"net/http"
	"startup-scout/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
)

func SetupRoutes(handlers *Handlers, jwtAuth *jwtauth.JWTAuth, userRepo repository.UserRepository) http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
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

		// Auth routes
		r.Get("/auth/yandex", handlers.AuthYandex)
		r.Post("/auth/email/register", handlers.RegisterEmail)
		r.Post("/auth/email/login", handlers.AuthEmail)
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(jwtAuth))
		r.Use(jwtauth.Authenticator)
		r.Use(userContextMiddleware(userRepo))

		r.Post("/projects", handlers.CreateProject)
		r.Post("/projects/{id}/vote", handlers.Vote)
		r.Post("/projects/{id}/comments", handlers.CreateComment)
		r.Put("/comments/{commentId}", handlers.UpdateComment)
		r.Delete("/comments/{commentId}", handlers.DeleteComment)
		r.Get("/profile", handlers.GetProfile)
		r.Get("/votes", handlers.GetUserVotes)
		r.Post("/auth/telegram/link", handlers.LinkTelegram)
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

			if userIDFloat, ok := claims["user_id"].(float64); ok {
				userID := int64(userIDFloat)

				// Проверяем, что пользователь существует
				user, err := userRepo.GetByID(r.Context(), userID)
				if err != nil || user == nil {
					http.Error(w, "User not found", http.StatusUnauthorized)
					return
				}

				ctx := context.WithValue(r.Context(), "user_id", userID)
				next.ServeHTTP(w, r.WithContext(ctx))
			} else {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
			}
		})
	}
}
