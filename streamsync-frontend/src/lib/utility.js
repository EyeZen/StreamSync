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

    return true;
}

export const updateQueue = (state, payload) => {
    window.env.DEBUG && console.log('eventQ-updateQueue', payload)
    if(state.events.length > 0 && state.front === null) {
        state.front = state.events.shift()
    } else {
        state.front = null;
    }
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
        localStorage.setItem(key, JSON.stringify(value))
    },
    remove(key) {
        localStorage.removeItem(key)
    }
};