"use strict";

// Diccionario guardado en una variable (sin tildes ni ñ para evitar problemas al teclear)
const DICCIONARIO = [
  "abeja", "aceite", "agua", "aire", "alfombra", "almendra", "amigo", "anillo", "arbol", "arena",
  "avion", "azucar", "bailar", "ballena", "barco", "batalla", "bosque", "botella", "brisa", "burbuja",
  "caballo", "cafe", "camino", "campana", "canoa", "carbon", "castillo", "cebolla", "cielo", "cocina",
  "cohete", "colina", "conejo", "corazon", "cuaderno", "cueva", "delfin", "desierto", "dragon", "duende",
  "elefante", "escalera", "espejo", "estrella", "faro", "flauta", "fuego", "galleta", "gato", "girasol",
  "globo", "guitarra", "hormiga", "isla", "jardin", "jirafa", "kiwi", "lago", "lampara", "leon",
  "libro", "llave", "luna", "manzana", "mariposa", "martillo", "medusa", "miel", "montana", "mosca",
  "nube", "naranja", "noche", "oceano", "oso", "ordenador", "paloma", "pantalla", "pelota", "pera",
  "piano", "pirata", "planeta", "playa", "puente", "queso", "radio", "raton", "relampago", "reloj",
  "rio", "robot", "rosa", "sandia", "selva", "silla", "sol", "tambor", "tarde", "tigre",
  "tormenta", "tortuga", "trueno", "tunel", "universo", "valle", "ventana", "verano", "viento", "volcan",
  "zanahoria", "zapato", "zorro", "nieve", "roca", "lluvia", "trigo", "pastel", "tren", "bicicleta"
];

// Número aleatorio entero en [0, max) usando una fuente criptográfica
function aleatorio(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function capitalizar(palabra) {
  return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

function generarContraseña({ numPalabras, mayusculas, sinRepetir, separador, añadirNumero }) {
  // Copia del diccionario para poder ir quitando las palabras ya usadas
  const disponibles = [...DICCIONARIO];
  const elegidas = [];

  for (let i = 0; i < numPalabras; i++) {
    const indice = aleatorio(disponibles.length);
    let palabra = disponibles[indice];

    if (sinRepetir) {
      disponibles.splice(indice, 1);
    }
    if (mayusculas) {
      palabra = capitalizar(palabra);
    }
    elegidas.push(palabra);
  }

  let resultado = elegidas.join(separador);
  if (añadirNumero) {
    resultado += aleatorio(100);
  }
  return resultado;
}

// Referencias al DOM
const inputNumPalabras = document.getElementById("numPalabras");
const inputSeparador = document.getElementById("separador");
const chkMayusculas = document.getElementById("mayusculas");
const chkSinRepetir = document.getElementById("sinRepetir");
const chkNumero = document.getElementById("añadirNumero");
const btnGenerar = document.getElementById("generar");
const btnCopiar = document.getElementById("copiar");
const seccionResultado = document.getElementById("resultado");
const salida = document.getElementById("password");
const info = document.getElementById("info");

btnGenerar.addEventListener("click", () => {
  let numPalabras = parseInt(inputNumPalabras.value, 10);
  if (isNaN(numPalabras) || numPalabras < 1) numPalabras = 1;

  const sinRepetir = chkSinRepetir.checked;
  // Si no se pueden repetir, no se puede pedir más palabras que las del diccionario
  if (sinRepetir && numPalabras > DICCIONARIO.length) numPalabras = DICCIONARIO.length;

  const password = generarContraseña({
    numPalabras,
    mayusculas: chkMayusculas.checked,
    sinRepetir,
    separador: inputSeparador.value,
    añadirNumero: chkNumero.checked
  });

  salida.textContent = password;
  seccionResultado.hidden = false;

  // Recomendaciones del NIST: mínimo 8 caracteres, recomendado 15 o más
  const longitud = password.length;
  if (longitud >= 15) {
    info.textContent = `Longitud: ${longitud} caracteres. Buena longitud.`;
    info.className = "ok";
  } else {
    info.textContent = `Longitud: ${longitud} caracteres. Se recomienda un mínimo de 15.`;
    info.className = "mal";
  }
});

btnCopiar.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(salida.textContent);
    btnCopiar.textContent = "¡Copiada!";
  } catch (e) {
    btnCopiar.textContent = "No se pudo copiar";
  }
  setTimeout(() => (btnCopiar.textContent = "Copiar"), 1500);
});
