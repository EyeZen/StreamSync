import {createSlice} from '@reduxjs/toolkit';
import EVENTS from '../EventsEnum';
import { updateQueue } from '../lib/utility';

const eventQueueSlice = createSlice({
    name: 'eventQ',
    initialState: {events: [], front: null},
    reducers: {
        joinRoom(state, action){
            window.env.DEBUG && console.log('eventQ-joinRoom', action.payload)
            state.events.push({ type: EVENTS.JOIN_ROOM, room: action.payload })
            !state.front && updateQueue(state, action.payload)
        },
        initMessages(state) {
            window.env.DEBUG && console.log('eventQ-initMessages')
            state.events.push({ type: EVENTS.INIT_MSGS })
            !state.front && updateQueue(state)    
        },
        sendMessage(state, action){
            window.env.DEBUG && console.log('eventQ-sendMessage', action.payload)
            state.events.push({ type: EVENTS.SEND_MSG, message: action.payload })
            !state.front && updateQueue(state, action.payload)
        },
        loadMessages(state, action) {
            window.env.DEBUG && console.log('eventQ-loadMessages', action.payload)
            state.events.push({ type: EVENTS.LOAD_MSGS, index: action.payload })
            !state.front && updateQueue(state, action.payload)
        },
        updateQueue(state, action){
            updateQueue(state, action.payload)
        },
    }
})

export const eventQActions = eventQueueSlice.actions;

export default eventQueueSlice;