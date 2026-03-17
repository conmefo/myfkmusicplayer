package service

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/conmefo/myfkmusicplayer/server/internal/model"
)

type SearchService struct {
}

func NewSearchService() *SearchService {
	return &SearchService{}
}

func (s *SearchService) Search(query string) ([]model.Track, error) {
	cmd := exec.Command("yt-dlp",
		"ytsearch5:"+query,
		"--dump-json",
		"--flat-playlist",
	)

	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var tracks []model.Track

	for _, line := range lines {
		var result struct {
			ID       string `json:"id"`
			Title    string `json:"title"`
			Uploader string `json:"uploader"`
		}

		if err := json.Unmarshal([]byte(line), &result); err != nil {
			continue
		}

		image := "https://img.youtube.com/vi/" + result.ID + "/hqdefault.jpg"

		tracks = append(tracks, model.Track{
			Id:     result.ID,
			Title:  result.Title,
			Artist: result.Uploader,
			Image:  image,
		})
	}

	return tracks, nil
}

func (s *SearchService) Download(id string) (string, error) {
	outputDir := "storage"
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		return "", err
	}
	outputFilePath := filepath.Join(outputDir, id+".mp3")

	if _, err := os.Stat(outputFilePath); err == nil {
		return outputFilePath, nil
	}

	url := "https://www.youtube.com/watch?v=" + id
	cmd := exec.Command("yt-dlp",
		"-x",
		"--audio-format", "mp3",
		"--audio-quality", "192K",
		"--no-playlist",
		"-o", outputFilePath,
		url,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("download failed: %v, output: %s", err, string(out))
	}

	return outputFilePath, nil
}
