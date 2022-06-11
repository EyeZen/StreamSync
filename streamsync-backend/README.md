# TODO
- replace all queries for rooms with room-name, by query using room-id (
    since it is possible that two different rooms may have same name but will never have same id
)
- replace all user queries to that using user hash property(new property, to be added) (
    so that clients don't have access to user-id directly
)
- add hashes to users

# events
## server
### events
- EVENTS.INITIALIZE: user => emit(EVENTS.INITIALIZE, user_doc) | emit(EVENTS.RETRY, {src_event, err})

- EVENTS.CREATE_ROOM: {user} => emit(EVENTS.CREATE_ROOM, user_doc) | retry

- EVENTS.JOIN_ROOM: {user, room} => emit(EVENTS.JOIN_ROOM, user-doc) | retry

- on:stream-start: {user} => emit('stream-start', {video:{src}}) | retry
### requests
- /upload/:user_id/:vid_name : formidable(files) => {succes: true} | {src_event, err}
-/media/:user_id/:vid_name : (void) => video-file | #404


## script.js
- emit(EVENTS.INITIALIZE, user)
- EVENTS.INITIALIZE: user => saved as { user }
- emit(EVENTS.CREATE_ROOM, {user})
- emit(EVENTS.JOIN_ROOM, {user, room})
- EVENTS.CREATE_ROOM: {user} => redirect('/room.html')
- EVENTS.JOIN_ROOM: {user} => redirect('/room.html')


## room.js
- emit(EVENTS.INITIALIZE, user)
- EVENTS.INITIALIZE: user => saved as { user }
- xhr.open('post', /upload/:user_id/:vid_name): res => emit('stream-start', {user, video:{name}})

## video-sample
