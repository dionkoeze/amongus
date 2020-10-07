const groups = require('./groups');

// MAAK ROOM EN PLAYER KLASSEN!

class Room {
    constructor() {
        this.players = []
    }

    removePlayer(id) {
        this.players.re
    }
}

class Player {

}

class Engine {
    constructor() {
        this.players = {};
        this.rooms = {};

        for (const group of groups) {
            this.players[group] = {};
            this.rooms[group] = new Room();
        }
    }

    checkGroup(group) {
        if (!groups.includes(group)) {
            throw new Error("deze studiegroep bestaat niet");
        }
    }

    setName(group, id, name) {
        this.checkGroup(group);

        this.players[group][id] = name;
    }

    getName(group, id) {
        this.checkGroup(group);

        if (this.players[group][id]) {
            return this.players[group][id];
        } else {
            return 'unknown player';
        }
    }

    removePlayer(group, id) {
        this.checkGroup(group);

        delete this.players[group][id];

        for (const room of rooms) {
            room.removePlayer(id);
        }
    }

    getPlayers(group, room) {
        this.checkGroup(group);


    }

    newRoom(group, name) {

    }

    linkRooms(group, first, second) {

    }
}

module.exports = Engine;