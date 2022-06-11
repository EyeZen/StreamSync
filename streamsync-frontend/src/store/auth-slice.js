import {createSlice} from '@reduxjs/toolkit';
import { validateUser, storage } from '../lib/utility';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        _id: null,
        name: null,
        room: null
    },
    reducers: {
        login(state, action){
            window.env.DEBUG && console.log('auth-login', action)
            const user = action.payload
            if(validateUser(user)) {
                state._id = user._id;
                state.name = user.name;
                state.room = user.room;
                window.env.DEBUG && console.log('login successful');
                storage.write(storage.CONSTANTS.AUTH, user)
            } else {
                window.env.DEBUG && console.log('login rejected');
            }
        },
        logout(state, action){
            window.env.DEBUG && console.log('auth-logout', action)
            state._d = state.name = state.room = null;

            storage.remove(storage.CONSTANTS.AUTH);
        },
    }
})

export const authActions = authSlice.actions;

export default authSlice;