const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    // _id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     index: true,
    //     required: true,
    //     auto: true,
    //   },
    name: String,
    room: String,
});

mongoose.model('User', UserSchema);