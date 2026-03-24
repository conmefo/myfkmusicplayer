FROM golang:1.26.1-alpine3.23 AS builder
WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY cmd ./cmd
COPY internal ./internal

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

FROM alpine:3.23
WORKDIR /app

RUN apk add --no-cache \
    ca-certificates \
    python3 \
    py3-pip \
    ffmpeg

RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip install --no-cache-dir yt-dlp

ENV PATH="/opt/venv/bin:$PATH"

COPY --from=builder /build/server .

RUN mkdir -p storage
RUN adduser -D appuser
RUN chown -R appuser:appuser /app/storage
USER appuser

EXPOSE 8080
CMD ["./server"]