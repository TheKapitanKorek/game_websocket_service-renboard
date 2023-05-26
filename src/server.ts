import url from 'url';

export const serverInit = ( req, res )=>{
  let bodyAccumulator = '';
  req.on('data', (chunk)=>{
    bodyAccumulator+=chunk.toString();
  })

  req.on('end', ()=>{
    const body = JSON.parse(bodyAccumulator)
    const method = req.method;
    const q = url.parse(req.url, true);
    const {pathname, search, query} = q;
    switch(method){
      case "POST":
        if(pathname === '/game/room') {
          res.writeHead(201);
          res.write(JSON.stringify({roomId:'12345'}));
          res.end();
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
