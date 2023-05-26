import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { serverInit } from './server.js';
  
const server = createServer({},serverInit);

const wss = new WebSocketServer({server});

interface Message {
  type: 'create' | 'join' | 'leave';
  params: {}
}

wss.on('connection', function connection(ws){
  ws.on('error', console.error);

  ws.on('message', function message(data){
    const obj = JSON.parse(data.toString()) as Message; 
    const { type, params } = obj;
    
    switch (type) {
      case 'create':
        create(params);
        break;
      case 'join':
        join(params);
        break;
      case 'leave':
        leave(params);
        break;
      default:
        console.error("Unknow message type:", type);
        break;
    }
    ws.send('something')
  })
}
)

const rooms = {};

const create = (params)=>{}
const join = (params)=>{}
const leave = (params)=>{}

server.listen(3001);
console.log('hello form ts dev server');
