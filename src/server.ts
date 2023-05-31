import url from 'url';
import { v4 as uuidv4 } from 'uuid';
import { Room } from './interfaces';
export const serverInit = (rooms:Map<string, Room>, roomQueue:string[]) => ( req, res )=>{
  let bodyAccumulator = '';
  req.on('data', (chunk:Buffer)=>{
    if(chunk){
    bodyAccumulator+=chunk.toString();
    }
  })
  
  req.on('end', ()=>{
    const body = JSON.parse(bodyAccumulator)
    const method = req.method;
    const q = url.parse(req.url, true);
    const { pathname } = q;
    const { userId } = body;
    switch(method){
      case "POST":
        if(pathname === '/game/room') {
          if(!roomQueue.length){
            const roomId = uuidv4();
            roomQueue.push(roomId);
            const room = {
              roomId,
              guests:[],
              w: userId as string,
              b: ''
            }
            rooms.set(roomId, room);
            let gameNotFoundForMS = 0;
            const interval = setInterval(()=>{
              if(gameNotFoundForMS<30){
                console.log('hey');
                const playerRoom = rooms.get(roomId);
                const player2 = playerRoom?.b
                if(player2){
                  const body = JSON.stringify({roomId, w:userId, b:player2});
                  console.log('white player', body);
                  res.writeHead(201);
                  res.write(body);
                  res.end();
                  clearInterval(interval);
                  return;
                }
                gameNotFoundForMS+=1;
              } else{
                rooms.delete(roomId);
                clearInterval(interval);
                res.writeHead(200);
                res.write(JSON.stringify({message: 'No players found'}));
                res.end();
                console.log('Game creation unsuccessfull not enougth players');
              }
              
            },1000);
          } else {
            const roomId = roomQueue.pop();
            const room = rooms.get(roomId);
            rooms.set(roomId, {...room, b:userId});
            const body = JSON.stringify({roomId, w:room.w, b:userId});
            console.log('black player', body);
            res.writeHead(201);
            res.write(body);
            res.end();
          }
          return;
        }
        break;
    }

    res.writeHead(404);
    res.write(JSON.stringify('Not found'));
    res.end();
    return;
  });
}

