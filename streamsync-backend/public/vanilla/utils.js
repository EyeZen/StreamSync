const utils = {}

function getUser() {
    return window.store.user? window.store.user : {};
    // if(
    //     localStorage.getItem('user')==undefined || 
    //     localStorage.getItem('user')=='undefined' || 
    //     localStorage.getItem('user')=='' ||
    //     !JSON.parse(localStorage.getItem('user'))
    // ) {
    //     return {}
    // } 
    // return JSON.parse(localStorage.getItem('user'))
}
function setUser(user) {
    // console.debug(localStorage.user)
    // localStorage.user = JSON.stringify(user);
    window.store.user = user;
}
function createPacket(obj) {
    return {user: getUser(), ...obj}
}
function initializePage() {
    const user = getUser();
    document.getElementById('room-title').textContent = user.room
    document.getElementById('username').textContent = user.name
}

utils.getUser = getUser;
utils.setUser = setUser;
utils.createPacket = createPacket;
utils.initializePage = initializePage;

window.utils = utils;