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
        console.log(`a user connected ${group} ${socket.id}`);
        try {
            engine.addPlayer(group, socket.id);
            socket.join('lobby');
            // console.log(engine.getRoomInfo(group, 'lobby'));
            ns.to('lobby').emit('room info', engine.getRoomInfo(group, 'lobby'));
            // console.log(engine.getPlayerInfo(group, socket.id));
            ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
        } catch (e) {
            console.error(e);
        }
    
        socket.on('disconnect', () => {
            console.log(`user disconnected ${group} ${socket.id}`);
            try {
                const room = engine.getPlayerRoom(group, socket.id);
                engine.removePlayer(group, socket.id);
                socket.leave(room);
                console.log(`leaving ${room}`);
                ns.to(room).emit('room info', engine.getRoomInfo(group, room));
            } catch (e) {
                console.error(e);
            }
        });
    
        socket.on('my name', (name) => {
            try {
                engine.setName(group, socket.id, name);
                const room = engine.getPlayerRoom(group, socket.id);
                ns.to(room).emit('room info', engine.getRoomInfo(group, room));
                ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
            } catch (e) {
                console.error(e);
            }
        });
    
        socket.on('global chat message', (msg) => {
            console.log(`global msg ${msg}`);
            try {
                ns.emit('chat message', {
                    name: engine.getName(group, socket.id),
                    type: 'global',
                    msg,
                });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('room chat message', (msg) => {
            console.log(`room msg ${msg}`);
            try {
                ns.to(engine.getPlayerRoom(group, socket.id)).emit('chat message', {
                    name: engine.getName(group, socket.id),
                    type: 'room',
                    msg,
                });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('new room', (roomName) => {
            try {
                engine.newRoom(group, roomName);
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('link rooms', (data) => {
            try {
                console.log(`linking ${data.first} and ${data.second}`)
                engine.linkRooms(group, data.first, data.second);
                ns.to(data.first).emit('room info', engine.getRoomInfo(group, data.first));
                ns.to(data.second).emit('room info', engine.getRoomInfo(group, data.second));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('move to', (room) => {
            try {
                const from = engine.movePlayer(group, socket.id, room);
                socket.leave(from);
                socket.join(room);
                ns.to(from).emit('room info', engine.getRoomInfo(group, from));
                ns.to(room).emit('room info', engine.getRoomInfo(group, room));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('leave item', (item) => {
            try {
                const room = engine.getPlayerRoom(group, socket.id);
                engine.leaveItem(group, room, socket.id, item);
                ns.to(room).emit('room info', engine.getRoomInfo(group, room));
                ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('take item', (item) => {
            try {
                const room = engine.getPlayerRoom(group, socket.id);
                engine.takeItem(group, room, socket.id, item);
                ns.to(room).emit('room info', engine.getRoomInfo(group, room));
                ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('new item', (data) => {
            try {
                engine.addItem(group, data.room, data.item)
                ns.to(data.room).emit('room info', engine.getRoomInfo(group, data.room));
            } catch (e) {
                console.error(e);
            }
        });
    });
}


http.listen(3000, () => {
    console.log('listening on *:3000');
});