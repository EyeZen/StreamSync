import './App.css';
import Login from './Login';
import Room from './Room';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SocketConfig } from './io';

function App() {
  const user = useSelector(state => state.auth)
  const loggedIntoRoom = user && user.room;
  return (
    <>
      <SocketConfig></SocketConfig>
      <Router>
        <Routes path="/">
          <Route path="/" element={ loggedIntoRoom ? <Navigate to='/room'/> : <Navigate to='/mod-room' /> }/>
          <Route path="/mod-room" element={<Login />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </Router>
    </>
    // <>
    // {
    //   user && user.room 
    //   && <Room />
    //   || <Login />
    // }
    // </>
  )
}

export default App;
