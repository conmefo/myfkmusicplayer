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
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo  *repo.UserRepository
	secretKey []byte
}

func NewUserService(userRepo *repo.UserRepository) *UserService {
	godotenv.Load()
	return &UserService{userRepo: userRepo, secretKey: []byte(os.Getenv("JWT_SECRET"))}
}

func (s *UserService) RegisterUser(email, passwordHash string) (*model.User, error) {
	var err error
	passwordHash, err = HashPassword(passwordHash)

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

func (s *UserService) LoginUser(email, password string) (*model.User, http.Cookie, http.Cookie, error) {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return nil, http.Cookie{}, http.Cookie{}, err
	}

	if !CheckPasswordHash(password, user.PasswordHash) {
		return nil, http.Cookie{}, http.Cookie{}, errors.New("invalid email or password")
	}

	accessToken, err := s.createToken(user.Email, time.Now().Add(time.Minute*15))
	refreshToken, err := s.createToken(user.Email, time.Now().Add(time.Hour*24))

	if err != nil {
		return nil, http.Cookie{}, http.Cookie{}, err
	}

	return user, s.createCookie("access_token", accessToken), s.createCookie("refresh_token", refreshToken), nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *UserService) createToken(userEmail string, expireTime time.Time) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userEmail": userEmail,
			"exp":       expireTime.Unix(),
		})

	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *UserService) createCookie(cookieType, token string) http.Cookie {
	return http.Cookie{
		Name:  cookieType,
		Value: token,
	}
}
