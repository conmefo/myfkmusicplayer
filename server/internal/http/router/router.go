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
	userHandler     *handler.UserHandler
	searchHandler   *handler.SearchHandler
	playlistHandler *handler.PlaylistHandler
}

func SetupRouter(userHandler *handler.UserHandler, searchHandler *handler.SearchHandler, playlistHandler *handler.PlaylistHandler) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"http://34.21.161.107:3000",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")

	api.POST("/users/register", userHandler.RegisterUser)
	api.POST("/users/login", userHandler.LoginUser)
	api.POST("/users/refresh", userHandler.RefreshToken)
	api.POST("/users/logout", userHandler.LogoutUser)

	godotenv.Load()

	secretKey := os.Getenv("JWT_SECRET")

	api.Use(middleware.AuthMiddleware([]byte(secretKey)))
	{
		api.GET("/search", searchHandler.SearchTracks)
		api.GET("/download", searchHandler.DownloadTrack)

		api.POST("/playlists", playlistHandler.CreatePlaylist)
		api.GET("/playlists", playlistHandler.GetUserPlaylists)
		api.DELETE("/playlists/:id", playlistHandler.DeletePlaylist)
		api.POST("/playlists/:id/tracks", playlistHandler.AddTrackToPlaylist)
		api.GET("/playlists/:id/tracks", playlistHandler.GetPlaylistTracks)
		api.DELETE("/playlists/:id/tracks/:trackId", playlistHandler.RemoveTrackFromPlaylist)
		api.POST("/playlists/:id/reorder", playlistHandler.ReorderTracks)
	}

	return r
}
