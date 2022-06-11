import {configureStore} from '@reduxjs/toolkit';
import eventQueueSlice from './event-queue-slice';
import authSlice from './auth-slice';
import messagesSlice from './messges-slice';

const store = configureStore({
    reducer: {
        eventQ: eventQueueSlice.reducer,
        auth: authSlice.reducer,
        messages: messagesSlice.reducer,
    }
})

export default store;


// const state = {
//     auth: {
//         _id: "629e34dc75f9426b66a281b4",
//         username: 'billyjoel266',
//         room: ''
//     },
//     room: null,
//     messages: []
// }
