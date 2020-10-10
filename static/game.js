// vul hier je studiegroep in op de plaats van 'example' 
// voorbeeld: const socket = io('/A1');
// standaard zit iedereen op example, als je niet in het eerste jaar zit, maar 
// wel mee wil doen, gebruik dan een van de volgende namespaces: game1, game2, game3, game4, game5
const socket = io('https://onderons.herokuapp.com/example');

// om het spel op te bouwen zetten we een aantal vaste kamers neer
socket.emit('new room', 'elevator');
socket.emit('new room', 'hotel room 301');
socket.emit('new room', 'hotel room 302');
socket.emit('new room', 'hotel room 405');
socket.emit('new room', 'third floor hall');
socket.emit('new room', 'fourth floor hall');

// die kamers verbinden we ook op een logische manier
socket.emit('link rooms', {
    first: 'lobby',
    second: 'elevator',
});
socket.emit('link rooms', {
    first: 'elevator',
    second: 'third floor hall',
});
socket.emit('link rooms', {
    first: 'elevator',
    second: 'fourth floor hall',
});
socket.emit('link rooms', {
    first: 'third floor hall',
    second: 'hotel room 301',
});
socket.emit('link rooms', {
    first: 'third floor hall',
    second: 'hotel room 302',
});
socket.emit('link rooms', {
    first: 'fourth floor hall',
    second: 'hotel room 405',
});

// ook leggen we een aantal standaard items in die kamers (1 item, ongeacht het aantal spelers)
socket.emit('new start item', {
    room: 'lobby',
    item: 'plant',
});
socket.emit('new start item', {
    room: 'hotel room 301',
    item: 'phone',
});
socket.emit('new start item', {
    room: 'hotel room 301',
    item: 'lamp',
});
socket.emit('new start item', {
    room: 'hotel room 302',
    item: 'lamp',
});
socket.emit('new start item', {
    room: 'hotel room 302',
    item: 'knife',
});
socket.emit('new start item', {
    room: 'hotel room 405',
    item: 'wiretapping equipment',
});

// telkens wanneer een speler joint worden deze items ook toegevoegd
socket.emit('new item', {
    room: 'lobby',
    item: 'notebook',
});
socket.emit('new item', {
    room: 'lobby',
    item: 'magnifying glass',
});


// nu volgen een aantal event listeners die een bericht naar de server sturen
// wanneer de speler op een knop heeft gedrukt. Bekijk eens rustig hoe ze werken

document.userName.addEventListener("submit", function(e) {
    // voorkom dat de pagina refresht
    e.preventDefault();

    // vind het goede input element
    const name = document.getElementById('name');

    // stuur de nieuwe naam naar de server
    socket.emit('my name', name.value);

    // we halen hier het form weg (je kan je naam dus maar 1 keer invullen)
    const form = document.getElementById('userName');
    form.parentNode.removeChild(form);

    // false betekent dat andere event listeners dit event ook nog krijgen
    return false;
});

document.userRoomInput.addEventListener("submit", function(e) {
    // voorkom dat de pagina refresht
    e.preventDefault();

    // vind het goede input element
    const roomText = document.getElementById('roomText');

    // stuur het chatbericht naar de server
    socket.emit('room chat message', roomText.value);

    // maak het inputveld weer leeg
    roomText.value = '';

    // false betekent dat andere event listeners dit event ook nog krijgen
    return false;
});

document.userGlobalInput.addEventListener("submit", function(e) {
    // voorkom dat de pagina refresht
    e.preventDefault();

    // vind het goede input element
    const globalText = document.getElementById('globalText');

    // stuur het chatbericht naar de server
    socket.emit('global chat message', globalText.value);

    // maak het inputveld weer leeg
    globalText.value = '';

    // false betekent dat andere event listeners dit event ook nog krijgen
    return false;
});


// als laatste luisteren we ook naar berichten van de server, want de server
// stuurt ons steeds een bericht als er iets veranderd is in het spel. 
// op deze manier heb je losse stukjes code om te zeggen wat er moet gebeuren
// als een speler op een knop drukt en wat er moet gebeuren als de toestand
// van het spel veranderd is.

socket.on('chat message', function(data){
    // maak een nieuwe list item
    let newElement = document.createElement('li');

    // vul het list item met de afzender en message
    newElement.innerText = `${data.name}: ${data.msg}`;

    // geef de css classes mee 
    newElement.classList.add('message');
    
    if (data.type === 'global') {
        newElement.classList.add('global');
    } else if (data.type === 'room') {
        newElement.classList.add('room');
    }

    // stop het nieuwe list item op de juiste plek in de DOM
    document.getElementById('messages').append(newElement);
});

socket.on('room info', function(room) {
    // iedere keer bouwen we alle room info helemaal opnieuw op

    // onthoud alle relevante elements
    const roomName = document.getElementById('roomName');
    const roomPlayers = document.getElementById('roomPlayers');
    const roomItems = document.getElementById('roomItems');
    const adjacentRooms = document.getElementById('adjacentRooms');

    // zet de nieuwe naam
    roomName.innerText = room.name;

    // dit verwijdert alle child nodes
    roomPlayers.innerHTML = '';
    roomItems.innerHTML = '';
    adjacentRooms.innerHTML = '';

    // dit voegt alle players toe (denk aan de foreach loop in Java)
    for (const player of room.players) {
        // maak een nieuw list item
        const newElement = document.createElement('li');
        const button = document.createElement('button');

        // zet de button in het list item
        newElement.append(button);

        // zet de naam van de player
        button.innerText = player;

        // hier vertellen we wat de knop moet doen als er op geklikt wordt
        button.addEventListener("click", function() {
            socket.emit('my vote', player);
        });

        // voeg het nieuwe element in de DOM toe
        roomPlayers.append(newElement);
    }

    // dit voegt alle items toe (denk aan de foreach loop in Java)
    // in plaats van de items in tekst weer te geven kan je natuurlijk ook plaatjes gebruiken!
    for (const item of room.items) {
        // maak een nieuw list item
        const newElement = document.createElement('li');
        const button = document.createElement('button');

        // zet de button in het list item
        newElement.append(button);

        // zet de naam van het item
        button.innerText = item;

        // hier vertellen we wat de knop moet doen als er op geklikt wordt
        button.addEventListener("click", function() {
            socket.emit('take item', item);
        });

        // voeg het nieuwe element in de DOM toe
        roomItems.append(newElement);
    }

    // dit voegt alle naastgelegen rooms toe (denk aan de foreach loop in Java)
    for (const otherRoom of room.adjacentRooms) {
        // maak een nieuw list item
        const newElement = document.createElement('li');
        const button = document.createElement('button');

        // zet de button in het list item
        newElement.append(button);

        // zet de naam van het item
        button.innerText = otherRoom;
        
        // hier vertellen we wat de knop moet doen als er op geklikt wordt
        button.addEventListener("click", function() {
            socket.emit('move to', otherRoom);
        });

        // voeg het nieuwe element in de DOM toe
        adjacentRooms.append(newElement);
    }
});

socket.on('player info', function(player) {
    // iedere keer bouwen we alle player info helemaal opnieuw op
    
    // onthoud alle relevante elements
    const playerName = document.getElementById('playerName');
    const playerItems = document.getElementById('playerItems');
    const playerScore = document.getElementById('playerScore');
    const playerVote = document.getElementById('playerVote');
    const impostor = document.getElementById('impostor');

    // zet de nieuwe naam
    playerName.innerText = player.name;

    // zet de nieuwe score
    playerScore.innerText = player.score;

    // zet de nieuwe vote
    playerVote.innerText = player.vote;

    // zet een nuttig bericht of je impostor bent
    if (player.impostor) {
        impostor.innerText = 'You are The Impostor!';
    } else {
        impostor.innerText = 'You are just a regular player...'
    }

    // dit verwijdert alle child nodes van de item lijst
    playerItems.innerHTML = '';

    // dit voegt alle items toe (denk aan de foreach loop in Java)
    // in plaats van de items in tekst weer te geven kan je natuurlijk ook plaatjes gebruiken!
    for (const item of player.items) {
        // maak een nieuw list item
        const newElement = document.createElement('li');
        const button = document.createElement('button');

        // zet de button in het list item
        newElement.append(button);

        // zet de naam van het item
        button.innerText = item;

        // hier vertellen we wat de knop moet doen als er op geklikt wordt
        button.addEventListener("click", function() {
            socket.emit('leave item', item);
        });

        // voeg het nieuwe element in de DOM toe
        playerItems.append(newElement);
    }
});

socket.on('score info', (scores) => {
    // iedere keer bouwen we alle player info helemaal opnieuw op

    // onthoud alle relevante elements
    const topThree = document.getElementById('topThree');

    // dit verwijdert alle child nodes van de item lijst
    topThree.innerHTML = '';

    // we houden altijd een top drie bij
    for (let i = 0; i < 3 && i < scores.length; i++) {
        // maak een nieuw list item
        const newElement = document.createElement('li');

        // zet de naam van het item
        newElement.innerText = `${scores[i].player} : ${scores[i].score}`;

        // voeg het nieuwe element in de DOM toe
        topThree.append(newElement);
    }
});

// dit is hoe je een methode kan definieren in javascript
function addGameMessage(msg) {
    const gameMessage1 = document.getElementById('gameMessage1');
    const gameMessage2 = document.getElementById('gameMessage2');
    const gameMessage3 = document.getElementById('gameMessage3');
    const gameMessage4 = document.getElementById('gameMessage4');

    // schuif tekst 3 naar plek 4
    gameMessage4.innerText = gameMessage3.innerText;

    // schuif tekst 2 op naar plek 3
    gameMessage3.innerText = gameMessage2.innerText;

    // schuif tekst 1 op naar plek 2
    gameMessage2.innerText = gameMessage1.innerText;

    // zet de nieuwe tekst bovenaan
    gameMessage1.innerText = msg;
}

socket.on('new impostor', () => {
    // laat iedereen weten dat er een nieuwe impostor is
    addGameMessage('A new Impostor has been appointed!');
});

socket.on('too few players', (playerCount) => {
    addGameMessage(`There are not enough players, you need at least four (now ${playerCount})!`)
});

socket.on('game ended', (data) => {
    addGameMessage(`${data.impostor} was the Impostor! All other players earned ${data.score} points.`);
});