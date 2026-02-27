package repo

import (
	"database/sql"
	"time"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(email, passwordHash string) (int64, error) {
	var id int64
	err := r.db.QueryRow("INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
		email,
		passwordHash).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	row := r.db.QueryRow("SELECT id, email, password_hash FROM users WHERE email = $1", email)
	var user model.User
	err := row.Scan(&user.ID, &user.Email, &user.PasswordHash)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) SaveRefreshToken(userEmail, refreshToken string, expiresAt time.Time) error {
	_, err := r.db.Exec("UPDATE users SET refresh_token_hash = $1, refresh_token_expiration = $2 WHERE email = $3", refreshToken, expiresAt, userEmail)
	return err
}

func (r *UserRepository) GetRefreshTokenByEmail(email string) (string, time.Time, error) {
	row := r.db.QueryRow("SELECT refresh_token_hash, refresh_token_expiration FROM users WHERE email = $1", email)
	var refreshToken string
	var expiresAt time.Time
	err := row.Scan(&refreshToken, &expiresAt)
	if err != nil {
		return "", time.Time{}, err
	}
	return refreshToken, expiresAt, nil
}
