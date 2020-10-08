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
        try {
            engine.addPlayer(group, socket.id);
        } catch {}
    
        socket.on('disconnect', () => {
            // console.log('user disconnected');
            try {
                const room = engine.getPlayerRoom(group, socket.id);
                engine.removePlayer(group, socket.id);
                ns.to(room).emit(); // finish
            } catch {}
        });
    
        socket.on('my name', (name) => {
            try {
                engine.setName(group, socket.id, name);
                ns.to(engine.getPlayerRoom(group, socket.id)).emit(); // finish
                ns.to(socket.id).emit(); // finish
            } catch {}
        });
    
        socket.on('global chat message', (msg) => {
            console.log(`global msg ${msg}`);
            try {
                ns.emit('chat message', {
                    name: engine.getName(group, socket.id),
                    type: 'global',
                    msg,
                });
            } catch {}
        });

        socket.on('room chat message', (msg) => {
            console.log(`room msg ${msg}`);
            try {
                ns.to(engine.getPlayerRoom(group, socket.id)).emit('chat message', {
                    name: engine.getName(group, socket.id),
                    type: 'room',
                    msg,
                });
            } catch {}
        });

        socket.on('new room', (roomName) => {
            try {
                engine.newRoom(group, roomName);
            } catch {}
        });

        socket.on('link rooms', (data) => {
            try {
                engine.linkRooms(group, data.first, data.second);
                ns.to(data.first).emit(); // finish
                ns.to(data.second).emit(); // finish
            } catch {}
        });

        socket.on('clear rooms', () => {
            try {
                engine.clearRooms(group);
                ns.to() // finish
            } catch {}
        });

        socket.on('move to', (room) => {

        });

        socket.on('put item', (item) => {

        });

        socket.on('take item', (item) => {

        });

        socket.on('new item', (data) => {

        });
    });
}


http.listen(3000, () => {
    console.log('listening on *:3000');
});