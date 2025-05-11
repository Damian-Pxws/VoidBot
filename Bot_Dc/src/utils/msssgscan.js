const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ruta al archivo JSON donde se guardarán los mensajes
const mensajesPath = path.join(__dirname, '../data/mensajes.json');

// Clave única para el cifrado (debe ser de 32 bytes para AES-256)
// Si la clave tiene 64 caracteres (hexadecimal), la convertimos a un Buffer de 32 bytes
let encryptionKey = process.env.ENCRYPTION_KEY || 'default_key_32_bytes_long_1234567890';
if (encryptionKey.length === 64) {
  encryptionKey = Buffer.from(encryptionKey, 'hex'); // Convertir clave hexadecimal a Buffer
} else if (encryptionKey.length !== 32) {
  console.error('❌ La clave de cifrado debe tener exactamente 32 bytes o 64 caracteres hexadecimales.');
  process.exit(1); // Detener el proceso si la clave no es válida
}

// Función para encriptar un mensaje
function encriptarMensaje(mensaje) {
  const iv = crypto.randomBytes(16); // Generar un vector de inicialización único
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(mensaje, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: iv.toString('hex') };
}

// Función para desencriptar un mensaje
function desencriptarMensaje(encryptedData, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Función para guardar un mensaje
function guardarMensaje(usuarioId, mensaje, canalId, servidorId) {
  // Leer el archivo JSON existente o inicializar un objeto vacío
  let data = {};
  if (fs.existsSync(mensajesPath)) {
    const contenido = fs.readFileSync(mensajesPath, 'utf8');
    data = contenido ? JSON.parse(contenido) : {};
  }

  // Asegurarse de que la estructura del archivo JSON sea correcta
  if (!data.mensajes) {
    data.mensajes = [];
  }

  // Encriptar el mensaje
  const { encryptedData, iv } = encriptarMensaje(mensaje);

  // Crear un objeto para el mensaje
  const nuevoMensaje = {
    usuario: usuarioId,
    mensaje: encryptedData, // Mensaje encriptado
    iv: iv,                 // Vector de inicialización
    fecha: new Date().toISOString(),
    id_canal: canalId,
    id_servidor: servidorId,
  };

  // Agregar el mensaje al array
  data.mensajes.push(nuevoMensaje);

  // Guardar los datos actualizados en el archivo JSON
  fs.writeFileSync(mensajesPath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { guardarMensaje, desencriptarMensaje, encryptionKey };