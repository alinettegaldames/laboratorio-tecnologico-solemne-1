const url = 'ws://localhost:8000';
const socket = new WebSocket(url);

const clientId = Math.random().toString(36).substring(2, 10); //esta constante nos ayuda a crear una id aleatoria de cada usuario para diferenciar
                                                              // los mensajes que se estan enviando asi muestran los mensajes a la derech e izquierda

const nameInput = document.getElementById('name-input'); // el identificador de la persona que esta escribiendo
const messageForm = document.getElementById('message-form'); // donde se toma el mensaje
const messageInput = document.getElementById('message-input');// donde se escribe
const messageContainer = document.getElementById('message-container'); // la constante del mensaje que se guarda en la seccion del input
const clientTotal = document.getElementById('client-total'); // esto era para contar la cantidad de usuarios que hay pero lo sacamos


messageForm.addEventListener('submit', (e) => {
  e.preventDefault();// esto ayuda a que no se recargue la pagina cuando enviamos un mensaje
  const mensaje = messageInput.value.trim();
  if (!mensaje) return; // esto nos ayuda a que si no hay ningun mensaje no haga nada

  const data = { 
    id: clientId, //un id aleatorio
    name: nameInput.value || 'anónimo', // el nombre
    message: mensaje, // el mensaje
    dateTime: new Date().toLocaleTimeString() // la hora a que se envia
  };

  socket.send(JSON.stringify(data)); // con websocket envia al servidor convertido en JSON asi podemos ver en el CMD que cosas se hacen o pasa cuando enviamos
                                    // enviamos algun mensaje.
  messageInput.value = '';
  addMessageToUI(data, true)
});

//esto nos ayuda a identificar si el mensaje que se a enviado es del propio usuario, si es del propio usuario lo replica si no es, coloca el mensaje al lado izquierdo
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if(data.id === clientId)return;
  addMessageToUI(data, false);
};

// esto hace que el color del mensaje enviado sea distinto al del mensaje que nos llega, osea se pone azul si el mensaje lo enviamos nosotros y se pone en blanco si el mensaje es de otro usuario
function addMessageToUI(data, isOwnMessage) {
  const li = document.createElement('li');
  li.classList.add(isOwnMessage ? 'message-right' : 'message-left');
  //esto nos ayuda a insertar el contenido de html dentro del <li>
  li.innerHTML = `
    <p> 
      ${data.message}
      <span>${data.name} • ${data.dateTime}</span>
    </p>
  `;
  messageContainer.appendChild(li);
  messageContainer.scrollTop = messageContainer.scrollHeight; //esto es un scroll automatico
}

//y con esto sabemos que nuestro servidor esta conectado
socket.onopen = () => {
  console.log('Conectado al servidor WebSocket');
};
