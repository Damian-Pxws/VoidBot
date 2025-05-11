module.exports = {
    name: 'roll',
    description: '¡Tira un dado con el número de caras que especifiques!',
    execute(message, args) {
      // Definir el número de caras por defecto (6) si no se especifica uno
      const sides = args[0] ? parseInt(args[0]) : 6;
      
      if (isNaN(sides) || sides <= 1 || sides >= 1001) {
        return message.channel.send('Por favor, ingresa un número válido de caras para el dado (mayor que 1 y menor a 1000).');
      }
  
      // Realizar la tirada del dado
      const resultado = Math.floor(Math.random() * sides) + 1; // Número entre 1 y el número de caras
  
      message.channel.send(`🎲 Has tirado un dado de **${sides}** caras y salió el número **${resultado}**`);
    }
  };