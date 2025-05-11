require('dotenv').config();
const encryptionKey = process.env.ENCRYPTION_KEY;
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { DisTube } = require('distube');
const keepAlive = require('./web/keepAlive.js');
const { distubeOptions, setupDistube } = require('./config/distube.config.js');
const birthdayChecker = require('./utils/birthdayChecker.js');

// Crear cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

// Aumentar el límite de oyentes para evitar el warning
client.setMaxListeners(20);

// Propiedades personalizadas
client.commands = new Collection();
client.distube = new DisTube(client, distubeOptions);
client.distube.setMaxListeners(100); // Configurar límite de oyentes para DisTube

// Configurar DisTube
setupDistube(client);

// Ejecutar el verificador de cumpleaños diariamente
setInterval(() => {
  birthdayChecker(client);
}, 24 * 60 * 60 * 1000); // Cada 24 horas

// Cargar comandos
const commandDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandDir)) {
  fs.readdirSync(commandDir).forEach(folder => {
    const folderPath = path.join(commandDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;
    fs.readdirSync(folderPath).forEach(file => {
      if (!file.endsWith('.js')) return;
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      // Manejar comandos exportados como un array
      if (Array.isArray(command)) {
        command.forEach(cmd => {
          if (cmd.name) {
            client.commands.set(cmd.name, cmd);
            console.log(`✅ Comando cargado: ${cmd.name}`);
          }
        });
      } else if (command.name) {
        // Manejar comandos exportados como un solo objeto
        client.commands.set(command.name, command);
        console.log(`✅ Comando cargado: ${command.name}`);
      }
    });
  });
} else {
  console.log('⚠️ El directorio de comandos no existe.');
}

// Manejar interacciones
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  if (customId.startsWith('close-ticket-')) {
    const command = client.commands.get('report');
    if (command && typeof command.handleInteraction === 'function') {
      try {
        await command.handleInteraction(interaction);
      } catch (error) {
        console.error('Error al manejar la interacción del botón:', error);
        await interaction.reply({ content: '❌ Hubo un error al procesar esta interacción.', ephemeral: true });
      }
    }
  } else if (customId.startsWith('help-page-')) {
    const pageNumber = customId.split('-')[2];
    const command = client.commands.get(`ayuda${pageNumber}`);
    if (command && typeof command.execute === 'function') {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error al manejar la interacción de ayuda página ${pageNumber}:`, error);
        await interaction.reply({ content: '❌ Hubo un error al procesar esta interacción.', ephemeral: true });
      }
    }
  }
});

// Cargar eventos
const loadEvents = (dir) => {
  const eventsPath = path.join(__dirname, 'events', dir);
  if (!fs.existsSync(eventsPath)) {
    console.log(`⚠️  El directorio de eventos '${eventsPath}' no existe.`);
    return;
  }

  const files = fs.readdirSync(eventsPath);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const event = require(path.join(eventsPath, file));
    const eventName = file.split('.')[0];
    client.on(eventName, event.bind(null, client));
  }
};

loadEvents('client');
loadEvents('distube');

// Activar servidor Express para mantener vivo
keepAlive();

// Iniciar sesión
console.log('🔐 TOKEN:', process.env.TOKEN);
client.login(process.env.TOKEN)
  .then(() => console.log(`✅ BOT conectado como ${client.user.tag}`))
  .catch(console.error);