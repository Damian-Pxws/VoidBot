const fs = require('fs');
const path = require('path');

const birthdaysPath = path.join(__dirname, '../data/birthdates.json');

// Asegurarse de que el archivo de cumpleaños existe
function ensureBirthdaysFile() {
  if (!fs.existsSync(birthdaysPath)) {
    fs.writeFileSync(birthdaysPath, '{}'); // Crear el archivo si no existe
  }
}

module.exports = async (client) => {
  ensureBirthdaysFile();
  const data = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const guildId in data) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    const birthdays = data[guildId];
    for (const userId in birthdays) {
      const birthdate = new Date(birthdays[userId]);
      birthdate.setFullYear(today.getFullYear()); // Ajustar al año actual

      const diff = (birthdate - today) / (1000 * 60 * 60 * 24); // Diferencia en días
      if (diff === 7) {
        // Crear un evento en el servidor
        const user = await client.users.fetch(userId);
        const eventName = `🎉 ¡Cumpleaños de ${user.username}!`;
        const eventDescription = `¡Faltan 7 días para el cumpleaños de ${user.username}!`;

        guild.scheduledEvents.create({
          name: eventName,
          scheduledStartTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Fecha del cumpleaños
          scheduledEndTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Duración de 1 hora
          privacyLevel: 'GUILD_ONLY',
          entityType: 'EXTERNAL',
          description: eventDescription,
          location: '¡En el servidor!',
        }).then(() => {
          console.log(`✅ Evento creado para el cumpleaños de ${user.username} en el servidor ${guild.name}.`);
        }).catch(console.error);
      }
    }
  }
};