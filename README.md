# CGJ Discord Botto

Bot de Discord para el Caracas Game Jam

## Funcionalidades

Algunas de las funcionalidades del bot incluyen:

- Otorgar un rol de ingreso a los miembros que escriban un mensaje en un canal determinado (útil para dar bienvenida y asegurar que los usuarios leen un mensaje inicial)
- Servir de canal para enviar mensajes a los admins
- Enviar mensajes programados a un canal determinado
- Otorgar roles a usuarios cuando reaccionen a un mensaje

## Requerimientos

El bot está escrito en `Node.JS`, ha sido probado con versiones de Node desde la `v14` hasta la `v23`.

## Instalación

Para instalar las dependencias, basta con hacer `npm install` en la carpeta del proyecto.

Luego, copia o renombra el archivo [`.env.sample`](./.env.sample) como `.env` y completa los valores requeridos en el archivo. La mayoría son IDs de mensajes, canales o valores del bot de Discord.

Puedes obtener los IDs requeridos desde la interfaz de Discord habilitando el _Developer mode_ en las opciones avanzadas.

## Despliegue

Instala `pm2` en el servidor en donde se va a ejecutar el bot:

```bash
npm install pm2 -g
```

Clona el repositorio, configura el archivo `.env`, ingresa a la carpeta raíz (donde está el archivo `index.js`) y despliega con `pm2`:

```bash
# Para ejecutar el bot
pm2 start index.js --name cgjbot

# Para comprobar el status del bot
pm2 status

# Para verificar los logs más recientes
pm2 logs cgjbot

# Para monitorear desempeño y logs en tiempo real
pm2 monit cgjbot

# Para detener el bot
pm2 stop cgjbot

# Para eliminar el proceso de pm2 por completo
pm2 delete cgjbot
```

## Estructura

La carpeta [`resources`](./resources/) contiene algunas variables que pueden variar entre ediciones del Caracas Game Jam, ejemplo: mensajes de bienvenida, recursos programados, entre otros.
Se recomienda revisar y actualizar este archivo en la preparación para una edición.

La carpeta [`events`](./events/) contiene acciones que se ejecutan automáticamente por el bot al detectar acciones de los usuarios (no comandos), como dar la bienvenida a un usuario
que acaba de ingresar, o gestionar los roles de un usuario que reacciona al mensaje respectivo.

La carpeta [`commands`](./commands/) contiene comandos que se ejecutan al recibir mensajes de los usuarios dirigidos la bot (e.g. `!admin`).

La carpeta [`utils`](./utils/) contiene funciones de ayuda para su uso en otras secciones del código.

El archivo [`index.js`](./index.js) contiene la rutina principal del bot, en donde se configuran los _intents_ y se inicializa el bot, se cargan
los comandos y eventos, se programan los mensajes y se ejecuta el _loop_ del bot para escuchar mensajes y eventos y responder ante ellos.
