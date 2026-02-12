package service

import (
	"errors"
	"os"
	"time"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
	"github.com/conmefo/myfkmusicplayer/server/internal/repo"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo   *repo.UserRepository
	sercretKey []byte
}

func NewUserService(userRepo *repo.UserRepository) *UserService {
	godotenv.Load()
	return &UserService{userRepo: userRepo, sercretKey: []byte(os.Getenv("JWT_SECRET"))}
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

func (s *UserService) LoginUser(email, password string) (*model.User, string, error) {
	user, err := s.userRepo.GetUserByEmail(email)
	if err != nil {
		return nil, "", err
	}

	if !CheckPasswordHash(password, user.PasswordHash) {
		return nil, "", errors.New("invalid email or password")
	}

	token, err := s.createToken(user.Email)

	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *UserService) createToken(userEmail string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userEmail": userEmail,
			"exp":       time.Now().Add(time.Hour * 24).Unix(),
		})

	tokenString, err := token.SignedString(s.sercretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
