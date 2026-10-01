// --- URL BASE DEL BACKEND ---
const API_URL = 'http://localhost:3000';

// Variables globales para almacenar los datos que vengan de tu base de datos
let CATEGORIES = [];
let RESTAURANTS = [];
let COMERCIO_ACTUAL = null;

// --- FUNCIÓN PARA CARGAR LOS DATOS DESDE NESTJS ---
async function cargarDatosDesdeBackend() {
  try {
    CATEGORIES = [
      { id: 'burger', name: 'Hamburguesas', icon: 'fa-burger', color: 'bg-amber-100 text-amber-600' },
      { id: 'pizza', name: 'Pizzas', icon: 'fa-pizza-slice', color: 'bg-rose-100 text-rose-600' },
      { id: 'sushi', name: 'Sushi', icon: 'fa-fish', color: 'bg-emerald-100 text-emerald-600' },
      { id: 'cafe', name: 'Café & Dulces', icon: 'fa-mug-hot', color: 'bg-orange-100 text-orange-600' },
      { id: 'empanadas', name: 'Empanadas', icon: 'fa-box', color: 'bg-yellow-100 text-yellow-600' },
      { id: 'helado', name: 'Helados', icon: 'fa-ice-cream', color: 'bg-pink-100 text-pink-600' }
    ];

    const respuestaComercios = await fetch(`${API_URL}/comercios`);
    if (!respuestaComercios.ok) {
      throw new Error('Error al obtener los comercios del backend');
    }

    RESTAURANTS = await respuestaComercios.json();
    console.log("Comercios cargados desde PostgreSQL:", RESTAURANTS);

    renderCategories();
    renderRestaurants(RESTAURANTS);

  } catch (error) {
    console.error("Hubo un problema al conectar con el backend de NestJS:", error);
  }
}

// --- FUNCIÓN PARA PINTAR LAS CATEGORÍAS ---
function renderCategories() {
  const contenedor = document.getElementById('categoriesContainer');
  if (!contenedor) return;

  contenedor.innerHTML = CATEGORIES.map(cat => `
    <button onclick="filterByCategory('${cat.id}')" class="flex flex-col items-center gap-2 shrink-0 group">
      <div class="w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
        <i class="fa-solid ${cat.icon}"></i>
      </div>
      <span class="text-xs font-semibold text-slate-700">${cat.name}</span>
    </button>
  `).join('');
}

// --- FUNCIÓN PARA PINTAR LOS COMERCIOS (RESTAURANTES) ---
function renderRestaurants(lista) {
  const contenedor = document.getElementById('restaurantsGrid');
  if (!contenedor) return;

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">No hay comercios disponibles por ahora.</p>`;
    return;
  }

  contenedor.innerHTML = lista.map(comercio => `
    <div onclick="abrirComercio(${comercio.id})" class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group">
      <div class="h-36 bg-slate-200 relative overflow-hidden">
        <img src="${comercio.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80'}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="${comercio.nombre}">
        ${!comercio.abierto ? '<div class="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><span class="text-white font-bold text-sm">Cerrado</span></div>' : ''}
      </div>
      <div class="p-4">
        <h3 class="font-extrabold text-slate-900 truncate">${comercio.nombre}</h3>
        <p class="text-xs text-slate-400 mt-0.5">${comercio.categoria || ''}</p>
        <div class="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span><i class="fa-solid fa-location-dot text-rose-400 mr-1"></i>${comercio.direccion || 'Sin dirección'}</span>
        </div>
        <div class="mt-2 text-xs font-semibold text-slate-600">
          Envío: $${comercio.costo_envio_base ?? '0'}
        </div>
      </div>
    </div>
  `).join('');
}

// Filtro simple por categoría
function filterByCategory(categoriaId) {
  const cat = CATEGORIES.find(c => c.id === categoriaId);
  if (!cat) return;
  const filtrados = RESTAURANTS.filter(r => (r.categoria || '').toLowerCase() === cat.name.toLowerCase());
  renderRestaurants(filtrados.length ? filtrados : RESTAURANTS);
}

// --- CAMBIAR ENTRE PANTALLAS (home / restaurante / tracking) ---
function showView(nombreVista) {
  const vistas = {
    home: document.getElementById('homeView'),
    restaurant: document.getElementById('restaurantView'),
    tracking: document.getElementById('trackingView')
  };

  Object.values(vistas).forEach(v => {
    if (v) v.classList.add('hidden');
  });

  if (vistas[nombreVista]) {
    vistas[nombreVista].classList.remove('hidden');
    window.scrollTo(0, 0);
  }
}

// --- ABRIR UN COMERCIO: trae sus productos reales y muestra la vista de menú ---
async function abrirComercio(id) {
  try {
    COMERCIO_ACTUAL = RESTAURANTS.find(r => r.id === id);
    if (!COMERCIO_ACTUAL) return;

    // Encabezado del restaurante
    const header = document.getElementById('restaurantHeader');
    if (header) {
      header.innerHTML = `
        <h1 class="text-2xl font-black text-slate-900">${COMERCIO_ACTUAL.nombre}</h1>
        <p class="text-sm text-slate-500">${COMERCIO_ACTUAL.categoria || ''} · ${COMERCIO_ACTUAL.direccion || ''}</p>
      `;
    }

    // Traer los productos reales de este comercio desde el backend
    const respuesta = await fetch(`${API_URL}/comercios/${id}/productos`);
    if (!respuesta.ok) {
      throw new Error('Error al obtener los productos del comercio');
    }
    const productos = await respuesta.json();
    console.log(`Productos de ${COMERCIO_ACTUAL.nombre}:`, productos);

    renderProductos(productos);
    showView('restaurant');

  } catch (error) {
    console.error('Hubo un problema al abrir el comercio:', error);
  }
}

// --- PINTAR LOS PRODUCTOS DEL MENÚ ---
function renderProductos(lista) {
  const contenedor = document.getElementById('menuProductsGrid');
  if (!contenedor) return;

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `<p class="col-span-full text-center text-slate-400 py-10">Este comercio todavía no cargó productos.</p>`;
    return;
  }

  contenedor.innerHTML = lista.map(producto => `
    <div class="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-center ${!producto.disponible ? 'opacity-50' : ''}">
      <img src="${producto.imagenUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80'}"
           class="w-20 h-20 rounded-xl object-cover shrink-0" alt="${producto.nombre}">
      <div class="flex-1">
        <h4 class="font-bold text-slate-900">${producto.nombre}</h4>
        <p class="text-xs text-slate-400 mt-0.5">${producto.descripcion || ''}</p>
        <p class="font-extrabold text-rose-600 mt-1">$${producto.precio}</p>
      </div>
      <button ${!producto.disponible ? 'disabled' : ''} class="bg-rose-600 hover:bg-rose-700 text-white w-9 h-9 rounded-full flex items-center justify-center shrink-0">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  `).join('');
}

// Ejecutar la carga de datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosDesdeBackend();
});