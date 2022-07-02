import './Login.css';
import './lib/utility.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Socket from './io';
import EVENTS from './EventsEnum';

import { authActions } from './store/auth-slice';
import { useNavigate } from 'react-router';

function Login() {
  const [createRoomTabSelected, selectCreateRoomTab] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const roomName = useSelector(state => state.auth.room);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function loadRoom() {
    navigate('/room', { replace: true });
  }
  
  const createRoom = () => {
    Socket[EVENTS.CREATE_ROOM]();
  }
  const joinRoom = () => {
    if(joinRoomInput !== '') {
      Socket[EVENTS.JOIN_ROOM](joinRoomInput);
      setJoinRoomInput('');
    }
  }
  useEffect(() => {
    Socket.addEventListener(EVENTS.JOIN_ROOM, loadRoom);

    return () => Socket.removeEventListener(EVENTS.JOIN_ROOM, loadRoom);
  }, []);

  const createRoomUI = (
    <div className="Login--Room__card-item" id="create-room">
      {
        (!roomName) ? 
        <>
          <p className="center-items">Get a room, enjoy the show!</p>
          <button className="clickable" onClick={createRoom}>Create Room</button>
        </> 
        : 
        <>
          <p className="center-items">New Room Created</p>
          <p className="center-items"><i>{roomName}</i></p>
          <p className="center-items">Share room-name to let others join your room</p>
          <button className="clickable" onClick={loadRoom}>Open Room</button>
        </>
      }
      {/* <span className="progress__cover hidden"></span> */}
    </div>
  )
  const joinRoomUI = (
    <div className="Login--Room__card-item" id="join-room">
      <p className="center-items">Been invited to a room? Join into the fun!</p>
      <input 
        type="text" 
        placeholder="Enter room code" 
        value={joinRoomInput}
        onChange={e => setJoinRoomInput(e.target.value)} 
      />
      <button className="clickable" onClick={joinRoom}>Join Room</button>
      <span className="progress__cover hidden"></span>
    </div>
  )

  return (
    <div className="Login">
      <div className='Login--logout'>
        <button onClick={() => dispatch(authActions.logout())}>Logout</button>
      </div>
      <div className="Login--Room__card center-items">
        <div className="Login--Room__card-body">
          <header>
            <span 
              className={"Login--Room__header-tab clickable "+(!createRoomTabSelected && "active-tab")}
              onClick={()=>selectCreateRoomTab(false)}
            >Join Room</span>
            <span 
              className={"Login--Room__header-tab clickable "+(createRoomTabSelected && "active-tab")}
              onClick={()=>selectCreateRoomTab(true)}
            >Create Room</span>
          </header>

          {
            createRoomTabSelected ? createRoomUI : joinRoomUI
          }
        </div>
      </div>
    </div>
  );
}

export default Login;
