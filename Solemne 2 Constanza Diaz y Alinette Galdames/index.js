const express = require('express');
const path = require('path');
const websocket = require('express-ws');

const app = express();
websocket(app); //esto inicializa el websocket con la aplicacion de nodeexpress

app.use(express.static('public'));

let clients = []; //esto almacena los clientes conectados a websocket

function handleWs(ws) { // controla las conexiones de usuarios nuevos
  console.log('Nuevo Usuario conectado');
  clients.push(ws);

  ws.on('message', (msg) => {
    const data = JSON.parse(msg); // con esto convierte el mensaje en JSON para poder ser enviado y mostrarlo en html
    console.log('Mensaje recibido:', data);

    // reenviamos el mensaje a todos los usuarios conectados
    clients.forEach((client) => {
      if (client.readyState === 1) { //verifica si hay algun otro usuario conectado 
        client.send(JSON.stringify(data)); // si hay alguno conectado en esta linea se lo envia
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws); // esto elimina al usuario que se desconeto pero no tenemos como un console.log para saberlo 
  });
}

app.ws('/', handleWs); //creo que con esto define la ruta del websocket

app.listen(8000, () => { //inicia el servidor en el localhost 8000
  console.log('Servidor corriendo en http://localhost:8000');
});
