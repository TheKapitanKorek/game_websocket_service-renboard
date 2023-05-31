import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws'
import {Guest, Message, Room} from './interfaces'
import { serverInit } from './server';

const idLength = 36;
const rooms = new Map<string,Room>()
const roomQueue = [];
const server = createServer({requestTimeout:31000},serverInit(rooms, roomQueue));

const wss = new WebSocketServer({server});

wss.on('connection', function connection(ws){
  ws.on('error', console.error);

  ws.on('message', function message(data){
    const obj = JSON.parse(data.toString()) as Message; 
    const { type, params } = obj;
    const { roomId, senderId, content } = params;
    switch (type) {
      case 'join':
        join(roomId, senderId, ws);
        break;
      case 'leave':
        leave(roomId, senderId, ws);
        break;
      case 'move':
        broadcastMessage(senderId, roomId, content)
        console.log('move made');
        break;
      default:
        console.error("Unknow message type:", type);
        break;
    }
    ws.send('something')
  })
})

class ValidationError extends Error{
  constructor(message){
    super(message);
  }
}

const messageValidator = (message)=>{
 console.log(message);
  if(typeof message.roomId !== 'string' || message.roomId.length!==idLength){
    throw new ValidationError('roomId id is invalid');
  } else if(typeof message.guestId !== 'string' || message.guestId.length<1 || message.guestId.length >36){
    throw new ValidationError('guestId is invalid');
  }
}

const broadcastMessage = (senderId, roomId, message)=>{
  const room = rooms.get(roomId);
  if(!room) throw new Error('Room Empty');
  room.guests.forEach((guest:Guest) => {
    if(guest.id !== senderId){
      guest.ws.send(message);
    } 
  })
}

const join = (roomId:string, guestId:string, ws: WebSocket) => {
  console.log('someone joined');
  messageValidator({roomId,guestId});
  const room = rooms.get(roomId);
  let playerColor: 'w'|'b' = 'b'
  if(!room.guests.length || room.guests[0].color === 'b'){
    playerColor = 'w';
  }
  const joiningGuest = {id: guestId, color: playerColor, ws};
  rooms.set(roomId, {...room, guests:[...room.guests,joiningGuest]});
  
  const obj = {
    type: 'join',
    guestId
  }
  ws.send(JSON.stringify(obj)); 
}

const leave = (roomId:string, guestId:string, ws:WebSocket) => {
  messageValidator({roomId, guestId});
  const roomLeft = rooms.get(roomId);
  if(!roomLeft) return;
  const remainingGuests = roomLeft.guests.filter(guest=>guest.id!==guestId);
  if(remainingGuests.length){
    rooms.set(roomId, {...roomLeft, guests: remainingGuests});
  } else {
    rooms.delete(roomId);
  }
  const obj = {
    type: 'leave',
    guestId
  }
  ws.send(JSON.stringify(obj)); //TODO check if this is working
}

server.listen(3001);
console.log('hello form ts dev server');
