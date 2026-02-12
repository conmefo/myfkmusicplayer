package downloader

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

type Downloader struct {
	binaryPath string
	outputDir  string
}

func NewDownloader(outputDir string, binaryPath string) *Downloader {
	return &Downloader{
		binaryPath: binaryPath,
		outputDir:  outputDir,
	}
}

func (d *Downloader) Download(url string, audioQuality string) error {
	outputTpl := filepath.Join(d.outputDir, "%(title)s.%(ext)s")

	args := []string{
		"-x",
		"--audio-format", "mp3",
		"--audio-quality", audioQuality,
		"--no-playlist",
		"--restrict-filenames",
		"-o", outputTpl,
		url,
	}

	cmd := exec.Command(d.binaryPath, args...)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf(
			"yt-dlp failed: %w\noutput:\n%s",
			err,
			string(output),
		)
	}
	return nil
}
