const socket = io('/B1');

document.userName.addEventListener("submit", function(e) {
    e.preventDefault(); // prevents page reloading
    const name = document.getElementById('name');
    socket.emit('my name', name.value);
    const form = document.getElementById('userName');
    form.parentNode.removeChild(form);
    return false;
});

document.userInput.addEventListener("submit", function(e) {
    e.preventDefault(); // prevents page reloading
    const text = document.getElementById('text');
    socket.emit('room chat message', text.value);
    text.value = '';
    return false;
});

document.moveTo.addEventListener("submit", function(e) {
    e.preventDefault(); // prevents page reloading
    const moveRoom = document.getElementById('moveRoom');
    socket.emit('move to', moveRoom.value);
    moveRoom.value = '';
    return false;
});

socket.on('chat message', function(data){
    console.log(data);
    let newElement = document.createElement('li');
    newElement.innerText = `${data.name}: ${data.msg}`;
    newElement.classList.add('message');
    if (data.type === 'global') {
        newElement.classList.add('global');
    } else if (data.type === 'room') {
        newElement.classList.add('room');
    }
    document.getElementById('messages').append(newElement);
});

socket.on('room info', function(data) {
    console.log(data);
});

socket.on('player info', function(data) {
    console.log(data);
});
