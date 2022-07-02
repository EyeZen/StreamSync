import {configureStore} from '@reduxjs/toolkit';
import authSlice from './auth-slice';
import messagesSlice from './messges-slice';

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        messages: messagesSlice.reducer,
    }
})

export default store;