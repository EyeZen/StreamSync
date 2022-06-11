const mongoose = require('mongoose');
const utils = require('../lib/utils');

const User = mongoose.model('User');
const Room = mongoose.model('Room');

function cookieHandler(req, res, next){
    
    var userCookie = req.cookies.user;
    console.log('Entered cookie-handler')
    console.log(userCookie);

    if(userCookie === undefined) {
        console.log(process.env.GLOBAL_ROOM);
        Room.findById(process.env.GLOBAL_ROOM, (err, room) => {
            if(err) {
                console.log('failed to find room')
                return next(err);
            }
            const new_user = new User({
                name: utils.generateName(),
                room_id: room._id.toString(),
            });
            new_user.save()
            .then(user => {
                Room.findByIdAndUpdate(room._id.toString(), { 
                    members: { $push: user.name },
                })
                Room.findById(user.room, (err, room)=>{
                    if(!room || err) {
                        return next(new Error('failed to find room'));
                    }
                    userCookie = {
                        id: user._id.toString(),
                        name: user.name,
                        room: room.name 
                    }
                    req.cookies.user = userCookie;
                    res.cookie('user', JSON.stringify(userCookie), {
                        maxAge: 1000*60*60*24*7, // 7d
                        httpOnly: true
                    });
                    return next();
                })
        })
        })
    } else {
        User.findById(req.cookies.user_id, (err, user)=>{
            if(err) {
                const new_user = new User({
                    name: utils.generateName(),
                    room_id: process.env.GLOBAL_ROOM,
                });
                new_user.save()
                .then(user => {
                    Room.findByIdAndUpdate(process.env.GLOBAL_ROOM, { 
                        members: { $push: user.name },
                    })
                    req.cookies.user_id = user._id.toString();
                    res.cookie('user_id', user._id.toString(), {
                        maxAge: 1000*60*60*24*7, // 7d
                        httpOnly: true
                    })
                    next();
                })
            }
        })
        next();
    }
}

module.exports = () => {
    return cookieHandler;
}