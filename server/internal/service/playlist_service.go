package service

import (
	"errors"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
	"github.com/conmefo/myfkmusicplayer/server/internal/repo"
)

type PlaylistService struct {
	playlistRepo *repo.PlaylistRepository
}

func NewPlaylistService(playlistRepo *repo.PlaylistRepository) *PlaylistService {
	return &PlaylistService{playlistRepo: playlistRepo}
}

func (s *PlaylistService) CreatePlaylist(userID int64, name string) (*model.Playlist, error) {
	if name == "" {
		return nil, errors.New("playlist name cannot be empty")
	}
	return s.playlistRepo.CreatePlaylist(userID, name)
}

func (s *PlaylistService) GetUserPlaylists(userID int64) ([]model.Playlist, error) {
	return s.playlistRepo.GetUserPlaylists(userID)
}

func (s *PlaylistService) AddTrackToPlaylist(userID int64, playlistID int64, track model.Track) error {
	playlist, err := s.playlistRepo.GetPlaylistByID(playlistID)
	if err != nil {
		return err
	}
	if playlist.UserID != userID {
		return errors.New("unauthorized access to playlist")
	}

	return s.playlistRepo.AddTrackToPlaylist(playlistID, track)
}

func (s *PlaylistService) RemoveTrackFromPlaylist(userID int64, playlistID int64, trackID string) error {
	playlist, err := s.playlistRepo.GetPlaylistByID(playlistID)
	if err != nil {
		return err
	}
	if playlist.UserID != userID {
		return errors.New("unauthorized access to playlist")
	}

	return s.playlistRepo.RemoveTrackFromPlaylist(playlistID, trackID)
}

func (s *PlaylistService) GetPlaylistTracks(userID int64, playlistID int64) ([]model.Track, error) {
	playlist, err := s.playlistRepo.GetPlaylistByID(playlistID)
	if err != nil {
		return nil, err
	}
	if playlist.UserID != userID {
		return nil, errors.New("unauthorized access to playlist")
	}

	return s.playlistRepo.GetPlaylistTracks(playlistID)
}

func (s *PlaylistService) DeletePlaylist(userID int64, playlistID int64) error {
	playlist, err := s.playlistRepo.GetPlaylistByID(playlistID)
	if err != nil {
		return err
	}
	if playlist.UserID != userID {
		return errors.New("unauthorized access to playlist")
	}

	return s.playlistRepo.DeletePlaylist(playlistID)
}

func (s *PlaylistService) ReorderTracks(userID int64, playlistID int64, trackIDs []string) error {
	playlist, err := s.playlistRepo.GetPlaylistByID(playlistID)
	if err != nil {
		return err
	}
	if playlist.UserID != userID {
		return errors.New("unauthorized access to playlist")
	}

	return s.playlistRepo.UpdateTrackPositions(playlistID, trackIDs)
}
