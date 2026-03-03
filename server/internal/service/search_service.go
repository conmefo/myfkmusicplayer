package service

import (
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
)

type SearchService struct {
}

type apiTrack struct {
	Title  string `json:"title"`
	Artist struct {
		Name string `json:"name"`
	} `json:"artist"`
	Album struct {
		Cover string `json:"cover_medium"`
	} `json:"album"`
}

type deezerWrapper struct {
	Data []apiTrack `json:"data"`
}

func NewSearchService() *SearchService {
	return &SearchService{}
}

func (s *SearchService) Search(query string) ([]model.Track, error) {
	encodedQuery := url.QueryEscape(query)
	apiURL := "https://api.deezer.com/search?q=" + encodedQuery + "&limit=10"

	response, err := http.Get(apiURL)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, err
	}

	var wrapper deezerWrapper
	if err := json.NewDecoder(response.Body).Decode(&wrapper); err != nil {
		return nil, err
	}

	var tracks []model.Track
	for _, t := range wrapper.Data {
		tracks = append(tracks, model.Track{
			Title:  t.Title,
			Artist: t.Artist.Name,
			Image:  t.Album.Cover,
		})
	}

	return tracks, nil
}
