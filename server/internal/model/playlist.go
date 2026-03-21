package model

type Playlist struct {
	ID     int64  `json:"id"`
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
}

type PlaylistTrack struct {
	PlaylistID int64  `json:"playlist_id"`
	TrackID    string `json:"track_id"`
	Title      string `json:"title"`
	Artist     string `json:"artist"`
	Image      string `json:"image"`
}
