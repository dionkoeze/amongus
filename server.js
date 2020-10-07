const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Engine = require('./engine');
const engine = new Engine;

const groups = require('./groups');

app.use(express.static('static'));

for (const group of groups) {
    const ns = io.of(`/${group}`);
    
    ns.on('connection', (socket) => {
        // console.log('a user connected');
    
        socket.on('disconnect', () => {
            // console.log('user disconnected');
            try {
                engine.removePlayer(group, socket.id);
            } catch {}
        });
    
        socket.on('my name', (name) => {
            engine.setName(group, socket.id, name);
        });
    
        socket.on('chat message', (msg) => {
            console.log(msg);
            ns.emit('chat message', {
                name: engine.getName(group, socket.id),
                msg,
            });
        });

        socket.on('new room', (room) => {

        });

        socket.on('link rooms', (data) => {

        });

        socket.on('move to', (room) => {

        });
    });
}


http.listen(3000, () => {
    console.log('listening on *:3000');
});