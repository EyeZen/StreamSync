const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

require('./config/database');
require('./models/users');
require('./models/rooms');

const cookieParser = require('cookie-parser');
const cookieHandler = require('./middlewares/cookieHandler');

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Room = mongoose.model('Room');

// Initialization 
Room.findOne({ name: process.env.GLOBAL_ROOM }, (err, room) => {
    if(err || !room) {
        new Room({
            name: process.env.GLOBAL_ROOM,
        }).save()
        .then(room => {
            process.env.GLOBAL_ROOM = room._id.toString();
            console.log('Default Room Created:', process.env.GLOBAL_ROOM);
        });
    } else {
        process.env.GLOBAL_ROOM = room._id.toString();
        console.log('Default room selected:', process.env.GLOBAL_ROOM);
    }
})

const utils = require('./lib/utils');
const { v4: uuidv4 } = require('uuid');
const { emit } = require('process');

server.listen(3000, () => {
    console.log('Server Started on port 3000');
});
// route handling
app.use(cookieParser())
app.use(cookieHandler());
app.use('/', express.static('public'));

// socket handling
io.on('connection', socket => {
    socket.on('init0', function(){
        Room.findById(GLOBAL_ROOM, (err,room) => {
            if(err){ 
                console.error('error-room not found',err);
                socket.emit('error'); // TODO: convert to specific call
                return;
            }
            const user_id = req.user_id;
            User.findById(user_id, (err, user)=>{
                // TODO: convert to specific/room call
                socket.emit('init', {
                    name: user.name,
                    room: room.name,
                });
            });
        });
    });
});
