module.exports = {
  name: 'ping',
  description: 'Responde con Pong! y menciona a un usuario si es mencionado',
  execute(message, args) {
      // Si se menciona a un usuario, el bot responde mencionando a ese usuario
      message.channel.send(`🏓 Pong! La latencia es de: **${Date.now() - message.createdTimestamp}ms** <@${message.author.id}>`);
    } 
  };