import http from 'http';
import express from 'express';
import socket_io from 'socket.io';

import {simulateGame, runSimulations} from '~/Simulation';

// runSimulations();


/**************************/
/***  Socket.IO server  ***/
/**************************/


const app = express();
const httpAppServer = http.Server(app);
const ioAppSocket = socket_io(httpAppServer);

app.use('/lib', express.static(__dirname + '/../lib'));
app.use('/static', express.static(__dirname + '/frontend'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/App.html');
});

ioAppSocket.on('connection', (socket) => {
    console.log('a user connected');
    // socket.on('disconnect', () => {
    //     console.log('a user disconnected');
    // });

    socket.on('simulate-game', (maxLoops_in) => {
        const maxLoops = parseInt(maxLoops_in);

        if (isNaN(maxLoops) || maxLoops < 0) {
            const inputError = `Input error: maxLoops="${maxLoops_in}" is not valid`;
            console.log(inputError);
            ioAppSocket.emit('error', inputError);
            return;
        }

        simulateGame(maxLoops).then((game) => {
        console.log('hola');

            ioAppSocket.emit('game-state', game.states[0]);
            // TODO launch replay

        }).catch((error) => {
            ioAppSocket.emit('error', error);
        });
    });

});

httpAppServer.listen(3000, () => {
    console.log('listening on *:3000');
});



/*****************************/
/***  Plain NodeJS server  ***/
/*****************************/


// /*const server = */http.createServer((request, response) => {
//     // magic happens here!
//     console.log('magic');

//     runSimulations().then(() => {
//         // Simulation completed

//         // response head
//         response.setStatusCode = 200;
//         response.setHeader('content-type', 'application/json');
//         // response.writeHead(200, {
//         //     'content-type': 'application/json'
//         // });

//         // response body
//         response.write('<div><h1>Blam!</h1></div>');
//         response.end();



//     }).catch((error) => {
//         // Simulation failed
//         response.setStatusCode = 500;
//         response.setHeader('content-type', 'application/json');

//         // response body
//         response.write(JSON.stringify(`<div><h1>Blam!</h1>${error}</div>`));
//         response.end();
//     });
// }).listen(1337);



/*****************************************************/
/***            Simple socket.io server            ***/
/***  Source:  http://socket.io/get-started/chat/  ***/
/*****************************************************/

// const app = express();
// const httpAppServer = http.Server(app);
// const ioAppSocket = socket_io(httpAppServer);

// app.get('/', (req, res) => {
//     res.sendFile('/home/arne/rep/priv/projects/decnalab/src/frontend/index.html');
// });

// ioAppSocket.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//         console.log('a user disconnected');
//     });

//     socket.on('chat message', (msg) => {
//         console.log('msg', msg);
//         ioAppSocket.emit('chat message', msg);
//     });

// });

// httpAppServer.listen(3000, () => {
//     console.log('listening on *:3000');
// });


/************************************************************************************/
/***                          Simple NodeJS server                                ***/
/***  Source:  https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/  ***/
/************************************************************************************/
// http.createServer((request, response) => {
//     const body = [];

//     request.on('error', (err) => {
//         console.error(err);

//     }).on('data', (chunk) => {
//         body.push(chunk);

//     }).on('end', () => {
//         body = Buffer.concat(body).toString();
//         // BEGINNING OF NEW STUFF

//         response.on('error', (err) => {
//             console.error(err);
//         });

//         response.statusCode = 200;
//         response.setHeader('Content-Type', 'application/json');
//         // Note: the 2 lines above could be replaced with this next one:
//         // response.writeHead(200, {'Content-Type': 'application/json'})

//         const responseBody = {
//             headers: request.headers,
//             method: request.method,
//             url: request.url,
//             body: body
//         };

//         response.write(JSON.stringify(responseBody));
//         response.end();
//         // Note: the 2 lines above could be replaced with this next one:
//         // response.end(JSON.stringify(responseBody))

//         // END OF NEW STUFF
//       });
// }).listen(8080);
