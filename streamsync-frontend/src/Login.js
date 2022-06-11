import './Login.css';
import './lib/utility.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { eventQActions } from './store/event-queue-slice';

function Login() {
  const [createRoomTabSelected, selectCreateRoomTab] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');
  const dispatch = useDispatch();

  const createRoom = () => {
    dispatch(eventQActions.createRoom());
  }
  const joinRoom = () => {
    dispatch(eventQActions.joinRoom(joinRoomInput));
    setJoinRoomInput('');
  }

  const createRoomUI = (
    <div className="Login--Room__card-item" id="create-room">
      <p className="center-items">Get a room, enjoy the show!</p>
      <p id="room-id" className="hidden">Room Id</p>
      <button className="clickable" onClick={createRoom}>Create Room</button>
      <span className="progress__cover hidden"></span>
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
