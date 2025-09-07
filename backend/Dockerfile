FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git ca-certificates

ENV GOPROXY=direct
ENV GOSUMDB=off
ENV CGO_ENABLED=0

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/app

FROM alpine:latest

RUN apk update --no-cache && apk add --no-cache ca-certificates

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"] 