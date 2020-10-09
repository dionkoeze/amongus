const engine = require('engine.io');
const groups = require('./groups');

class Room {
    constructor(name) {
        this.name = name;
        this.players = [];
        this.connects = [];
        this.items = [];
    }

    addPlayer(id) {
        this.players.push(id);
    }

    removePlayer(id) {
        const idx = this.players.indexOf(id);

        if (idx >= 0) {
            this.players.splice(idx, 1);
        }
    }
}

class Player {
    constructor(id) {
        this.id = id;
        this.name = "unknown player";
        this.items = [];
    }

    setName(name) {
        this.name = name;
    }
}

class Engine {
    constructor() {
        this.players = {};
        this.rooms = {};

        for (const group of groups) {
            this.players[group] = {};
            this.rooms[group] = [new Room('lobby')];
        }
    }

    checkGroup(group) {
        if (!groups.includes(group)) {
            throw new Error("deze studiegroep bestaat niet");
        }
    }

    setName(group, id, name) {
        this.checkGroup(group);

        this.players[group][id].setName(name);
    }

    getName(group, id) {
        this.checkGroup(group);

        return this.players[group][id].name;
    }

    addPlayer(group, id) {
        this.checkGroup(group);

        this.players[group][id] = new Player(id);
        this.rooms[group][0].addPlayer(id);
    }

    removePlayer(group, id) {
        this.checkGroup(group);

        delete this.players[group][id];

        for (const room of this.rooms[group]) {
            room.removePlayer(id);
        }
    }

    movePlayer(group, id, roomName) {
        this.checkGroup(group);

        const current = this.getPlayerRoom(group, id);

        const from = this.rooms[group].find(room => room.name === current);
        const to = this.rooms[group].find(room => room.name === roomName);

        if (!from || !to) {
            throw new Error('room bestaat niet');
        }

        from.removePlayer(id);
        to.addPlayer(id);

        return current;
    }

    getPlayers(group, roomName) {
        this.checkGroup(group);

        return this.rooms[group]
            .find(room => room.name === roomName)
            .players
            .map(id => this.players[group][id].name);
    }

    getPlayerRoom(group, id) {
        this.checkGroup(group);

        return this.rooms[group].find(room => room.players.includes(id)).name;
    }

    getPlayerInfo(group, id) {
        this.checkGroup(group);

        const player = this.players[group][id];

        return {
            type: 'player info',
            name: player.name,
            room: this.getPlayerRoom(group, id),
            items: player.items,
        };
    }

    getRoomInfo(group, roomName) {
        this.checkGroup(group);

        const room = this.rooms[group].find(room => room.name === roomName);

        return {
            type: 'room info',
            name: room.name,
            players: this.getPlayers(group, roomName),
            items: room.items,
            connects: room.connects,
        };
    }

    clearRooms(group) {
        this.checkGroup(group);

        this.rooms[group] = [];
    }

    newRoom(group, name) {
        this.checkGroup(group);

        if (!this.rooms[group].includes(name)) {
            this.rooms[group].push(new Room(name));
        }
    }

    linkRooms(group, first, second) {
        this.checkGroup(group);

        const roomA = this.rooms[group].find(room => room.name === first);
        const roomB = this.rooms[group].find(room => room.name === second);

        if (!roomA.connects.includes(roomB.name)) {
            roomA.connects.push(roomB.name);
        }
        if (!roomB.connects.includes(roomA.name)) {
            roomB.connects.push(roomA.name);
        }
    }

    addItem(group, roomName, item) {
        this.checkGroup(group);

        const room = this.rooms[group].find(room => room.name === roomName);

        room.items.push(item);
    }

    takeItem(group, roomName, player, item) {
        this.checkGroup(group);

        const room = this.rooms[group].find(room => room.name === roomName);

        if (room.items.includes(item)) {
            this.players[group][player].items.push(item);
            const idx = room.items.indexOf(item);
            room.items.splice(idx, 1);
        }
    }

    leaveItem(group, roomName, player, item) {
        this.checkGroup(group);

        if (this.players[group][player].items.includes(item)) {
            const room = this.rooms[group].find(room => room.name === roomName);
            room.items.push(item);
            const idx = this.players[group][player].items.indexOf(item);
            this.players[group][player].items.splice(idx, 1);
        }
    }
}

module.exports = Engine;