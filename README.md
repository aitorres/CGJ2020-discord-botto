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
