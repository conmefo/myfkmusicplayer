package service

import (
	"errors"
	"net/http"
	"os"
	"time"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
	"github.com/conmefo/myfkmusicplayer/server/internal/repo"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/pborman/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo  *repo.UserRepository
	secretKey []byte
}

const (
	AccessTokenExpiry  = time.Minute * 60
	RefreshTokenExpiry = time.Hour * 24 * 7
)

func NewUserService(userRepo *repo.UserRepository) *UserService {
	godotenv.Load()
	return &UserService{userRepo: userRepo, secretKey: []byte(os.Getenv("JWT_SECRET"))}
}

func (s *UserService) RegisterUser(email, passwordHash string) (*model.User, error) {
	var err error
	passwordHash, err = Hash(passwordHash)

	if err != nil {
		return nil, err
	}

	id, err := s.userRepo.CreateUser(email, passwordHash)
	if err != nil {
		return nil, err
	}
	return &model.User{
		ID:           id,
		Email:        email,
		PasswordHash: passwordHash,
	}, nil
}

func (s *UserService) GetUserByEmail(email string) (*model.User, error) {
	return s.userRepo.GetUserByEmail(email)
}

func (s *UserService) LoginUser(email, password string) (*model.User, http.Cookie, http.Cookie, error) {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return nil, http.Cookie{}, http.Cookie{}, err
	}

	if !CheckHash(password, user.PasswordHash) {
		return nil, http.Cookie{}, http.Cookie{}, errors.New("invalid email or password")
	}

	accessToken, err := s.createToken(user.Email)
	refreshToken := uuid.New()
	hashRefreshToken, err := Hash(refreshToken)

	s.userRepo.SaveRefreshToken(email, hashRefreshToken, time.Now().Add(RefreshTokenExpiry))

	if err != nil {
		return nil, http.Cookie{}, http.Cookie{}, err
	}

	return user, s.createCookie("access_token", accessToken, time.Now().Add(AccessTokenExpiry)),
		s.createCookie("refresh_token", refreshToken, time.Now().Add(RefreshTokenExpiry)), nil
}

func Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *UserService) createToken(userEmail string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userEmail": userEmail,
		})

	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *UserService) createCookie(cookieType, token string, expire time.Time) http.Cookie {
	return http.Cookie{
		Name:     cookieType,
		Value:    token,
		Expires:  expire,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
}

func (s *UserService) RefreshToken(userEmail, refreshToken string) (http.Cookie, error) {
	storedHash, expiresAt, err := s.userRepo.GetRefreshTokenByEmail(userEmail)

	if err != nil {
		return http.Cookie{}, err
	}

	if time.Now().After(expiresAt) {
		return http.Cookie{}, errors.New("refresh token expired")
	}

	if !CheckHash(refreshToken, storedHash) {
		return http.Cookie{}, errors.New("invalid refresh token")
	}

	newAccessToken, err := s.createToken(userEmail)

	if err != nil {
		return http.Cookie{}, err
	}

	return s.createCookie("access_token", newAccessToken, time.Now().Add(AccessTokenExpiry)), nil
}
