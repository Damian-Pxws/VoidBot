module.exports = {
    name: 'user',
    description: '¡Saluda al usuario!',
    execute(message, args) {

        message.channel.send(`¡Hola<@${message.author.id}> es un placer conocerte!`);
    }
};