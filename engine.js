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
            this.rooms[group] = [];
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
    }

    removePlayer(group, id) {
        this.checkGroup(group);

        delete this.players[group][id];

        for (const room of rooms) {
            room.removePlayer(id);
        }
    }

    getPlayers(group, roomName) {
        this.checkGroup(group);

        return this.rooms[group]
            .find(room => room.name === roomName)
            .players
            .map(playerId => this.players[group].find(player => player.id === playerId));
    }

    getPlayerRoom(group, id) {
        this.checkGroup(group);

        return this.rooms[group].find(room => room.players.includes(id)).name;
    }

    getPlayerInfo(group, id) {
        this.checkGroup(group);

        const player = this.players[group][id];

        return {
            name: player.name,
            items: player.items,
        };
    }

    getRoomInfo(group, roomName) {
        this.checkGroup(group);

        const room = this.rooms[group].find(room => room.name === roomName);

        return {
            name: room.name,
            players: room.players.map(playerId => this.players[group].find(player => player.id === playerId)),
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

        if (!this.rooms[group][name]) {
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
}

module.exports = Engine;