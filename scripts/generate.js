const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'productos.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const MOCKUPS_DIR = path.join(__dirname, '..', 'mockups');

// =============================================
// REGLAS RESPONSIVE (guardado para futuras landings)
// =============================================
// TODAS las landings DEBEN incluir responsive con 3 breakpoints:
//
// 1. @media (max-width: 900px)  → Tablets
//    - Grids de 2+ cols → 1 columna o 2 max
//    - Hero content → centrado
//    - Sidebar → flex horizontal
//
// 2. @media (max-width: 768px)  → Phones grandes
//    - Padding: 40px → 20px
//    - Font h1: 3rem → 2.2rem
//    - Font p: 1.1rem → 1rem
//    - Botones: reducir padding
//    - Grids: ajustar minmax (min 160px)
//    - Stats/gaps: reducir
//    - Footer: 1 columna
//
// 3. @media (max-width: 480px)  → Phones pequenos
//    - Padding: 20px → 16px
//    - Font h1: 2.2rem → 1.7rem
//    - Font p: 1rem → 0.85rem
//    - Grids: 1 columna o 2 cols ajustadas
//    - Sidebar: apilar vertical
//    - Footer: centrado y apilado
//
// Ver templates/landing-template.css como referencia

function cargarDatos() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function cargarTemplate(nombre) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, nombre), 'utf-8');
}

function guardarMockup(nombre, contenido) {
  fs.writeFileSync(path.join(MOCKUPS_DIR, nombre), contenido, 'utf-8');
  console.log(`  ✔ ${nombre}`);
}

function formatearPrecio(precio) {
  return precio.toFixed(2);
}

function obtenerImagenCategoria(categoriaId) {
  const imagenes = {
    'electricas': '../assets/images/producto-electrica.svg',
    'manuales': '../assets/images/producto-manual.svg',
    'jardin': '../assets/images/producto-jardin.svg',
    'seguridad': '../assets/images/producto-seguridad.svg',
    'construccion': '../assets/images/producto-construccion.svg',
    'automotriz': '../assets/images/producto-automotriz.svg'
  };
  return imagenes[categoriaId] || '../assets/images/producto-electrica.svg';
}

function generarCardProducto(producto, categoriaNombre, categoriaId) {
  const precioOriginal = producto.precio_original
    ? `<span class="precio-original">$${formatearPrecio(producto.precio_original)}</span>`
    : '';

  const badge = producto.precio_original
    ? `<span class="producto-badge">OFERTA</span>`
    : '';

  const specs = producto.specs
    .map(s => `<span class="spec-tag">${s}</span>`)
    .join('');

  const imagenSrc = obtenerImagenCategoria(categoriaId);

  return `
      <div class="producto-card">
        <div class="producto-imagen">
          <img src="${imagenSrc}" alt="${producto.nombre}" class="producto-img">
          ${badge}
        </div>
        <div class="producto-info">
          <div class="producto-categoria">${categoriaNombre}</div>
          <h3 class="producto-nombre">${producto.nombre}</h3>
          <div class="producto-precio">
            <span class="precio-actual">$${formatearPrecio(producto.precio)}</span>
            ${precioOriginal}
          </div>
          <div class="producto-specs">${specs}</div>
          <button class="btn-agregar">Agregar al Carrito</button>
        </div>
      </div>`;
}

function generarCardCategoria(categoria) {
  return `
      <a href="#" class="categoria-card">
        <div class="categoria-icon">${categoria.icono}</div>
        <h3>${categoria.nombre}</h3>
      </a>`;
}

function generarFooterCategorias(categorias) {
  return categorias
    .map(c => `<a href="#">${c.icono} ${c.nombre}</a>`)
    .join('\n        ');
}

function reemplazarVars(html, data) {
  html = html.replace(/\{\{NOMBRE_TIENDA\}\}/g, data.tienda.nombre);
  html = html.replace(/\{\{SLOGAN\}\}/g, data.tienda.slogan);
  html = html.replace(/\{\{WHATSAPP\}\}/g, data.tienda.whatsapp);
  html = html.replace(/\{\{DIRECCION\}\}/g, data.tienda.direccion);
  html = html.replace(/\{\{HORARIO\}\}/g, data.tienda.horario);
  html = html.replace(/\{\{CATEGORIAS_FOOTER\}\}/g, generarFooterCategorias(data.categorias));
  return html;
}

// =============================================
// LANDING 1: PROFESIONAL / CORPORATIVA
// =============================================
function generarLandingProfesional(data) {
  let html = cargarTemplate('landing-profesional.html');

  const productosDestacados = data.productos
    .filter(p => p.destacado)
    .map(p => {
      const cat = data.categorias.find(c => c.id === p.categoria);
      return generarCardProducto(p, cat ? cat.nombre : p.categoria, p.categoria);
    })
    .join('\n');

  const categoriasHtml = data.categorias
    .map(generarCardCategoria)
    .join('\n');

  html = reemplazarVars(html, data);
  html = html.replace('{{CATEGORIAS}}', categoriasHtml);
  html = html.replace('{{PRODUCTOS_DESTACADOS}}', productosDestacados);

  guardarMockup('landing-1-profesional.html', html);
}

// =============================================
// LANDING 2: PROMOCIONAL / OFERTAS
// =============================================
function generarLandingOfertas(data) {
  let html = cargarTemplate('landing-ofertas.html');

  const todosLosProductos = data.productos
    .map(p => {
      const cat = data.categorias.find(c => c.id === p.categoria);
      return generarCardProducto(p, cat ? cat.nombre : p.categoria, p.categoria);
    })
    .join('\n');

  const categoriasHtml = data.categorias
    .map(generarCardCategoria)
    .join('\n');

  html = reemplazarVars(html, data);
  html = html.replace('{{CATEGORIAS}}', categoriasHtml);
  html = html.replace('{{TODOS_LOS_PRODUCTOS}}', todosLosProductos);

  guardarMockup('landing-2-ofertas.html', html);
}

// =============================================
// LANDING 3: MINIMALISTA / CATÁLOGO
// =============================================
function generarLandingCatalogo(data) {
  let html = cargarTemplate('landing-catalogo.html');

  const todosLosProductos = data.productos
    .map(p => {
      const cat = data.categorias.find(c => c.id === p.categoria);
      return generarCardProducto(p, cat ? cat.nombre : p.categoria, p.categoria);
    })
    .join('\n');

  const sidebarCategorias = data.categorias
    .map(c => `<a href="#" class="sidebar-link">${c.icono} ${c.nombre}</a>`)
    .join('\n            ');

  html = reemplazarVars(html, data);
  html = html.replace('{{SIDEBAR_CATEGORIAS}}', sidebarCategorias);
  html = html.replace('{{TODOS_LOS_PRODUCTOS}}', todosLosProductos);
  html = html.replace('{{TOTAL_PRODUCTOS}}', data.productos.length.toString());

  guardarMockup('landing-3-catalogo.html', html);
}

// =============================================
// MAIN
// =============================================
function main() {
  console.log('\n🔨 INGCO Ferretería - Generador de Mockups\n');

  const data = cargarDatos();
  console.log(`  📦 ${data.productos.length} productos cargados`);
  console.log(`  📂 ${data.categorias.length} categorías\n`);

  console.log('  Generando 3 landing pages...\n');

  generarLandingProfesional(data);
  generarLandingOfertas(data);
  generarLandingCatalogo(data);

  console.log('\n  ✅ ¡3 Mockups generados!\n');
  console.log('  Abrí en tu navegador:\n');
  console.log('  → mockups/landing-1-profesional.html   (Profesional/Corporativa)');
  console.log('  → mockups/landing-2-ofertas.html       (Promocional/Ofertas)');
  console.log('  → mockups/landing-3-catalogo.html      (Minimalista/Catálogo)\n');
}

main();
