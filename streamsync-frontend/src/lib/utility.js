export const validateUser = (user) => {
    if(!user) {
        window.env.DEBUG && console.log('validateUser: user is undefined', user)
        return false;
    } else if(!user._id) {
        window.env.DEBUG && console.log('valdateUser: user-id not defined', user._id)
        return false;
    } else if(!user.name) {
        window.env.DEBUG && console.log('validateUser: user-name not defined', user.name)
        return false;
    }
    window.env.DEBUG && console.log('user', user);

    return true;
}

export const updateQueue = (state, payload) => {
    // if(state.events.length > 0 && state.front === null) 
    if(state.events.length > 0) 
    {
        state.front = state.events.shift()
        console.log('---------shift------------')
    } else {
        state.front = null;
    }
    
    let events = [];
    for(let i=0; i < state.events.length; i++) events.push(state.events[i]);
    window.env.DEBUG && console.log('eventQ-updateQueue: front', state.front, 'queue', events)
}

export const storage = {
    CONSTANTS: {
        AUTH: 'AUTH'
    },
    read(key) {
        if(
            localStorage.getItem(key)===undefined || 
            localStorage.getItem(key)==='undefined' || 
            localStorage.getItem(key)==='' ||
            !JSON.parse(localStorage.getItem(key))
            ) {
            return null
        } 
        return JSON.parse(localStorage.getItem(key))
    },
    write(key, value) {
        console.log('writing', key, value);
        localStorage.setItem(key, JSON.stringify(value))
    },
    remove(key) {
        localStorage.removeItem(key)
    }
};