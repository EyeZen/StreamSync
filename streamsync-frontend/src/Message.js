import React from 'react';
import './Message.css';

function Message({name, msg}) {
    return(
        <div className="Message">
            <div className="Message-logo-container">
                <span className="Message-logo">
                    <img src={"https://avatars.dicebear.com/api/adventurer/"+ name +".svg"} alt='avatar'/>
                </span>
            </div>
            <div className="Message-body">
                <div className="Message-title">
                    <span className="Message-sender">{name}</span>
                </div>
                <span className="Message-content">{msg}</span>
            </div>
        </div>
    )
}

export default Message;