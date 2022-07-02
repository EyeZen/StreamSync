const express = require('express');
const app = express();
const server = require('http').createServer(app);

const whitelist = ["http://localhost:3006","http://localhost:5500"]
const io = require('socket.io')(server, {
    cors: {
        //   origin: "http://localhost:3006",
        origin: "*",
        // origin: function (origin, callback) {
        //     if (whitelist.indexOf(origin) !== -1) {
        //         callback(null, true)
        //     } else {
        //         callback(new Error('Not allowed by CORS'))
        //     }
        // },
        methods: ["GET", "POST"]
    }
  });

const EVENTS = require('./EventsEnum');

server.listen(3000, ()=>{
    console.log('Server started on port:', 3000);
    console.log('Running in ' + (process.env.DEBUG ? 'Debug' : 'Production/Development') + ' mode' )
})

//////////////////////////////////////////////////

const utils = require('./lib/utils');
const mongoose = require('mongoose');
require('./config/database');
require('./models/rooms');
require('./models/users');

const Room = mongoose.model('Room');
const User = mongoose.model('User');

/** checks if exists, if not creates the specified room and returns room: { name, id }
 * @param room - {name: String, id?: optional}
 * @returns room_doc:Room | { where, err }
 */ 

async function ensureRoom(room) {
    try {
        var room_doc = await Room.findOne(room)
        if(!room_doc) {
            room_doc = await new Room(room).save();
        } 
        return room_doc
    } catch(err) {
        console.error(err);
        return { where: 'ensure-room', err}
    }
}

///////////////////////////////////////////////

/*
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(customMiddleware);
function customMiddleware(req, res, next) {
    var userCookie = req.cookies.user;
    if(userCookie === undefined) {
        createNewUser().then(user => {
            res.cookie('user', JSON.stringify(user), { maxAge: 1000*60*60*24, httpOnly: false  });
            console.log('User assigned the cookie:', JSON.stringify(user));
            next();
        }).catch(err=>next(err));
    } else {
        req.cookies.user = JSON.parse(userCookie);
        console.log('User already has cookie: ', req.cookies.user, typeof(req.cookies.user));
        next();
    }
}
*/
// const cors = require('cors');
// app.use(cors());
app.use('/', express.static('public'))
// app.use(express.json());
// app.use(express.urlencoded({ extended: true}))

// const ROOMS = {};
// function fillRooms(rooms, user, socket) {
//     for(const room of rooms) {
//         ROOMS[room] = ROOMS[room] ?? [];
//         ROOMS[room].push({user: user.name, socket});
//     }
// }

// const unset = setInterval(() => {
//     // send to everyone except sender
//     // ROOMS['amplejockies'] && ROOMS['amplejockies'][0].socket.in('amplejockies').emit(EVENTS.NEW_MSG, {sender: 'admin', message: 'admin-message', when: Date.now()})
//     // send to everyone in the room/group
//     // io.to('amplejockies').emit(EVENTS.NEW_MSG, {sender: 'admin', message: 'admin-message', when: Date.now()})
//     console.log('admin-msg-sent')
// }, 500);
// clearInterval(unset);

/**
 * 
 * @param {User} user 
 * @param {Room} room 
 * @returns user_doc:User | { where, err}
 */
async function addUserToRoom(user, room) {
    try {
        if(!user || !room) throw new Error('user or room undefined')

        var room_doc = await ensureRoom(room);
        var user_doc = await User.findOne(user);
        if(!user_doc) throw new Error('Invalid User');
        if(room_doc.err) throw new Error('possibly the room does not exist');
        if(!room_doc.members.includes(user_doc.name)) {     
            // TODO: xchg name by id
            await Room.findByIdAndUpdate(room_doc._id, {$push: {members: user_doc.name }})
            await User.findByIdAndUpdate(user_doc._id, {$set: {room: room_doc.name}})
            user_doc = await User.findById(user_doc._id)
            // console.debug(user_doc, 'added to room', room_doc)
        } 
        // else console.debug(user_doc, 'already in', room_doc)
        return user_doc;
    } catch(err) {
        console.error(err);
        return { where: 'add-user-to-room', err}
    }
}

/////////////////////// SOCKET /////////////////////////
io.on(EVENTS.IO_CONNECT, socket => {
    process.env.DEBUG && console.log('A User Connected')
    socket.on(EVENTS.INITIALIZE, user => {
        process.env.DEBUG && console.log(EVENTS.INITIALIZE, user);
        (async()=>{
            try{
                var user_doc;
                if( Object.getOwnPropertyNames(user).length === 0 ) { // new-user
                    user_doc = await new User({ name: utils.generateName(), room: '' }).save()
                } else { // old-user
                    user_doc = await User.findOne(user)
                    if(user_doc.room) socket.join(user_doc.room);
                }
                
                // fillRooms([...socket.rooms], user_doc, socket);
                socket.emit(EVENTS.INITIALIZE, user_doc)
            } catch(err) {
                console.log(err);
                socket.emit(EVENTS.RETRY, { src_event: EVENTS.INITIALIZE, err: 'something went wrong! please retry!' });
            }
        })();
    })

    ///////////////////////// ROOM /////////////////////////

    socket.on(EVENTS.CREATE_ROOM, packet => {
        process.env.DEBUG && console.log(EVENTS.CREATE_ROOM, packet);
        (async()=>{
            try {
                const room = { name: utils.generateRoomName() };
                const room_doc = await ensureRoom(room);
                // todo: handle error
                // throws 'Invalid User' error and does not reach next line
                const user_doc = await addUserToRoom(packet.user, room_doc);
                if(user_doc.err || room_doc.err) {
                    if(room_doc.err) await Room.findOneAndDelete(room_doc);
                    throw new Error('failed to create new room')
                }
                /** JOINED ROOM USING ID */
                socket.join(room_doc.name);
                socket.emit(EVENTS.CREATE_ROOM, user_doc);
                // console.debug(user_doc);
            } catch (err) {
                /*
                    throws 'Invalid User'
                    todo : check if room is empty, if yes then delete else don't
                    current: trying to delete the room
                */

                console.error(err);
                socket.emit(EVENTS.RETRY, { err: 'something went wrong! please retry!', src_event: EVENTS.CREATE_ROOM });
            }
        })();
    })
    socket.on(EVENTS.JOIN_ROOM, packet=>{
        process.env.DEBUG && console.log(EVENTS.JOIN_ROOM, packet);
        (async()=>{
            try {
                const room_doc = Room.findOne({ name: packet.room})
                const user_doc = await addUserToRoom(packet.user, room_doc);
                if(user_doc.err || !room_doc) {
                    if(room_doc.err) Room.findOneAndDelete(packet.room);
                    throw new Error('failed to join room')
                }
                /** JOINED ROOM USING ID */
                socket.join(room_doc.name);
                socket.emit(EVENTS.JOIN_ROOM, user_doc);
            } catch (err) {
                console.error(err);
                socket.emit(EVENTS.RETRY, { err: 'something went wrong! please retry!', src_event: EVENTS.JOIN_ROOM });
            }
        })();
    })

    ///////////////////////////// MESSAGES /////////////////////////////////
    socket.on(EVENTS.SEND_MSG, packet => {
        process.env.DEBUG && console.log(EVENTS.SEND_MSG, packet);
        (async() => {
            try {
                // isAuthorized to send msg?
                const user_doc = await User.findOne(packet.user)
                if(!user_doc) throw new Error('user not found!') 
                // authorized
                const room_doc = await Room.findOne({ name: packet.user.room })
                if(!room_doc) throw new Error('user does not belong to the room')
                const new_msg = { 
                    message: packet.message, 
                    sender: packet.user.name, 
                    when: parseInt(packet.when ?? Date.now())
                }
                console.log('message to be sent', new_msg)
                const result = await Room.findByIdAndUpdate(room_doc._id, {$push: { messages: new_msg}}, {new:true})
                if(!result) throw new Error('Failed to update room->messages')
                
                // socket.in(room_doc._id).emit(EVENTS.NEW_MSG, new_msg )
                // console.log(' reaches here ');
                socket.to(room_doc.name).emit(EVENTS.NEW_MSG, new_msg);
                console.log('message sent in room', room_doc.name);
            } catch (err) {
                console.error(err);
                socket.emit(EVENTS.RETRY, { err: 'failed to send meessage! please retry', src_event: EVENTS.SEND_MSG })
            }
        })().catch(err => console.log('leaked error:', err))
    })


    ///////////////////////////// VIDEO STREAM /////////////////////////////

    socket.on('stream-start', packet => {
        process.env.DEBUG && console.log('stream-start', packet);
        (async()=>{
            try {
                const video = {}
                video.src = `/media/${packet.user.id}/${packet.video.name}`
                const room_doc = await Room.findOne({ name: packet.user.room });
                if(!room_doc) {
                    throw new Error('invalid stream-room');
                }
                io.in(room_doc._id).emit('stream-start', { video })
            } catch (err) {
                console.log(err);
                socket.emit(EVENTS.RETRY, { src_event:'stream-start', err: 'something went wrong! please retry!'})
            }
        })();
    })
    

})

// db.rooms.update({name: 'Mt. Fuji'}, { $push: { members: 'admin' }})
// db.rooms.update({name: 'Mt. Fuji'}, { $pull: { members: 'admin' }})
// db.rooms.find({ members: { $elemMatch: {$eq:'admin'} } })

const formidable = require('formidable');
const fs = require('fs');
const cors = require('cors');

var corsOptions = {
    origin: process.env.CLIENT_ORIGIN,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));


function authenticatedAccess(req, res, next) {
    const user_id = req.params.user_id;
    User.findById(user_id, (err, user) => {
        if(err || !user) {
            console.log('unauthenticated-access attempt by', user_id);
            return res.status(401).json({ err: { type: 'unauthorized', msg: 'you are not allowed on this route'}})
        }
        return next();
    })
}
// video uploaded by the user
app.post('/upload/:user_id/:vid_name', authenticatedAccess, (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const vid_name = req.params.vid_name;
        let form = new formidable.IncomingForm();
    
        form.parse(req, (err, fields, files) => {
            if(err) {
                console.log('file-upload-error:', err);
                throw (err);
            }
            // res.writeHead(200, {'content-type': 'text/plain'})
            res.status(200).json({ success: true })
            // res.status(200).json({ user: { name: user.name, id: user.id }, video: { name: vid_name, src: `/uploads/${user_id}/${vid_name}` } })
            const filepath = files.videoFile.filepath
            const new_path = __dirname + `/uploads/${user_id}/${vid_name}`
            const dir_path = __dirname + `/uploads/${user_id}`
            fs.mkdir(dir_path, { recursive: true }, (err, path) => {
                if(err) {
                    console.log('mkdir-error:', err)
                    throw err;
                }
                // write video from temp file path 'files.file.path'
                let writer = fs.createWriteStream(new_path)
                let reader = fs.createReadStream(filepath).pipe(writer)
                writer.on('finish', () => {
                    // once video uploaded, delete temp file
                    fs.unlink(filepath, err => {
                        if(err) {
                            console.log('temp-file-delete-error:',err);
                            throw err;
                        }
                    })
                })
            })
        })
    } catch (err) {
        res.status(400).json({ src_event: 'upload', err: 'something went wrong! please retry!'})
    }
})

// get video broadcasted to all users
app.get('/media/:user_id/:vid_name', authenticatedAccess, (req, res) => {
    const user_id = req.params.user_id;
    const vid_name = req.params.vid_name;

    const filepath =  __dirname + `/uploads/${user_id}/${vid_name}`

    if(fs.existsSync(filepath)) {
        res.status(200).sendFile(filepath)
    } else {
        res.status(404);
    }
});
// /messages/:room_name?index
app.get('/messages/:room_name', (req, res, next) => {
    const res_arr_size = 20;
    const room_name = req.params.room_name;
    const index = Number(req.query.index);
    let result = null;

    process.env.DEBUG && console.log('/messages/:room_name', {index, room_name});

    (async() => {
        try {
            if(!room_name) { throw new Error('room not specified') }
            const room_docs = await Room.findOne({name: room_name})
            if(!room_docs) throw new Error('room not found');
            if(!index) {
                const count = room_docs.messages.length;
                result = { index: count};
            } else {
                const messages = room_docs.messages.slice(Math.max(index-res_arr_size, 0), index)
                const new_index = (index - res_arr_size) < 0 ? -1 : (index - res_arr_size)
                result = { index: new_index, count: Math.min(res_arr_size, room_docs.messages.length) ,messages};
            }

            process.env.DEBUG && console.log(result)
            return res.send(result)
        } catch (err) {
            console.log(err)
            res.send({ err: err.message })
        }
    })();
})