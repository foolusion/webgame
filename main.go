package main

import (
	"encoding/json"
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
	http.Handle("/images/", http.FileServer(http.Dir("")))
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

func (s socket) Close() error {
	s.done <- true
	return nil
}

func input(s io.ReadWriteCloser, p *Player) {
	dec := json.NewDecoder(s)
	enc := json.NewEncoder(s)
	var m map[string]interface{}
	for {
		err := dec.Decode(&m)
		switch {
		case err == io.EOF:
			s.Close()
			return
		case err != nil:
			log.Fatal("Decode: ", err)
		}

		for k := range m {
			if k != "move" {
				delete(m, k)
			}
		}
		p.Move(m["move"].(string))
		if err := enc.Encode(p); err != nil {
			log.Fatal("Encode: ", err)
		}
	}
}

type Player struct {
	Xpos int
	Ypos int
}

func (p *Player) Move(direction string) {
	switch direction {
	case "left":
		p.Xpos -= 1
	case "right":
		p.Xpos += 1
	case "up":
		p.Ypos -= 1
	case "down":
		p.Ypos += 1
	case "up-left":
		p.Xpos -= 1
		p.Ypos -= 1
	case "up-right":
		p.Xpos += 1
		p.Ypos -= 1
	case "down-left":
		p.Xpos -= 1
		p.Ypos += 1
	case "down-right":
		p.Xpos += 1
		p.Ypos += 1
	}
}

func game(s io.ReadWriteCloser) {
	player := Player{0, 0}
	finished := time.After(time.Second * 45)
	go input(s, &player)
	for {
		select {
		case <-finished:
			s.Close()
		}
	}
}

func socketHandler(ws *websocket.Conn) {
	s := socket{ws, make(chan bool)}
	go game(s)
	<-s.done
}
