const groups = require('./groups');

const MAJORITY = 0.5;
const MAXSCORE = 10;
const MINSCORE = 1;
const VOTECOST = 1;
const MINPLAYERS = 4;

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
        this.score = 0.0;
        this.vote = "no one";
        this.isImpostor = false;
        this.impostorSince = new Date();
    }

    setName(name) {
        this.name = name;
    }

    makeImpostor() {
        this.isImpostor = true;
        this.impostorSince = new Date();
    }

    stopImpostor() {
        const end = new Date();

        this.isImpostor = false;

        const milliseconds = end.getTime() - this.impostorSince.getTime();
        const time = Math.floor(milliseconds / 60000) + 1;
        return Math.max(Math.floor(MAXSCORE / time), MINSCORE);
    }
}

class Engine {
    constructor() {
        this.players = {};
        this.rooms = {};
        this.playerCount = {};
        this.started = {};

        for (const group of groups) {
            this.resetGroup(group);
        }
    }

    resetGroup(group) {
        this.checkGroup(group);

        this.players[group] = {};
        this.rooms[group] = [new Room('lobby')];
        this.playerCount[group] = 0;
        this.started[group] = false;
    }

    softResetGroup(group) {
        this.checkGroup(group);

        this.rooms[group] = [new Room('lobby')];
        this.started[group] = false;

        for (const player in this.players[group]) {
            this.rooms[group][0].addPlayer(player);

            this.players[group][player].items = [];
            this.players[group][player].vote = "no one";
            this.players[group][player].score = 0.0;
            this.players[group][player].isImpostor = false;
        }
    }

    checkGroup(group) {
        if (!groups.includes(group)) {
            throw new Error(`de studiegroep ${group} bestaat niet`);
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

        this.playerCount[group] += 1;
    }

    removePlayer(group, id) {
        this.checkGroup(group);

        delete this.players[group][id];

        for (const room of this.rooms[group]) {
            room.removePlayer(id);
        }

        this.playerCount[group] -= 1;

        if (this.playerCount[group] == 0) {
            this.resetGroup(group);
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
            score: player.score,
            vote: player.vote,
            impostor: player.isImpostor,
        };
    }

    getVoteInfo(group) {
        this.checkGroup(group);

        const votes = [];

        for (const id in this.players[group]) {
            const player = this.players[group][id];
            const vote = votes.find(vote => vote.name === player.vote);
            if (vote) {
                vote.count += 1;
            } else {
                votes.push({
                    name: player.vote,
                    count: 1,
                });
            }
        }

        votes.sort((a, b) => b.count - a.count);

        return votes;
    }

    getRoomInfo(group, roomName) {
        this.checkGroup(group);

        const room = this.rooms[group].find(room => room.name === roomName);

        return {
            type: 'room info',
            name: room.name,
            players: this.getPlayers(group, roomName),
            items: room.items,
            adjacentRooms: room.connects,
        };
    }

    getScoreInfo(group) {
        this.checkGroup(group);

        const scores = [];

        for (const id in this.players[group]) {
            const player = this.players[group][id];
            scores.push({
                player: player.name,
                score: player.score,
            });
        }

        scores.sort((a, b) => b.score - a.score);

        return scores;
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

    addStartItem(group, roomName, item) {
        this.checkGroup(group);

        if (this.playerCount[group] == 1) {
            this.addItem(group, roomName, item);
        }
    }

    addPlayerItem(group, id, item) {
        this.checkGroup(group);

        this.players[group][id].items.push(item);
    }

    removeRoomItem(group, roomName, item) {
        this.checkGroup(group);

        const room = this.rooms[group].find(room => room.name === roomName);

        const idx = room.items.indexOf(item);

        if (idx >= 0) {
            room.items.splice(idx, 1);
        }
    }

    removePlayerItem(group, playerId, item) {
        this.checkGroup(group);

        const idx = this.players[group][playerId].items.indexOf(item);

        if (idx >= 0) {
            this.players[group][playerId].items.splice(idx, 1);
        }
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

    playerVote(group, player, vote) {
        this.checkGroup(group);

        this.players[group][player].score -= VOTECOST;
        this.players[group][player].vote = vote;
    }

    getPlayerCount(group) {
        this.checkGroup(group);

        return Object.keys(this.players[group]).length;
    }

    getImpostor(group) {
        this.checkGroup(group);

        let impostor = null;

        for (const id in this.players[group]) {
            const player = this.players[group][id];
            if (player.isImpostor) {
                impostor = player;
            }
        }

        return impostor;
    }

    getTopVote(group) {
        this.checkGroup(group);

        const votes = [];

        for (const id in this.players[group]) {
            const player = this.players[group][id];
            const vote = votes.find(vote => vote.name === player.vote);
            if (vote) {
                vote.count += 1;
            } else {
                votes.push({
                    name: player.vote,
                    count: 1,
                });
            }
        }

        votes.sort((a, b) => b.count - a.count);

        return votes[0];
    }

    checkVotes(group, state) {
        this.checkGroup(group);

        const impostor = this.getImpostor(group);
        const vote = this.getTopVote(group);

        if (this.started[group] && impostor && impostor.name === vote.name && vote.count > MAJORITY * this.getPlayerCount(group)) {
            state.score = impostor.stopImpostor();

            for (const id in this.players[group]) {
                const player = this.players[group][id];
                if (player !== impostor) {
                    player.score += state.score;
                    player.vote = 'no one';
                }
            }

            state.impostor = impostor.name;
            state.gameEnded = true;
            this.started[group] = false;
        }

        return 0;
    }

    checkImpostor(group, state) {
        this.checkGroup(group);

        const impostor = this.getImpostor(group);

        if (this.started[group] && !impostor) {
            state.gameEnded = true;
            this.started[group] = false;
        }

        if (!this.started[group] && this.getPlayerCount(group) >= MINPLAYERS) {
            const ids = Object.keys(this.players[group]);
            const rdm = Math.floor(Math.random() * ids.length);
            this.players[group][ids[rdm]].makeImpostor();
            this.started[group] = true;
            state.newImpostor = true;
            state.impostorId = ids[rdm];
        } else if (!this.started[group]) {
            state.notEnoughPlayers = true;
        } else if (this.getPlayerCount(group) < MINPLAYERS) {
            state.notEnoughPlayers = true;
        }
    }

    checkImpostorState(group) {
        this.checkGroup(group);

        const state = {
            notEnoughPlayers: false,
            newImpostor: false,
            gameEnded: false,
        }

        this.checkVotes(group, state);
        this.checkImpostor(group, state);

        return state;
    }
}

module.exports = Engine;