import { createServer } from 'https';
import { WebSocketServer } from 'ws';
import url from 'url';

const serverFunction = ( req, res )=>{
  const q = url.parse(req.url, true).query;
  console.log(q);
}

const server = createServer();

const wss = new WebSocketServer({ server });

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

const create = (params)=>{}
const join = (params)=>{}
const leave = (params)=>{}

server.listen(3001);
console.log('hello form ts dev server');
