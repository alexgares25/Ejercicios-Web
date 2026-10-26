const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const fichero = path.join(__dirname, 'cartelera.json');

const server = http.createServer((req, res) => {
  if (req.url === '/peliculas') {
    fs.readFile(fichero, 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'No se pudo leer la cartelera' }));
        return;
      }
      const cartelera = JSON.parse(data);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(cartelera, null, 2));
    });
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Ruta no encontrada. Usa /peliculas' }));
  }
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}/peliculas`);
});
