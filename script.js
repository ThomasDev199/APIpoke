// ============================================================
// Explorador Pokémon - JavaScript puro con PokeAPI
// ============================================================

const URL_API = 'https://pokeapi.co/api/v2/pokemon';

// Listas de Pokémon incluidas en el código (ya no se usan archivos locales).
// Formato "txt": un nombre por línea.
const LISTA_TXT = `pikachu
charizard
bulbasaur
squirtle
eevee
mewtwo
gengar
snorlax
lucario
gyarados`;

// Formato "json": arreglo de objetos con id y nombre.
const LISTA_JSON = [
  { "id": 4, "nombre": "charmander" },
  { "id": 39, "nombre": "jigglypuff" },
  { "id": 52, "nombre": "meowth" },
  { "id": 54, "nombre": "psyduck" },
  { "id": 66, "nombre": "machop" },
  { "id": 129, "nombre": "magikarp" },
  { "id": 149, "nombre": "dragonite" },
  { "id": 175, "nombre": "togepi" },
  { "id": 197, "nombre": "umbreon" },
  { "id": 249, "nombre": "lugia" },
  { "id": 257, "nombre": "blaziken" },
  { "id": 658, "nombre": "greninja" }
];

// Referencias al DOM
const contenedor = document.getElementById('resultados');
const inputBusqueda = document.getElementById('input-busqueda');
const btnTxt = document.getElementById('btn-txt');
const btnJson = document.getElementById('btn-json');
const btnApi = document.getElementById('btn-api');
const btnBuscar = document.getElementById('btn-buscar');

// Traducción de los tipos de inglés a español (nombre y clase CSS)
const TIPOS = {
  normal:   { nombre: 'Normal',    clase: 'tipo-normal' },
  fire:     { nombre: 'Fuego',     clase: 'tipo-fuego' },
  water:    { nombre: 'Agua',      clase: 'tipo-agua' },
  grass:    { nombre: 'Planta',    clase: 'tipo-planta' },
  electric: { nombre: 'Eléctrico', clase: 'tipo-electrico' },
  ice:      { nombre: 'Hielo',     clase: 'tipo-hielo' },
  fighting: { nombre: 'Lucha',     clase: 'tipo-lucha' },
  poison:   { nombre: 'Veneno',    clase: 'tipo-veneno' },
  ground:   { nombre: 'Tierra',    clase: 'tipo-tierra' },
  flying:   { nombre: 'Volador',   clase: 'tipo-volador' },
  psychic:  { nombre: 'Psíquico',  clase: 'tipo-psiquico' },
  bug:      { nombre: 'Bicho',     clase: 'tipo-bicho' },
  rock:     { nombre: 'Roca',      clase: 'tipo-roca' },
  ghost:    { nombre: 'Fantasma',  clase: 'tipo-fantasma' },
  dragon:   { nombre: 'Dragón',    clase: 'tipo-dragon' },
  dark:     { nombre: 'Siniestro', clase: 'tipo-siniestro' },
  steel:    { nombre: 'Acero',     clase: 'tipo-acero' },
  fairy:    { nombre: 'Hada',      clase: 'tipo-hada' }
};

// ------------------------------------------------------------
// Utilidades de interfaz
// ------------------------------------------------------------

/** Muestra un mensaje (cargando, error, aviso) en el contenedor. */
function mostrarMensaje(texto) {
  contenedor.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'mensaje';
  p.textContent = texto;
  contenedor.appendChild(p);
}

/** Marca visualmente el último botón utilizado. */
function marcarBoton(boton) {
  [btnTxt, btnJson, btnApi].forEach(b => b.classList.remove('activo'));
  if (boton) boton.classList.add('activo');
}

// ------------------------------------------------------------
// Acceso a datos
// ------------------------------------------------------------

/**
 * Consulta un Pokémon en PokeAPI por nombre o ID.
 * Lanza un error con la propiedad "estado" si la respuesta no es correcta.
 */
async function obtenerPokemon(idONombre) {
  const respuesta = await fetch(`${URL_API}/${encodeURIComponent(idONombre)}`);
  if (!respuesta.ok) {
    const error = new Error(`Error HTTP ${respuesta.status}`);
    error.estado = respuesta.status;
    throw error;
  }
  return respuesta.json();
}

// ------------------------------------------------------------
// Creación de tarjetas
// ------------------------------------------------------------

/** Pone la primera letra en mayúscula. */
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Construye la tarjeta HTML de un Pokémon. */
function crearTarjeta(pokemon) {
  // Imagen: artwork oficial o sprite normal como respaldo
  const imagen =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '';

  // ID con formato #001
  const id = '#' + String(pokemon.id).padStart(3, '0');

  // Conversión de unidades: decímetros -> metros, hectogramos -> kilogramos
  const altura = (pokemon.height / 10).toFixed(1);
  const peso = (pokemon.weight / 10).toFixed(1);

  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  // Etiquetas de tipos (se traducen al español cuando es posible)
  const tiposHTML = pokemon.types
    .map(t => {
      const info = TIPOS[t.type.name] || { nombre: capitalizar(t.type.name), clase: '' };
      return `<span class="tipo ${info.clase}">${info.nombre}</span>`;
    })
    .join('');

  tarjeta.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${capitalizar(pokemon.name)}" loading="lazy">
    <h3>${capitalizar(pokemon.name)}</h3>
    <p class="id">${id}</p>
    <div class="tipos">${tiposHTML}</div>
    <p class="datos">Altura: ${altura} m<br>Peso: ${peso} kg</p>
  `;

  return tarjeta;
}

/** Limpia el contenedor y muestra una tarjeta por cada Pokémon de la lista. */
function mostrarPokemones(lista) {
  contenedor.innerHTML = '';
  if (!lista.length) {
    mostrarMensaje('No hay Pokémon para mostrar.');
    return;
  }
  lista.forEach(pokemon => contenedor.appendChild(crearTarjeta(pokemon)));
}

// ------------------------------------------------------------
// Manejo de errores
// ------------------------------------------------------------

// ------------------------------------------------------------
// Botones de carga
// ------------------------------------------------------------

/** Toma los nombres de la lista de texto (uno por línea) y consulta cada uno en PokeAPI. */
async function cargarTxt() {
  marcarBoton(btnTxt);
  mostrarMensaje('Cargando...');

  try {
    const nombres = LISTA_TXT
      .split(/\r?\n/)
      .map(n => n.trim().toLowerCase())
      .filter(n => n !== '');

    const pokemones = await Promise.all(nombres.map(n => obtenerPokemon(n)));
    mostrarPokemones(pokemones);
  } catch (error) {
    console.error(error);
    mostrarMensaje('Ocurrió un error al consultar PokeAPI. Revisa tu conexión e inténtalo de nuevo.');
  }
}

/** Toma la lista JSON (id y nombre) y consulta cada Pokémon por su id en PokeAPI. */
async function cargarJson() {
  marcarBoton(btnJson);
  mostrarMensaje('Cargando...');

  try {
    const pokemones = await Promise.all(LISTA_JSON.map(item => obtenerPokemon(item.id)));
    mostrarPokemones(pokemones);
  } catch (error) {
    console.error(error);
    mostrarMensaje('Ocurrió un error al consultar PokeAPI. Revisa tu conexión e inténtalo de nuevo.');
  }
}

/** Pide la lista de 20 Pokémon a la API y luego el detalle de cada uno. */
async function cargarAPI() {
  marcarBoton(btnApi);
  mostrarMensaje('Cargando...');

  try {
    const respuesta = await fetch(`${URL_API}?limit=20`);
    if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
    const lista = await respuesta.json();

    // Se pide el detalle de todos en paralelo
    const pokemones = await Promise.all(lista.results.map(p => obtenerPokemon(p.name)));
    mostrarPokemones(pokemones);
  } catch (error) {
    console.error(error);
    mostrarMensaje('No se pudo cargar la lista desde PokeAPI. Inténtalo de nuevo más tarde.');
  }
}

// ------------------------------------------------------------
// Buscador
// ------------------------------------------------------------

/** Busca un Pokémon por nombre o ID y muestra una sola tarjeta. */
async function buscarPokemon() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  marcarBoton(null);

  if (texto === '') {
    mostrarMensaje('Escribe un nombre o ID para buscar.');
    return;
  }

  mostrarMensaje('Cargando...');

  try {
    const pokemon = await obtenerPokemon(texto);
    mostrarPokemones([pokemon]);
  } catch (error) {
    if (error.estado === 404) {
      mostrarMensaje('No se encontró ningún Pokémon con ese nombre o ID');
    } else {
      console.error(error);
      mostrarMensaje('Ocurrió un error al buscar. Revisa tu conexión e inténtalo de nuevo.');
    }
  }
}

// ------------------------------------------------------------
// Eventos
// ------------------------------------------------------------
btnTxt.addEventListener('click', cargarTxt);
btnJson.addEventListener('click', cargarJson);
btnApi.addEventListener('click', cargarAPI);
btnBuscar.addEventListener('click', buscarPokemon);
inputBusqueda.addEventListener('keydown', evento => {
  if (evento.key === 'Enter') buscarPokemon();
});
