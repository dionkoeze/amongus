const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Engine = require('./engine');
const engine = new Engine;

const groups = require('./groups');

app.use(express.json());

app.delete('/:group', (req, res) => {
    console.log('yo');

    const group = req.params.group;

    if (group === 'B3' && req.body.passwd === process.env.PASSWD) {
        try {
            engine.checkGroup(group);
            for (const room of engine.rooms[group]) {
                for (const player of room.players) {
                    const socket = io.sockets.connected(player)
                    socket.leave(room.name);
                    socket.join('lobby');
                }
            }

            const ns = io.of(group);

            engine.softResetGroup(group);
            handleImpostorState(group, ns, engine.checkImpostorState(group));
            
            for (const id in ns.sockets) {
                ns.to(id).emit('player info', engine.getPlayerInfo(group, id));
            }

            ns.to('lobby').emit('room info', engine.getRoomInfo(group, 'lobby'));
            ns.emit('vote info', engine.getVoteInfo(group));

            res.status(200).json({
                success: true,
                message: 'room is reset',
            });
        } catch(e) {
            console.error(e);
            res.status(500).json({
                success: false,
                message: 'request was correct, but internal server error',
            });
        }
    } else {
        res.status(400).json({
            success: false,
            message: 'request was incorrect',
        });
    }
});

app.use(express.static('static'));

function handleImpostorState(group, ns, state) {
    if (state.notEnoughPlayers) {
        ns.emit('too few players', engine.getPlayerCount(group));
    }
    if (state.gameEnded) {
        ns.emit('game ended', {
            impostor: state.impostor,
            score: state.score,
        });
    }
    if (state.newImpostor) {
        ns.emit('new impostor');
        for (const id in ns.sockets) {
            ns.to(id).emit('player info', engine.getPlayerInfo(group, id));
        }
    }
}

for (const group of groups) {
    const ns = io.of(`/${group}`);
    
    ns.on('connection', (socket) => {
        try {
            engine.addPlayer(group, socket.id);
            socket.join('lobby');
            handleImpostorState(group, ns, engine.checkImpostorState(group));
            ns.to('lobby').emit('room info', engine.getRoomInfo(group, 'lobby'));
            ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
            ns.emit('score info', engine.getScoreInfo(group));
            ns.to(socket.id).emit('vote info', engine.getVoteInfo(group));
        } catch (e) {
            console.error(e);
        }
    
        socket.on('disconnect', () => {
            try {
                const room = engine.getPlayerRoom(group, socket.id);
                engine.removePlayer(group, socket.id);
                socket.leave(room);
                handleImpostorState(group, ns, engine.checkImpostorState(group));
                ns.to(room).emit('room info', engine.getRoomInfo(group, room));
                ns.emit('score info', engine.getScoreInfo(group));
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
                ns.emit('score info', engine.getScoreInfo(group));
            } catch (e) {
                console.error(e);
            }
        });
    
        socket.on('global chat message', (msg) => {
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
                engine.addItem(group, data.room, data.item);
                ns.to(data.room).emit('room info', engine.getRoomInfo(group, data.room));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('new start item', (data) => {
            try {
                engine.addStartItem(group, data.room, data.item);
                ns.to(data.room).emit('room info', engine.getRoomInfo(group, data.room));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('new player item', (item) => {
            try {
                engine.addPlayerItem(group, socket.id, item);
                ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('my vote', (votedPlayer) => {
            try {
                engine.playerVote(group, socket.id, votedPlayer);
                handleImpostorState(group, ns, engine.checkImpostorState(group));
                ns.to(socket.id).emit('player info', engine.getPlayerInfo(group, socket.id));
                ns.emit('score info', engine.getScoreInfo(group));
                ns.emit('vote info', engine.getVoteInfo(group));
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('reset', () => {
            
        });
    });
}


http.listen(process.env.PORT || 3000, () => {
    // console.log('listening on *:3000');
});