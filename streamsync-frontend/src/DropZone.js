import { useState } from 'react';
import './DropZone.css';

import Videojs from './video.js';

function DropZone() {
    // const [videoFile, setVideoFile] = useState(null);
    const [source, setSource] = useState('');
    const [showVideo, setShowVideo] = useState(false);
    
    const handleDragOver = e => {
        e.preventDefault();
        e.stopPropagation();
        console.log('drag-over')
        // setVideoFile(null);
    }
    const handleDragStop = e => {
        e.preventDefault();
        console.log('drag-end/drag-leave')
    }
    const handleDrop = e => {
        e.preventDefault();
        console.log('drop')
        const vidFile = e.dataTransfer.files[0];
        if(vidFile.type.startsWith('video/')) {
            // setVideoFile(vidFile);
            const reader = new FileReader();
            reader.readAsDataURL(vidFile);
            reader.onload = e => {
                setSource(e.target.result);
                setShowVideo(true);
            }
        }
    }

    return (
        <div
            className="DropZone"
            onDragOver={handleDragOver}
            onDragEnd={handleDragStop}
            onDragLeave={handleDragStop}
            onDrop={handleDrop}
        >
            {showVideo && <Videojs autoplay={true} src={source} />}
        </div>
    )
}

export default DropZone;