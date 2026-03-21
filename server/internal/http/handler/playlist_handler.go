package handler

import (
	"net/http"
	"strconv"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
	"github.com/conmefo/myfkmusicplayer/server/internal/service"
	"github.com/gin-gonic/gin"
)

type PlaylistHandler struct {
	playlistService *service.PlaylistService
	userService     *service.UserService
}

func NewPlaylistHandler(playlistService *service.PlaylistService, userService *service.UserService) *PlaylistHandler {
	return &PlaylistHandler{
		playlistService: playlistService,
		userService:     userService,
	}
}
func (h *PlaylistHandler) getUserID(c *gin.Context) (int64, error) {
	email, exists := c.Get("userEmail")
	if !exists {
		return 0, http.ErrNoCookie
	}

	user, err := h.userService.GetUserByEmail(email.(string))
	if err != nil {
		return 0, err
	}

	return user.ID, nil
}

func (h *PlaylistHandler) CreatePlaylist(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	playlist, err := h.playlistService.CreatePlaylist(userID, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, playlist)
}

func (h *PlaylistHandler) GetUserPlaylists(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	playlists, err := h.playlistService.GetUserPlaylists(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if playlists == nil {
		playlists = []model.Playlist{}
	}

	c.JSON(http.StatusOK, playlists)
}

func (h *PlaylistHandler) AddTrackToPlaylist(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	playlistID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playlist ID"})
		return
	}

	var track model.Track
	if err := c.ShouldBindJSON(&track); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track payload"})
		return
	}

	err = h.playlistService.AddTrackToPlaylist(userID, playlistID, track)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Track added successfully"})
}

func (h *PlaylistHandler) RemoveTrackFromPlaylist(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	playlistID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playlist ID"})
		return
	}

	trackID := c.Param("trackId")

	err = h.playlistService.RemoveTrackFromPlaylist(userID, playlistID, trackID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Track removed successfully"})
}

func (h *PlaylistHandler) ReorderTracks(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	playlistID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playlist ID"})
		return
	}

	var req struct {
		TrackIDs []string `json:"trackIds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || len(req.TrackIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track order payload"})
		return
	}

	if err := h.playlistService.ReorderTracks(userID, playlistID, req.TrackIDs); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Track order updated"})
}

func (h *PlaylistHandler) GetPlaylistTracks(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	playlistID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playlist ID"})
		return
	}

	tracks, err := h.playlistService.GetPlaylistTracks(userID, playlistID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tracks)
}

func (h *PlaylistHandler) DeletePlaylist(c *gin.Context) {
	userID, err := h.getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	playlistID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid playlist ID"})
		return
	}

	err = h.playlistService.DeletePlaylist(userID, playlistID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Playlist deleted successfully"})
}
