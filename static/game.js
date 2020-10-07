const socket = io('/B1');

document.userInput.addEventListener("submit", function(e) {
    e.preventDefault(); // prevents page reloading
    let text = document.getElementById('text');
    socket.emit('chat message', text.value);
    text.value = '';
    return false;
});

document.userName.addEventListener("submit", function(e) {
    e.preventDefault(); // prevents page reloading
    const name = document.getElementById('name');
    socket.emit('my name', name.value);
    const form = document.getElementById('userName');
    form.parentNode.removeChild(form);
    return false;
});

socket.on('chat message', function(data){
    console.log(data);
    let newElement = document.createElement('li');
    newElement.innerText = `${data.name}: ${data.msg}`;
    newElement.classList.add('message');
    document.getElementById('messages').append(newElement);
});