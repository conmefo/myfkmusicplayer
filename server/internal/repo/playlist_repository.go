package repo

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
)

type PlaylistRepository struct {
	db *sql.DB
}

func NewPlaylistRepository(db *sql.DB) *PlaylistRepository {
	return &PlaylistRepository{db: db}
}

func (r *PlaylistRepository) CreatePlaylist(userID int64, name string) (*model.Playlist, error) {
	query := `INSERT INTO playlists (user_id, name) VALUES ($1, $2) RETURNING id, user_id, name`
	row := r.db.QueryRow(query, userID, name)

	var playlist model.Playlist
	err := row.Scan(&playlist.ID, &playlist.UserID, &playlist.Name)
	if err != nil {
		if strings.Contains(err.Error(), "unique_user_playlist_name") || strings.Contains(err.Error(), "duplicate key value") {
			return nil, errors.New("a playlist with this name already exists")
		}
		return nil, err
	}
	return &playlist, nil
}

func (r *PlaylistRepository) GetUserPlaylists(userID int64) ([]model.Playlist, error) {
	query := `SELECT id, user_id, name FROM playlists WHERE user_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var playlists []model.Playlist
	for rows.Next() {
		var p model.Playlist
		if err := rows.Scan(&p.ID, &p.UserID, &p.Name); err != nil {
			return nil, err
		}
		playlists = append(playlists, p)
	}
	return playlists, nil
}

func (r *PlaylistRepository) AddTrackToPlaylist(playlistID int64, track model.Track) error {
	query := `
		WITH next_pos AS (
			SELECT COALESCE(MAX(position) + 1, 1) AS pos
			FROM playlist_tracks
			WHERE playlist_id = $1
		)
		INSERT INTO playlist_tracks (playlist_id, track_id, title, artist, image, position)
		SELECT $1, $2, $3, $4, $5, pos FROM next_pos
		ON CONFLICT (playlist_id, track_id) DO NOTHING`
	_, err := r.db.Exec(query, playlistID, track.Id, track.Title, track.Artist, track.Image)
	return err
}

func (r *PlaylistRepository) RemoveTrackFromPlaylist(playlistID int64, trackID string) error {
	query := `DELETE FROM playlist_tracks WHERE playlist_id = $1 AND track_id = $2`
	_, err := r.db.Exec(query, playlistID, trackID)
	return err
}

func (r *PlaylistRepository) GetPlaylistTracks(playlistID int64) ([]model.Track, error) {
	query := `
		SELECT track_id, title, artist, image 
		FROM playlist_tracks 
		WHERE playlist_id = $1 
		ORDER BY position ASC, added_at ASC`

	rows, err := r.db.Query(query, playlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tracks []model.Track
	for rows.Next() {
		var t model.Track
		if err := rows.Scan(&t.Id, &t.Title, &t.Artist, &t.Image); err != nil {
			return nil, err
		}
		tracks = append(tracks, t)
	}

	if tracks == nil {
		tracks = []model.Track{} // Return empty array instead of null for JSON
	}

	return tracks, nil
}

func (r *PlaylistRepository) UpdateTrackPositions(playlistID int64, trackIDs []string) error {
	if len(trackIDs) == 0 {
		return nil
	}

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`UPDATE playlist_tracks SET position = $1 WHERE playlist_id = $2 AND track_id = $3`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for i, id := range trackIDs {
		if _, err := stmt.Exec(i, playlistID, id); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *PlaylistRepository) DeletePlaylist(playlistID int64) error {
	query := `DELETE FROM playlists WHERE id = $1`
	result, err := r.db.Exec(query, playlistID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("playlist not found")
	}
	return nil
}

func (r *PlaylistRepository) GetPlaylistByID(playlistID int64) (*model.Playlist, error) {
	query := `SELECT id, user_id, name FROM playlists WHERE id = $1`
	row := r.db.QueryRow(query, playlistID)

	var playlist model.Playlist
	err := row.Scan(&playlist.ID, &playlist.UserID, &playlist.Name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("playlist not found")
		}
		return nil, err
	}
	return &playlist, nil
}
