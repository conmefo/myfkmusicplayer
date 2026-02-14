package handler

import (
	"net/http"

	"github.com/conmefo/myfkmusicplayer/server/internal/service"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) RegisterUser(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}
	user, err := h.userService.RegisterUser(req.Email, req.Password)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"id": user.ID, "email": user.Email})
}

func (h *UserHandler) LoginUser(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}
	user, accessCookie, refreshCookie, err := h.userService.LoginUser(req.Email, req.Password)
	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid email or password"})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(accessCookie.Name, accessCookie.Value, accessCookie.MaxAge, accessCookie.Path, accessCookie.Domain, accessCookie.Secure, accessCookie.HttpOnly)
	c.SetCookie(refreshCookie.Name, refreshCookie.Value, refreshCookie.MaxAge, refreshCookie.Path, refreshCookie.Domain, refreshCookie.Secure, refreshCookie.HttpOnly)
	c.JSON(200, gin.H{"id": user.ID, "email": user.Email})
}
