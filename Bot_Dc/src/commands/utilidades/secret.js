module.exports = {
    name: 'secret',
    description: '¡Responde con un mensaje privado al usuario!',
    execute(message, args) {

        message.author.send(`¡Hola <@${message.author.id}> también te puedo ayudar por aquí si lo deseas! Escribe **!ayuda** o ' **!** ' y tu comando si lo conoces y te ayudare encantado`);
    }
};