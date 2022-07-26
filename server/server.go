package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/Folody-Team/Shartube/directives"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/resolver"
	GraphqlLog "github.com/Folody-Team/Shartube/middleware/log"
	"github.com/Folody-Team/Shartube/middleware/passRequest"
	"github.com/Folody-Team/Shartube/playground"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

const defaultPort = "8080"

func main() {
	/*
	* Commit by phatdev
	 */
	// create a new router with mux
	router := mux.NewRouter()
	// middleware
	router.Use(passRequest.PassMiddleware)
	port := os.Getenv("PORT")

	if port == "" {
		port = defaultPort
	}

	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	c := generated.Config{Resolvers: &resolver.Resolver{}}
	c.Directives.Auth = directives.Auth
	c.Directives.EmailInput = directives.EmailInput

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(c))

	srv.AddTransport(&transport.Websocket{
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// Check against your desired domains here
				return r.Host == "localhost:3000"
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
	})

	srv.AroundOperations(GraphqlLog.LogMiddleware)
	/*
	* Here we add the playground to the server with mux
	 */
	// handler static/css and js
	router.Use(cors.New(
		cors.Options{
			AllowedOrigins: []string{"*"},
			AllowedMethods: []string{
				http.MethodHead,
				http.MethodGet,
				http.MethodPost,
				http.MethodPut,
				http.MethodPatch,
				http.MethodDelete,
			},
			AllowedHeaders:   []string{"*"},
			AllowCredentials: true,
		},
	).Handler)
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	router.PathPrefix("/public/").Handler(http.StripPrefix("/public/", http.FileServer(http.Dir("public"))))
	router.Handle("/", playground.Handler("Shartube GraphQL", "/query"))
	router.Handle("/query", srv)
	// to use mux we need to Handle it with net/http.

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
