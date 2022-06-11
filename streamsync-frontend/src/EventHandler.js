import { useEffect   } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { eventQActions } from './store/event-queue-slice';
import EVENTS from './EventsEnum';
import { messageActions } from './store/messges-slice';
import { authActions } from './store/auth-slice';
import {storage} from './lib/utility';

import { io } from 'socket.io-client';
window.env.DEBUG && console.log('socket-url', window.env.SOCKET_URL)
const socket = io(window.env.SOCKET_URL)

function EventHandler({ children }) {
    const Qfront = useSelector(state => state.eventQ.front)
    const user = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const messageIndex = useSelector(state => state.messages.index)

    useEffect(() => {
        ///////////////////////// IO CONNECT ///////////////////////////
        socket.on(EVENTS.SOCKET_CONNECT, () => {
            window.env.DEBUG && console.log('connected');
            let user = storage.read(storage.CONSTANTS.AUTH)
            
            user && window.env.DEBUG && console.log('User loaded from Storage')
            !user && window.env.DEBUG && console.log('io-emit', EVENTS.INITIALIZE, undefined);
            
            user = user ? user : {}
            socket.emit('INITIALIZE', user)
        })
    
        //////////////////// INITIALIZE + RETRY ///////////////////////
        socket.on(EVENTS.INITIALIZE, response => {
            window.env.DEBUG && console.log('io',EVENTS.INITIALIZE, response);
            dispatch(authActions.login(response));
            dispatch(eventQActions.initMessages());
        })
        socket.on(EVENTS.RETRY, response => {
            window.env.DEBUG && console.log('io', EVENTS.RETRY, response);
        })
    
        ///////////////////// NEW_MSG /////////////////////////////
        socket.on(EVENTS.NEW_MSG, message => {
            window.env.DEBUG && console.log('io', EVENTS.NEW_MSG, message)
            dispatch(messageActions.addMessage(message))
        })
    
        ///////////////////////////// ROOM ////////////////////////
        socket.on(EVENTS.CREATE_ROOM, updated_user => {  
            window.env.DEBUG && console.log('io', EVENTS.CREATE_ROOM, updated_user)
            dispatch(authActions.login(updated_user))
        })
        socket.on(EVENTS.JOIN_ROOM, updated_user => {  
            window.env.DEBUG && console.log('io', EVENTS.JOIN_ROOM, updated_user)
            dispatch(authActions.login(updated_user))
            dispatch(eventQActions.initMessages())
        })
    },[]);


    // proxy for events from frontend to backend
    // events: frontend --> EventHandler --> backend
    
    useEffect(() => {
        console.log('EventHandler-Pass');
        const handleEvents = async () => {
            if(!Qfront) { return ; }
            window.env.DEBUG && console.log('EventHandler', Qfront)
            switch(Qfront.type) {
            case EVENTS.CREATE_ROOM:
                socket.emit(EVENTS.CREATE_ROOM, user)
                dispatch(eventQActions.updateQueue())
            break;
            case EVENTS.JOIN_ROOM:
                socket.emit(EVENTS.JOIN_ROOM, { room: Qfront.room, user })
                dispatch(eventQActions.updateQueue())
            break;
            case EVENTS.SEND_MSG:
                socket.emit(EVENTS.SEND_MSG, { message: Qfront.message, user })
                dispatch(eventQActions.updateQueue())
            break;
            case EVENTS.INIT_MSGS:
                window.env.DEBUG && console.log('EventHandler', EVENTS.INIT_MSGS);
                if(user.room) {
                ((async() => {
                    const req_url = window.env.SERVER_URL + 'messages/' + user.room
                    const response = await fetch(req_url);
                    const data = await response.json();
                    const index = data.index;
                    
                    dispatch(messageActions.setCount(index))
                    dispatch(messageActions.setIndex(index))
                    dispatch(eventQActions.loadMessages(index))

                    window.env.DEBUG && console.log(EVENTS.INIT_MSGS, req_url);
                    window.env.DEBUG && console.log('message-request-response', data)
                })());}
            break;
            case EVENTS.LOAD_MSGS:
                window.env.DEBUG && console.log('EventHandler',EVENTS.LOAD_MSGS, ', messageIndex', messageIndex);
                if(user.room && messageIndex > -1) {
                (async()=>{
                    const req_url=window.env.SERVER_URL+'messages/'+user.room+'?'+new URLSearchParams({index: messageIndex});
                    const response = await fetch(req_url)
                    const data = await response.json()

                    window.env.DEBUG && console.log('EventHandler',EVENTS.LOAD_MSGS,req_url);
                    window.env.DEBUG && console.log('EventHandler',EVENTS.LOAD_MSGS,data);

                    if(data.err) {
                        console.log(data.err);
                        return;
                    }
                    dispatch(messageActions.setIndex(data.index))
                    const messages = data.messages.reverse();
                    for(let i = 0; i < data.count; i++) {
                        dispatch(messageActions.unshifMessage(messages[i]))
                    }
                })();}
            break;  
            default:
                
            }
        }

        handleEvents()
        .catch(err=>console.error(err));
    }, [Qfront]);

    
    return <>{ children }</>
}

export default EventHandler;