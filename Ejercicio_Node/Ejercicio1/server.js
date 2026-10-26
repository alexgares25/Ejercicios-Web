const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Leer la configuración del fichero
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

// Pasa segundos a formato "Xh Ym Zs"
function formatoTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  return `${h}h ${m}m ${s}s`;
}

// Pasa bytes a MB
function aMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// Calcula el % de uso de CPU comparando dos lecturas de os.cpus()
function tiemposCPU() {
  let idle = 0, total = 0;
  for (const cpu of os.cpus()) {
    for (const tipo in cpu.times) total += cpu.times[tipo];
    idle += cpu.times.idle;
  }
  return { idle, total };
}
let lecturaAnterior = tiemposCPU();

function usoCPU() {
  const actual = tiemposCPU();
  const idle = actual.idle - lecturaAnterior.idle;
  const total = actual.total - lecturaAnterior.total;
  lecturaAnterior = actual;
  return total === 0 ? 0 : ((1 - idle / total) * 100).toFixed(2);
}

// Información que se muestra al iniciar
function mostrarInfoInicial() {
  console.log('===== INFORMACIÓN DEL SISTEMA =====');
  console.log('Sistema operativo:', os.type(), os.release(), `(${os.platform()})`);
  console.log('Arquitectura:', os.arch());
  console.log('Hostname:', os.hostname());
  console.log('CPU:', os.cpus()[0].model, `x${os.cpus().length} núcleos`);
  console.log('Memoria total:', aMB(os.totalmem()));
  console.log('Directorio home:', os.homedir());
  console.log('Versión de Node.js:', process.version);
  console.log('===================================');
}

// Información periódica (según config.json)
function mostrarInfoPeriodica() {
  const m = config.mostrar;
  console.log(`\n--- ${new Date().toLocaleTimeString()} ---`);
  if (m.cpu) {
    console.log('Uso de CPU:', usoCPU() + ' %');
  }
  if (m.memoria) {
    const usada = os.totalmem() - os.freemem();
    console.log('Memoria del sistema:', aMB(usada), '/', aMB(os.totalmem()));
    console.log('Memoria usada por Node (rss):', aMB(process.memoryUsage().rss));
  }
  if (m.uptimeSistema) {
    console.log('Tiempo activo del sistema:', formatoTiempo(os.uptime()));
  }
  if (m.uptimeNode) {
    console.log('Tiempo ejecutándose Node.js:', formatoTiempo(process.uptime()));
  }
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Servidor de monitorización funcionando\n');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  mostrarInfoInicial();
  setInterval(mostrarInfoPeriodica, config.intervalo * 1000);
});
