package handler

import (
	"github.com/conmefo/myfkmusicplayer/server/internal/service"
	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	SearchService *service.SearchService
}

func NewSearchHandler(searchService *service.SearchService) *SearchHandler {
	return &SearchHandler{SearchService: searchService}
}

func (h *SearchHandler) SearchTracks(c *gin.Context) {
	query := c.Query("q")
	tracks, err := h.SearchService.Search(query)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, tracks)
}
