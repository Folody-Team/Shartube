package main

import (
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/Folody-Team/Shartube/directives"
	"github.com/Folody-Team/Shartube/graphql/generated"
	"github.com/Folody-Team/Shartube/graphql/resolver"
	"github.com/Folody-Team/Shartube/middleware/authMiddleware"
	GraphqlLog "github.com/Folody-Team/Shartube/middleware/log"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

const defaultPort = "8080"

func main() {
	/*
	* Commit by phatdev
	 */
	// create a new router with mux
	router := mux.NewRouter()
	// middleware
	router.Use(authMiddleware.AuthMiddleware)
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

	srv.AroundOperations(GraphqlLog.LogMiddleware)

	/*
	* Here we add the playground to the server with mux
	 */
	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", srv)

	http.Handle("/", router) // to use mux we need to Handle it with net/http.

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
