package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"time"

	"code.google.com/p/go.net/websocket"
)

const (
	listenAddr = "localhost:8080"
)

func main() {
	http.HandleFunc("/", rootHandler)
	http.Handle("/socket", websocket.Handler(socketHandler))
	http.Handle("/scripts/", http.FileServer(http.Dir("")))
	http.Handle("/favicon.ico", http.FileServer(http.Dir("/images")))
	err := http.ListenAndServe(listenAddr, nil)
	if err != nil {
		log.Fatal(err)
	}
}

var rootTemplate = template.Must(template.ParseFiles("html/index.html"))

func rootHandler(w http.ResponseWriter, r *http.Request) {
	rootTemplate.Execute(w, nil)
}

type socket struct {
	io.ReadWriter
	done chan bool
}

func socketHandler(ws *websocket.Conn) {
	s := socket{ws, make(chan bool)}
	go func(s socket){
		ticker := time.NewTicker(time.Second)
		finished := time.After(time.Second * 5)
		for {
			select {
				case <-finished:
					s.done <- true
				case <-ticker.C:
					fmt.Fprint(s, "hey")
			}
		}
	}(s)
	<-s.done
}