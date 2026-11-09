const formulario = document.getElementById('formulario');
const paleta = document.getElementById('paleta');
const aviso = document.getElementById('aviso');
let temporizador;

const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Convierte HSL (h: 0-360, s y l: 0-100) a un código HEX
function hslAHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`.toUpperCase();
}

// Elige texto oscuro o blanco según cuál tenga más contraste con el fondo
function colorDeTexto(hex) {
  const canal = (i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminancia = 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
  return luminancia > 0.179 ? '#111111' : '#ffffff';
}

function generarColor() {
  const h = aleatorio(0, 359);
  const s = aleatorio(55, 90);
  const l = aleatorio(35, 75);
  return { hsl: `hsl(${h}, ${s}%, ${l}%)`, hex: hslAHex(h, s, l) };
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add('visible');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove('visible'), 2000);
}

async function copiar(hex) {
  try {
    await navigator.clipboard.writeText(hex);
    mostrarAviso(`Copiado ${hex}`);
  } catch {
    mostrarAviso(`No se pudo copiar ${hex}`);
  }
}

function crearTarjeta(color) {
  const item = document.createElement('li');
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'color';
  boton.style.setProperty('--color', color.hex);
  boton.style.setProperty('--texto-color', colorDeTexto(color.hex));
  boton.setAttribute('aria-label', `Copiar color ${color.hex}`);

  const codigo = document.createElement('span');
  codigo.className = 'codigo';
  codigo.textContent = color.hex;
  const detalle = document.createElement('span');
  detalle.className = 'detalle';
  detalle.textContent = color.hsl;

  boton.append(codigo, detalle);
  boton.addEventListener('click', () => copiar(color.hex));
  item.append(boton);
  return item;
}

function generarPaleta() {
  const cantidad = Number(formulario.elements.tamano.value);
  const colores = Array.from({ length: cantidad }, generarColor);
  paleta.replaceChildren(...colores.map(crearTarjeta));
  mostrarAviso(`Paleta de ${cantidad} colores generada`);
}

formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  generarPaleta();
});
formulario.addEventListener('change', generarPaleta);

generarPaleta();
