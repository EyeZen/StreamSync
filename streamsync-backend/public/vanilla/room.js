socket = io()

// socket.on('connect', ()=>{
//     console.log('connected');
// })
// socket.on('disconnect',()=>{
//     console.log('disconnected');
// })
console.log('user', utils.getUser())
socket.emit('init', utils.getUser())
socket.on('init', user => {
    utils.setUser(user)
    console.log('init',user);
    utils.initializePage();
})

////// DRAG-DROP /////
const videoDropzone = document.getElementById('video-dropzone')

videoDropzone.addEventListener('dragover', event=>{
    // enable to receive drag-drop events
    event.preventDefault()
    document.getElementById('drop__prompt').style.display = 'none';
})
videoDropzone.addEventListener('dragleave', event => {
    document.getElementById('drop__prompt').style.display = 'inline';
})
videoDropzone.addEventListener('dragend', event => {
    document.getElementById('drop__prompt').style.display = 'inline';
})
videoDropzone.addEventListener('drop', event => {
    // do not open file in new tab
    event.preventDefault();
    if(event.dataTransfer.files.length) { 
        document.getElementById('video-input').files = event.dataTransfer.files;
        const vidFile = event.dataTransfer.files[0];
        console.log(vidFile);
        if(vidFile.type.startsWith('video/')) {
            console.log('first is a video')
            // document.getElementById('video-name').textContent = vidFile.name;
            // const video = document.getElementById('video')
            // video.file = vidFile;
            // video.play();

            // const reader = new FileReader();
            // reader.readAsDataURL(vidFile)
            // reader.onload = ()=>{
            //     console.log('reader result:', reader.result)
            //     videoDropzone.style.backgroundImage = `url${reader.result}`
            // }
        } else console.log('first is not a video')
    }
})

// function drawThumbnail(videoFile, width, height) {
//     const canvThumb = document.getElementById('video-thumb');
//     canvThumb.getContext('2d').drawImage(videoFile, 0, 0, width, height);
// }

const form = document.getElementById('video-form')
form.addEventListener('submit', event => {
    let user = JSON.parse(sessionStorage.user)
    let vid_name = document.getElementById('video-input').files[0].name;
    if(user) {
        event.preventDefault()
        let xhr = new XMLHttpRequest()
        let formData = new FormData(form)
        const post_url = `/upload/${user.id}/${vid_name}`
        xhr.open('POST', post_url, true)
        xhr.onreadystatechange = () => {
            if(xhr.readyState == XMLHttpRequest.DONE) {
                const res = xhr.responseText
                console.log('res:', res, typeof res)
                
                socket.emit('stream-start', utils.createPacket({video: { name: vid_name }}))
            }
        }
        xhr.send(formData)

        console.log('video uploaded to:', post_url)

        // this is the time to show loading windows

    } else{
        console.log('user not eligible to upload video');
    }
})

// video js
function attachVideo(src, width=640, height=480) {
    const vjs_options = {
        controls: true,
        preload: 'auto',
        autoplay: true,
        width,
        height,
    }

    var video = document.getElementById('video')
    var player = videojs(video, vjs_options)
    src && player.src({ 
        type: 'video/mp4',
        src
    });
    
    return player;
}

socket.on('stream-start', packet => {
    const player = attachVideo(packet.video.src)
    player.ready(function(){
        toggleVideo();
        console.log('player created');
    })
})

function toggleVideo() {
    document.getElementById('video-dropzone').classList.toggle('invisible')
    document.getElementById('video').classList.toggle('invisible');
}