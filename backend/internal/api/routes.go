package api

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
)

func SetupRoutes(handlers *Handlers, jwtAuth *jwtauth.JWTAuth) http.Handler {
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
		r.Get("/auth/telegram", handlers.AuthTelegram)
		r.Post("/auth/telegram", handlers.AuthTelegram)
		r.Get("/auth/yandex", handlers.AuthYandex)
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(jwtAuth))
		r.Use(jwtauth.Authenticator)
		r.Use(userContextMiddleware)

		r.Post("/projects", handlers.CreateProject)
		r.Post("/projects/{id}/vote", handlers.Vote)
		r.Get("/profile", handlers.GetProfile)
		r.Get("/votes", handlers.GetUserVotes)
	})

	return r
}

func userContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Извлекаем user_id из JWT токена и добавляем в контекст
		_, claims, err := jwtauth.FromContext(r.Context())
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if userID, ok := claims["user_id"].(float64); ok {
			ctx := context.WithValue(r.Context(), "user_id", int64(userID))
			next.ServeHTTP(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
		}
	})
}
