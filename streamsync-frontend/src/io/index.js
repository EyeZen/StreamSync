import { io } from 'socket.io-client';
import EVENTS from '../EventsEnum';
import { storage } from '../lib/utility'
import { authActions } from '../store/auth-slice';
import { messageActions } from '../store/messges-slice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const RESPONSE = 'RESPONSE';
export default class Socket {
    static user = null;
    static socket = null;
    static isInitialized = false;
    static messageIndex = null;
    static dispatch = null;
    static callbacks = {};

    static update(user, messageIndex) {
        Socket.user = user
        Socket.messageIndex = messageIndex
    }
    static initailize(dispatch) {
        Socket.socket = io(window.env.SOCKET_URL);
        Socket.dispatch = dispatch;
        
        Socket.socket.on(EVENTS.SOCKET_CONNECT, () => {
            console.log("connected");
            Socket.user = storage.read(storage.CONSTANTS.AUTH) ?? {};
            Socket.socket.emit(EVENTS.INITIALIZE, Socket.user);
        });
        for(const event of Object.values(EVENTS)) {
            Socket.socket.on(event, (response) => {
                console.log(event, response);
                Socket[event] && Socket[event](response, true);
            })
        }
    }
    static [EVENTS.INITIALIZE](response) {
        Socket.dispatch(authActions.login(response));
        Socket[EVENTS.INIT_MSGS]();
        Socket.isInitialized = true;
        Socket.__resolveCallbacks(EVENTS.INITIALIZE);
    }
    static [EVENTS.NEW_MSG](response) {
        Socket.dispatch(messageActions.addMessage(response))
        Socket.__resolveCallbacks(EVENTS.NEW_MSG, response);
    }
    static [EVENTS.CREATE_ROOM](response, fromServer=false) {
        if(fromServer) {
            Socket.dispatch(authActions.login(response));
            Socket.__resolveCallbacks(EVENTS.CREATE_ROOM, response.room);
        } else {
            Socket.socket.emit(EVENTS.CREATE_ROOM, { user: Socket.user })
        }
    }
    static [EVENTS.JOIN_ROOM](response, fromServer) {
        if(fromServer) {
            Socket[EVENTS.INITIALIZE](response);
            Socket.__resolveCallbacks(EVENTS.JOIN_ROOM, response.room);
        } else {
            Socket.socket.emit(EVENTS.JOIN_ROOM, { room: response, user: Socket.user })
        }
    }

    static [EVENTS.SEND_MSG](message) {
        const msg = { message, user: Socket.user, when: Date.now()};
        Socket.socket.emit(EVENTS.SEND_MSG, msg);
        // Socket.dispatch(messageActions.addMessage(msg));
    }
    static [EVENTS.INIT_MSGS]() {
        if(Socket.user.room) {
        ((async() => {
            const req_url=`${window.env.SERVER_URL}/messages/${Socket.user.room}`;
            const response = await fetch(req_url);
            const data = await response.json();
            const index = data.index;
            
            Socket.dispatch(messageActions.setCount(index))
            Socket.dispatch(messageActions.setIndex(index))
            Socket[EVENTS.LOAD_MSGS](index);
        })());}
    }
    static [EVENTS.LOAD_MSGS](index = -1) {
        console.log('this ran');
        if(Socket.user.room && (Socket.messageIndex > -1 || index > -1)) {
        (async()=>{
            console.log('not sure if this ran');
            const params = new URLSearchParams({index: Math.max(Socket.messageIndex, index)});
            const req_url=`${window.env.SERVER_URL}/messages/${Socket.user.room}?${params}`;
            const response = await fetch(req_url)
            const data = await response.json()

            if(data.err) {
                console.log(data.err);
                return;
            }
            Socket.dispatch(messageActions.setIndex(data.index))
            console.log('query', req_url);
            console.log('data', data);
            const messages = data.messages ?? [];
            for(let i = data.count - 1; i >= 0; i--) {
                messages[i].message += `[${i}]`
                Socket.dispatch(messageActions.unshifMessage(messages[i]))
            }
        })();}
    }
    static [EVENTS.NEW_MSG](response) {
        Socket.dispatch(messageActions.addMessage(response));
        // console.log('new-message---',response);
    }

    static addEventListener(event, callback) {
        Socket.callbacks[event] = Socket.callbacks[event] ?? [];
        Socket.callbacks[event].push(callback);
    }
    static removeEventListener(event, callback) {
        if(Socket.callbacks[event]) {
            const index = Socket.callbacks[event].indexOf(callback);
            if(index !== -1) {
                Socket.callbacks[event].pop(index);
            }
        }
    }
    static clearListeners(event) {
        delete Socket.callbacks[event];
    }
    static __resolveCallbacks(event, arg) {
        if(!Socket.callbacks[event]) return;
        for(const callback of Socket.callbacks[event]) {
            callback(arg);
        }
    }
}

export function SocketConfig() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth);
    const messageIndex = useSelector(state => state.messages.index);

    useEffect(() => {
        Socket.initailize(dispatch)
    }, []);
    useEffect(() => {
        Socket.update(user, messageIndex);
    },[user, messageIndex]);

    return <></>
}