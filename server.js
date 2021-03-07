const http = require('http');
const fs = require('fs');
const path = require('path');
const mimeTypes = require('./mappings/mimeTypes.js');
const uuid = require('./uuid.js');
const port = process.env.PORT || 8080;

const server = http.createServer(function(){});
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});

let clientList = [];

wss.on('connection', (client) => {

    if (!clientList.length || !clientList.filter((c) => c === client)[0]) {
        client._id = uuid;
        client.msgs = [];
        client.isAlive = true;
        clientList.push(client);
    }

    client.on('pong', heartbeat);

    client.on('message', (msg) => {
        
        msg = JSON.parse(msg);
        
        if (msg.user) {
            client.user = msg.user;
            msg.msg = `${client.user} is online`;
            msg.online = true;
        }

        msg.user = client.user;
        msg.date = Date.now();


        msg = JSON.stringify(msg);
        client.msgs.push(msg);

        sendAll(msg);

    });

    client.on('close', () => {

        let i = clientList.indexOf(client);
    
        let msg = {
            user: client.user,
            msg: `${client.user} is offline`,
            offline: true,
            date: Date.now()
        }
        
        msg = JSON.stringify(msg);
        clientList.splice(i, 1);

        sendAll(msg);
    
    });

});

wss.on('close', function close() {
    clearInterval(interval);
});

function noop() {};

const interval = setInterval(function ping() {

    clientList.forEach(function each(client) {
        if (client.isAlive === false) return client.terminate();
  
        client.isAlive = false;
        client.ping(noop);
    });

}, 30000);

interval
  
function heartbeat() {
    this.isAlive = true;
}

function sendAll(msg) {

    clientList.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });

};

server.on('request', (request, response) => {

    const {url} = request;

    let filePath = '.' + url;
    if (filePath == './') {
        filePath = './public/index.html';
    } else if (filePath == './public') {
        console.log('public');
    }

    if (!(/public*/i).test(filePath)) {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end('<h1>404 Not Found</h1>', 'utf-8');
    } else if ((/js*/i).test(filePath) && !(/min*/i).test(filePath)) {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end('<h1>404 Not Found</h1>', 'utf-8');
    } else {

        var extname = String(path.extname(filePath)).toLowerCase();

        var contentType = mimeTypes[extname] || 'application/octet-stream';
    
        console.log('content type', contentType);
        
        fs.readFile(filePath, function (error, content) {
    
            if (error) {
    
                console.log(error);
            
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('<h1>404 Not Found</h1>', 'utf-8');

            } else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
    
        });

    }

});
    
server.listen(port);

console.log(`listening at port: ${port}`);