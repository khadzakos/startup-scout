FROM golang:1.23 AS builder

ENV GOPROXY=https://proxy.golang.org,direct
ENV GOSUMDB=sum.golang.org
ENV CGO_ENABLED=0

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/app

FROM gcr.io/distroless/static-debian12

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"] 