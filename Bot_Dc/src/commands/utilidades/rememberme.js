const fs = require('fs');
const path = require('path');

const remembersFilePath = path.join(__dirname, '../../data/remembers.json');

module.exports = {
  name: 'recordatorio',
  description: 'Establece un recordatorio y el bot te avisará por MD.',
  async execute(message, args) {
    // Verifica que el usuario haya proporcionado tiempo y mensaje
    if (args.length < 2) {
      return message.reply('❌ Debes proporcionar un tiempo (en minutos) y un mensaje para el recordatorio. Ejemplo: `!recordatorio 10 Comprar leche`');
    }

    // Extrae el tiempo y el mensaje del recordatorio
    const timeInMinutes = parseInt(args[0]);
    if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
      return message.reply('❌ El tiempo debe ser un número válido mayor a 0. Ejemplo: `!recordatorio 10 Comprar leche`');
    }

    const reminderMessage = args.slice(1).join(' ');

    // Crea el objeto del recordatorio
    const reminder = {
      userId: message.author.id,
      userTag: message.author.tag,
      message: reminderMessage,
      remindAt: Date.now() + timeInMinutes * 60 * 1000, // Tiempo en milisegundos
    };

    // Guarda el recordatorio en el archivo JSON
    let reminders = [];
    if (fs.existsSync(remembersFilePath)) {
      const data = fs.readFileSync(remembersFilePath, 'utf8');
      reminders = data ? JSON.parse(data) : [];
    }
    reminders.push(reminder);
    fs.writeFileSync(remembersFilePath, JSON.stringify(reminders, null, 2), 'utf8');

    // Confirma que el recordatorio ha sido guardado
    await message.reply({
      content: `✅ Tu recordatorio ha sido guardado. Te avisaré en ${timeInMinutes} minuto(s).`,
      ephemeral: true, // Esto hace que el mensaje sea visible solo para el usuario
    });

    // Configura un temporizador para enviar el recordatorio
    setTimeout(async () => {
      try {
        // Envía un mensaje directo al usuario
        await message.author.send(`⏰ ¡Hola! Este es tu recordatorio: "${reminderMessage}"`);
      } catch (error) {
        console.error(`No se pudo enviar el MD al usuario ${message.author.tag}:`, error);
      }

      // Elimina el recordatorio del archivo después de enviarlo
      const updatedReminders = reminders.filter(r => r.remindAt !== reminder.remindAt);
      fs.writeFileSync(remembersFilePath, JSON.stringify(updatedReminders, null, 2), 'utf8');
    }, timeInMinutes * 60 * 1000); // Convierte minutos a milisegundos
  },
};