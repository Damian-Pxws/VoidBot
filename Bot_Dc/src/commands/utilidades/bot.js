module.exports = {
    name: 'bot',
    description: '¡Responde automáticamente si alguien dice hola BOT!',
    execute(message, args) {
            message.channel.send(`¡Hola humano! ¿Deseas o necesitas algo? Puedo ayudarte en lo que necesites, solo escribe ' **!** ' seguido de lo que desees.`);
        }
};