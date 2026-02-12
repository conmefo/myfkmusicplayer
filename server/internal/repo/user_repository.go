package repo

import (
	"database/sql"

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
