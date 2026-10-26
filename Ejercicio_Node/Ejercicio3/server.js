const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const port = 3000;
const PALABRAS_POR_DEFECTO = 4;
const MAX_PALABRAS = 20;

// Cargamos el diccionario una sola vez al arrancar (una palabra por línea)
const rutaDiccionario = path.join(__dirname, 'diccionario.txt');
const diccionario = fs.readFileSync(rutaDiccionario, 'utf8')
  .split(/\r?\n/)
  .map(p => p.trim())
  .filter(p => p.length > 0);

console.log(`Diccionario cargado: ${diccionario.length} palabras`);

// Devuelve una contraseña formada por n palabras aleatorias del diccionario
function generarContrasena(n) {
  const palabras = [];
  for (let i = 0; i < n; i++) {
    const indice = crypto.randomInt(diccionario.length);
    palabras.push(diccionario[indice]);
  }
  return palabras.join('-');
}

const server = http.createServer((req, res) => {
  // req.url contiene la ruta y la query, p. ej. "/?palabras=5"
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname !== '/') {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>404 - Página no encontrada</h1>');
    return;
  }

  // Leemos el parámetro "palabras" de la query
  let n = parseInt(url.searchParams.get('palabras'), 10);
  if (isNaN(n) || n < 1) {
    n = PALABRAS_POR_DEFECTO;
  } else if (n > MAX_PALABRAS) {
    n = MAX_PALABRAS;
  }

  const contrasena = generarContrasena(n);
  console.log(`Petición ${req.url} -> ${n} palabras`);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Generador de contraseñas</title></head>
<body>
  <h1>Contraseña aleatoria</h1>
  <p>Número de palabras: ${n}</p>
  <h2>${contrasena}</h2>
  <p>Cambia el número de palabras con <code>?palabras=X</code>, por ejemplo
     <a href="/?palabras=6">/?palabras=6</a></p>
</body>
</html>`);
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}/?palabras=4`);
});
