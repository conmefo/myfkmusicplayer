package router

import (
	"os"
	"time"

	"github.com/conmefo/myfkmusicplayer/server/internal/http/handler"
	"github.com/conmefo/myfkmusicplayer/server/internal/http/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type Router struct {
	userHandler   *handler.UserHandler
	searchHandler *handler.SearchHandler
}

func SetupRouter(userHandler *handler.UserHandler, searchHandler *handler.SearchHandler) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/users/register", userHandler.RegisterUser)
	r.POST("/users/login", userHandler.LoginUser)

	api := r.Group("/api")

	godotenv.Load()

	secretKey := os.Getenv("JWT_SECRET")

	println("Secret Key:", secretKey)

	api.Use(middleware.AuthMiddleware([]byte(secretKey)))
	{
		api.GET("/search", searchHandler.SearchTracks)
	}

	return r
}
