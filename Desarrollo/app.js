const formulario = document.getElementById('formulario');
const paleta = document.getElementById('paleta');
const aviso = document.getElementById('aviso');
let actual = [];
let temporizador;

const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const tamano = () => Number(formulario.elements.tamano.value);
const textoDe = (color) => (formulario.elements.formato.value === 'hex' ? color.hex : color.hsl);

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

// Elige texto negro o blanco según cuál tenga más contraste con el fondo
function colorDeTexto(hex) {
  const canal = (i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminancia = 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
  return luminancia > 0.179 ? '#000000' : '#ffffff';
}

function generarColor() {
  const h = aleatorio(0, 359);
  const s = aleatorio(55, 90);
  const l = aleatorio(35, 75);
  return { hsl: `hsl(${h}, ${s}%, ${l}%)`, hex: hslAHex(h, s, l), bloqueado: false };
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
  aviso.classList.add('visible');
  clearTimeout(temporizador);
  temporizador = setTimeout(() => aviso.classList.remove('visible'), 2000);
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarAviso(`Copiado ${texto}`);
  } catch {
    mostrarAviso(`No se pudo copiar ${texto}`);
  }
}

function crearTarjeta(color, i) {
  const item = document.createElement('li');
  item.className = 'tarjeta';
  const texto = textoDe(color);

  const muestra = document.createElement('button');
  muestra.type = 'button';
  muestra.className = 'color';
  muestra.style.setProperty('--color', color.hex);
  muestra.style.setProperty('--texto-color', colorDeTexto(color.hex));
  muestra.setAttribute('aria-label', `Copiar color ${texto}`);
  const codigo = document.createElement('span');
  codigo.className = 'codigo';
  codigo.textContent = texto;
  muestra.append(codigo);
  muestra.addEventListener('click', () => copiar(texto));

  const candado = document.createElement('button');
  candado.type = 'button';
  candado.className = 'candado';
  candado.textContent = color.bloqueado ? 'Bloqueado' : 'Bloquear';
  candado.setAttribute('aria-pressed', String(color.bloqueado));
  candado.setAttribute('aria-label', `${color.bloqueado ? 'Desbloquear' : 'Bloquear'} color ${texto}`);
  candado.addEventListener('click', () => {
    color.bloqueado = !color.bloqueado;
    renderizar();
    paleta.children[i].querySelector('.candado').focus();
  });

  item.append(muestra, candado);
  return item;
}

function renderizar() {
  paleta.replaceChildren(...actual.map(crearTarjeta));
}

function generarPaleta() {
  const n = tamano();
  // Los colores bloqueados se conservan; el resto se genera de nuevo
  actual = Array.from({ length: n }, (_, i) => (actual[i]?.bloqueado ? actual[i] : generarColor()));
  renderizar();
  mostrarAviso(`Paleta de ${n} colores generada`);
}

function exportarPaleta() {
  const texto = actual.map((c) => `${c.hex}  ${c.hsl}`).join('\n');
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'paleta.txt';
  enlace.click();
  URL.revokeObjectURL(url);
  mostrarAviso('Paleta exportada');
}

formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  generarPaleta();
});

formulario.addEventListener('change', (e) => {
  if (e.target.name === 'tamano') generarPaleta();
  if (e.target.name === 'formato') {
    renderizar();
    mostrarAviso(`Formato ${e.target.value.toUpperCase()}`);
  }
});

document.getElementById('exportar').addEventListener('click', exportarPaleta);

generarPaleta();
