# among us backend

This is a minimal backend for a game inspired by Among Us built by students of Avans Informatica Breda.


# acties die je naar de server kan sturen

Een actie stuur je naar de server met 
```js
socket.emit('naam', data);
```
Hier een lijstje met alle acties die je kan versturen, welke data je mee moet sturen en een voorbeeldje.

### Naam aanpassen
Verander de naam van jezelf.
```js
socket.emit('my name', 'naam');
```

### Global chat message
Stuurt een berichtje naar de chat van alle andere spelers, ongeacht in welke kamer ze zitten.
**Tip: dit kan je ook voor notificaties in je spel gebruiken**
```js
socket.emit('global chat message', 'bericht');
```

### Room chat message
Stuurt een berichtje alleen naar de chat van spelers die in dezelfde room zitten als jij.
```js
socket.emit('room chat message', 'bericht');
```

### Nieuwe kamer
Maakt een nieuwe kamer aan. Maakt niet uit als meerdere spelers dezelfde kamer aanmaken, de kamer komt maar 1 keer in het spel.
```js
socket.emit('new room', 'room naam');
```

### Verbind twee kamers
Na dit uit te voeren kan je van de ene naar de andere kamer en terug. Het maakt niet uit als je dit meerdere keren uitvoert, er komt maar 1 verbinding.
```js
socket.emit('link rooms', {
    first: 'eerste room naam',
    second: 'tweede room naam',
});
```

### Naar een andere kamer gaan
Hiermee ga jij naar een andere kamer.
```js
socket.emit('move to', 'room naam');
```

### Een speler vermoorden
Hiermee vermoord je een speler.
```js
socket.emit('kill', 'player naam');
```

### Item uit je inventory achterlaten in een kamer
Hiermee laat je een item achter. Het item moet wel in je inventory zitten, anders is er geen effect.
```js
socket.emit('leave item', 'item');
```


### Pak een item op uit de kamer
Hiermee pak je een item op. Het item is dan niet meer op te pakken door anderen. Het item moet wel in de kamer liggen, anders is er geen effect.
```js
socket.emit('take item', 'item');
```

### Maak een nieuw item
Maakt een nieuw item in de room. Let op: dit wordt voor iedere speler die joint uitgevoerd.
```js
socket.emit('new item', {
    room: 'room naam',
    item: 'item',
});
```

### Maak een nieuw item aan het begin van het spel
Maakt een nieuw item in de room, maar alleen als er 1 speler in het spel is. Zo wordt het maar 1 keer uitgevoerd, ook als meerdere spelers joinen.
```js
socket.emit('new start item', {
    room: 'room naam',
    item: 'item',
});
```

### Maak een nieuw item aan voor een speler
Maakt het item in de inventory van de speler.
```js
socket.emit('new player item', 'item');
```

### Item uit een kamer verwijderen
Dit verwijdert een item uit een kamer.
```js
socket.emit('remove room item', {
    room: 'room naam',
    item: 'item',
});
```

### Item uit een speler verwijderen
Dit verwijdert een item uit de inventory van een speler.
```js
socket.emit('remove player item', 'item');
```

### Je stem uitbrengen
Hiermee stem je op wie de Impostor is. Als een meerderheid op de juiste Impostor heeft gestemd eindigt deze ronde en krijgen alle spelers punten. Hoe eerder de Impostor ontdekt is hoe meer punten je verdient. Maar let op: iedere keer je stem veranderen kost 1 punt!
```js
socket.emit('my vote', 'naam van speler');
```

# events die je van de server krijgt
De server houdt je op de hoogte van de state van het spel met de volgende events. Een goede manier om alle spelers **in sync** te houden is door iedere keer alle info die je had weg te halen uit je webpagina en weer te vullen met de nieuwe info. Zo werkt het voorbeeld ook! Op deze manier kan je naar een event luisteren en er iets mee doen:
```js
socket.on('naam', (data) => {
    // doe hier iets met de data
});
```
Hier een lijstje met alle events die je kan verwachten en welke data je mee gestuurd krijgt.

### Info over de speler
Hiermee krijg je de nieuwe info als er iets aan je speler is veranderd.
```js
socket.on('player info', (info) => {
    // zet info in player gedeelte van je webpagina
});
```
Dit is de info die je krijgt:
```js
info = {
    type: 'player info',
    name: 'jouw naam',
    room: 'room naam',
    items: ['item1', 'item2'],
    score: 12.0,
    vote: 'andere speler naam',
    impostor: true, // dit geeft aan dat jij de impostor bent!
    alive: true, // dit geeft aan of je nog leeft
}
```

### Info over de room
Hiermee krijg je info als er iets aan de kamer waar je in zit is veranderd.
```js
socket.on('room info', (info) => {
    // zet info in room gedeelte van je webpagina
});
```
Dit is de info die je krijgt:
```js
info = {
    type: 'room info',
    name: 'room naam',
    players: ['player 1 naam', 'player2 naam'],
    items: ['item1', 'item2'],
    adjacentRooms: ['naastgelegen room1', 'naastgelegen room2'],
}
```

### Info over de score
Hiermee krijg je info als er iets aan de score is veranderd.
```js
socket.on('score info', (info) => {
    // zet info in score gedeelte van je webpagina
});
```
Dit is de info die je krijgt:
```js
info = [{player: 'player met hoogste score naam', score: 5.0}, {'player met lagere score naam', score: 3.0}]
```

### Info over de votes
Hiermee krijg je info als er iets aan de votes veranderd.
```js
socket.on('vote info', (info) => {
    // zet info in vote gedeelte van je webpagina
});
```
Dit is de info die je krijgt:
```js
info = [{name: 'most sus player naam', count: 3}, {'less sus player naam', count: 2}]
```

### Chat berichten
Chat berichten ontvang je allemaal in 1 event, global en room chat berichten! Je krijgt in het bericht wel mee wat voor type chatbericht het is. In het voorbeeld zie je hoe je met css de berichten anders kan stylen!
Hiermee krijg je info als er een chatbericht is:
```js
socket.on('chat message', (data) => {
    // doe iets met het chatbericht
})
```
Dit is de data die je van het bericht krijgt:
```js
data = {
    name: 'afzender player naam',
    type: 'global', // dit is als global bericht verstuurd, als hier 'room' staat is het als room chat message verstuurd
    msg: 'het chat bericht',
}
```
