// import { io } from 'socket.io-client';
// import EVENTS from '../EventsEnum';
// import util from '../lib/utility'
// handle incoming packets from backend
// acts as a demodulator between backend and frontend
// backend --> io --> frontend
// console.log('socket-url', window.env.SOCKET_URL)
// const socket = io(window.env.SOCKET_URL)

// socket.on('connect', () => {
//     window.env.DEBUG && console.log('connected');
//     const user = util.readFromStorage('auth')
//     if(user) {
//         // load from storage
        
//     }

//     window.env.DEBUG && console.log('io-emit', EVENTS.INITIALIZE, undefined);
//     // socket.emit(EVENTS.INITIALIZE, {})
//     socket.emit('INITIALIZE', {})
// })
// socket.on('disconnect', () => {
//     window.env.DEBUG && console.log('disconnected');
// })

// export default socket;