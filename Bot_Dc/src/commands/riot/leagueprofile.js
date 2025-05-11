const axios = require('axios');

module.exports = {
  name: 'leagueprofile',
  description: 'Obtiene información de tu perfil de League of Legends.',
  async execute(message, args) {
    const riotApiKey = process.env.RIOT_API_KEY; // Asegúrate de tener esta clave en tu archivo .env
    const summonerName = args.join(' '); // El nombre del invocador se pasa como argumento

    // Validar que la clave de la API esté configurada
    if (!riotApiKey) {
      return message.reply('❌ La clave de la API de Riot no está configurada. Por favor, verifica tu archivo `.env`.');
    }

    // Validar que se haya proporcionado un nombre de invocador
    if (!summonerName) {
      return message.reply('❌ Debes proporcionar tu nombre de invocador. Ejemplo: `!leagueprofile TuNombreDeInvocador`');
    }

    try {
      // URL de la API de Riot para obtener información del invocador
      const summonerUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
      
      // Realizar la solicitud a la API de Riot
      const response = await axios.get(summonerUrl, {
        headers: {
          'X-Riot-Token': riotApiKey,
        },
      });

      const summonerData = response.data;

      // Enviar la información del perfil al canal
      await message.channel.send({
        content: `📜 **Perfil de League of Legends**\n\n**Nombre:** ${summonerData.name}\n**Nivel:** ${summonerData.summonerLevel}\n**ID:** ${summonerData.id}`,
      });
    } catch (error) {
      console.error('Error al obtener el perfil de League of Legends:', error);

      // Manejar errores específicos de la API
      if (error.response) {
        if (error.response.status === 403) {
          return message.reply('❌ La clave de la API de Riot no es válida o ha expirado. Por favor, actualízala.');
        } else if (error.response.status === 404) {
          return message.reply('❌ No se encontró un perfil con ese nombre de invocador.');
        } else if (error.response.status === 429) {
          return message.reply('❌ Se han excedido los límites de la API de Riot. Por favor, inténtalo más tarde.');
        }
      }

      // Manejar otros errores
      return message.reply('❌ Hubo un error al intentar obtener tu perfil. Por favor, verifica tu nombre de invocador o inténtalo más tarde.');
    }
  },
};