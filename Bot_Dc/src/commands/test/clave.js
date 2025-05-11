const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/claves.json');

module.exports = {
  name: 'genpass',
  description: 'Genera una contraseña segura y la guarda en un archivo JSON.',
  execute(message, args) {
    // Función para generar una contraseña segura
    function generatePassword(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return password;
    }

    // Generar la contraseña
    const password = generatePassword(10);

    // Crear archivo si no existe
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, '{}'); // Inicializa como objeto vacío
    }

    // Leer datos del archivo JSON
    let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Agregar datos por usuario
    const username = message.author.username;
    if (!data[username]) {
      data[username] = []; // Inicializar como un array para almacenar múltiples contraseñas
    }
    data[username].push({
      password: password,
      createdAt: new Date().toISOString()
    });

    // Guardar datos actualizados en el archivo JSON
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    // Enviar la contraseña al usuario
    message.author.send(`Aquí tienes tu contraseña segura: **${password}**`)
      .then(() => {
        message.channel.send('✅ Tu contraseña ha sido enviada por mensaje privado correctamente, esperemos que le sea de ayuda.');
      })
      .catch(error => {
        console.error('❌ No se pudo enviar el mensaje privado:', error);
        message.channel.send('❌ No pude enviarte un mensaje privado. Por favor, verifica si tienes habilitados los mensajes directos.');
      });
  }
};