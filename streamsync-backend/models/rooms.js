const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    name: String,
    members: {type: [], default: []},
    messages: {type: [{message: String, sender: String, when: { type: Date, default: Date.now}}], default: []},
})

const Room = mongoose.model('Room', RoomSchema);