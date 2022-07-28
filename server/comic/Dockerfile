FROM golang:alpine3.15 as golang-compiler
WORKDIR /home/container
COPY . .
RUN go mod tidy
RUN go get .
RUN go build -o ./main.exe .

FROM golang:alpine3.15 as golang-remover
WORKDIR /home/container
COPY --from=golang-compiler /home/container ./


FROM alpine:3.14
WORKDIR /home/container

COPY --from=golang-remover /home/container ./
ENV DB_NAME=shartube_comic
EXPOSE 8080
CMD [ "/home/container/main.exe" ]