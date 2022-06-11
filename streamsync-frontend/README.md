header 
  span > Create Room active
  span > Join Room
div.Room__card--create-room default
  p > Get a room, enjoy the show!
  button > Create Room
  span.progress__cover hidden
div.Room__card--join-room
  p > Been invited to a room? Join into the fun!
  input:text > Enter room code
  button > Join Room
  span.progress__cover hidden

//////////////////////////////////////////////////////////////


const state = {
    auth: {
        id: String,
        name: String,
        room: String // room_id
    },
    room: {
        id: String,
        name: String,
        messages: [{
          sender: String, // user_id
          message: String,
          when: Date, // timestamp
        }] // ids
    }
}