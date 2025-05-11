const express = require('express');

const keepAlive = () => {
  const app = express();

  app.get('/', (req, res) => {
    res.send('VoidBot está activo 🟢');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🌐 Servidor web activo en el puerto ${PORT}`);
  });
};

module.exports = keepAlive;