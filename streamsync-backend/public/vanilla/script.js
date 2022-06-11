const socket = io();

// socket.on('connect', () => {
//     console.log('connected');
// })
// socket.on('disconnect', () => {
//     console.log('disconnected');
// })

socket.emit('init', utils.getUser());
socket.on('init', packet => {
    utils.setUser(packet)
    console.log(utils.getUser())
    utils.initializePage();
})
function createRoom() {
    socket.emit('create-room', utils.createPacket())
}
function joinRoom(roomName) {
    if(!roomName) throw new Error('invalid room-name passed to join-room');
    socket.emit('join-room', utils.createPacket({ room: roomName}))
}

socket.on('create-room', packet => {
    // TODO: update user-room, redirect to new-room
    utils.setUser(packet.user)
    console.log('room created:',packet);
    location.href = '/room.html';
})

socket.on('join-room', packet => {
    // TODO: update user-room, redirect to joined-room
    utils.setUser(packet.user)
    location.href='/room.html';
    console.log('joined room:', packet);
})


//////////////////////////////////////////////////

// socket.on('msg', packet => {
//     console.log('msg:', packet);
// })
// document.querySelector('form').onsubmit = e => {
//     e.preventDefault()
//     const inp = document.querySelector('input[type="text"]');

//     const value = inp.value;
//     inp.value = '';

//     value && socket.emit('msg', {msg: value, user: JSON.parse(sessionStorage.user)})    
// }

document.getElementById('btn-create-room').onclick = e => {
    e.preventDefault();
    createRoom();
}
document.getElementById('btn-join-room').onclick = e => {
    e.preventDefault();
    const inp = document.getElementById('input__room-name')
    joinRoom(inp.value);
    inp.value = '';
}