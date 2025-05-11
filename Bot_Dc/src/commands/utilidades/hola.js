module.exports = {
    name: 'hola',
    description: '¡Responde con un saludo al usuario!',
    execute(message, args) {

        message.channel.send(`¡Hola!<@${message.author.id}> Estoy aquí para ayudarte, escribe **!ayuda** para saber que comandos tienes disponibles, mi prefijo de uso es ' **!** '`);
    }
};