const { SpotifyPlugin } = require('@distube/spotify');

const distubeOptions = {
  emitNewSongOnly: true,  // Mantener esta opción si la necesitas
  plugins: [
    new SpotifyPlugin() // Elimina emitEventsAfterFetching
  ]
};

function setupDistube(client) {
  client.distube.on('playSong', (queue, song) => {
    queue.textChannel.send(`🎶 Reproduciendo: \`${song.name}\` - ${song.formattedDuration}`);
  });

  client.distube.on('addSong', (queue, song) => {
    queue.textChannel.send(`➕ Añadido a la cola: \`${song.name}\` - ${song.formattedDuration}`);
  });

  client.distube.on('finish', (queue) => {
    queue.textChannel.send('🎶 La cola ha terminado de reproducirse.');
  });

  client.distube.on('error', (channel, error) => {
    channel.send(`❌ Ocurrió un error: ${error.message}`);
  });

  // Aquí configuramos los eventos leaveOnEmpty, leaveOnFinish y leaveOnStop
  client.distube.on('empty', (queue) => {
    queue.textChannel.send('🔴 No hay usuarios en el canal de voz, desconectando...');
    queue.stop();
  });

  client.distube.on('finish', (queue) => {
    queue.textChannel.send('🎶 La cola ha terminado, desconectando...');
    queue.stop();
  });

  client.distube.on('stop', (queue) => {
    queue.textChannel.send('🔴 La reproducción ha sido detenida.');
  });
}

module.exports = {
  distubeOptions,
  setupDistube
};