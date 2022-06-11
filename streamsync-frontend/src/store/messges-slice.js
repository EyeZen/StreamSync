import {createSlice} from '@reduxjs/toolkit';

const messagesSlice = createSlice({
    name: 'messages',
    initialState: {totalCount: 0, chats: [], index: -1},
    reducers: {
        addMessage(state, action) {
            window.env.DEBUG && console.log('messages-addMessage', action.payload)
            state.chats.push(action.payload)
            state.totalCount++;
        },
        // push-front
        unshifMessage(state, action) {
            window.env.DEBUG && console.log('messages-unshiftMessage', action.payload)
            state.chats.unshift(action.payload)
            state.totalCount++;
        },
        setCount(state, action) {
            window.env.DEBUG && console.log('messages-setCount', action.payload)
            state.totalCount = action.payload
        },
        setIndex(state, action) {
            window.env.DEBUG && console.log('messages-setIndex', action.payload)
            state.index = action.payload
        }
    }
})

export const messageActions = messagesSlice.actions;

export default messagesSlice;