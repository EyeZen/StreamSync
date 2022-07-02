import './Room.css';
import './lib/utility.css';
import Message from './Message';
import DropZone from './DropZone';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCommentDots, faEllipsisVertical, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Socket from './io';
import EVENTS from './EventsEnum';

library.add(faCommentDots);
library.add(faEllipsisVertical);
library.add(faPaperPlane);

function Room() {
    // const {room, name } = { room: 'sneakyninjas001', name: 'robjobs999'}
    const { room, name } = useSelector(state => state.auth);
    const [messageInput, setMessageInput] = useState('');
    const chats = useSelector(state => state.messages.chats);

    useEffect(() => {
        console.log('chats', chats);
    },[]);

    /*const chats = [
        {
            when: 1,
            sender: 'Barbe',
            message: 'I had already ron4 it 1 month ago and someone asked mefor a photo of the console and they didn\'t answer me anymore',
        },
        {
            when: 2,
            sender: 'sylwiavargas',
            message: 'Ohhhhhh right. I didn\'t notice that this was your issue! Well, in that ase, we will get to it. On our end, we added this issue to triage.' 
        },
        {
            when: 3,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 4,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 5,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 6,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 7,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 8,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 9,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        },
        {
            when: 10,
            sender: 'phoxhole',
            message: 'Hey - new to StackBlitz and got a project working on my iPad and now need to pull it up on my Mac, so I logged in, found the project nad opened it up, but don\'t see how to edit the index.html file. What I missing?'
        }
    ]*/

    function scrollDown() {
        document.getElementById('Message-container-end')
        .scrollIntoView()
    }
    useEffect(scrollDown, []);

    const handleSend = () => {
        scrollDown();
        if(messageInput.trim() !== ''){
            // dispatch(eventQActions.sendMessage(messageInput.trim()))
            Socket[EVENTS.SEND_MSG](messageInput.trim());
        }
        setMessageInput('');
    }

    return (
        <div className="Room">
            <header>
                <span className="Room__username">{name}</span>
                <span className="Room__name">{room}</span>
                <span className="Room__menu clickable">Menu</span>
            </header>
            <main className="Room__body">
                <section className="Room__stream">
                    <div className="Room__video-info">
                        <span className="clickable">{room}</span>
                        <span className="clickable">Shingeki No Kyojin</span>
                    </div>

                    <DropZone />

                    <div id="video-name">Shingeki No Kyojin</div>
                </section>
                <section className="Room__chats-container">
                    <div className="Room__chats-holder">
                        <div className="Room__chats">
                            <header>
                                <FontAwesomeIcon icon="fa-solid fa-comment-dots" className="logo"/>
                                <span className="room-name">{room}</span>
                                <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" className="options"/>
                            </header>
                            <main className="Message-container">
                                { chats && chats.map(msg => <Message key={msg.when} name={msg.sender} msg={msg.message}/>) }
                                <div id="Message-container-end"></div>
                            </main>
                            <div className="Message-input">
                                <input type="text" placeholder="Message" value={messageInput} onChange={e=>setMessageInput(e.target.value)}/>
                                <span className="Message-btn center-items clickable" onClick={handleSend}>
                                    <FontAwesomeIcon icon="fa-solid fa-paper-plane" />
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Room;