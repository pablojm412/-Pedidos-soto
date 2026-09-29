// --- BASE DE DATOS MOCK ---
const CATEGORIES = [
    { id: 'burger', name: 'Hamburguesas', icon: 'fa-burger', color: 'bg-amber-100 text-amber-600' },
    { id: 'pizza', name: 'Pizzas', icon: 'fa-pizza-slice', color: 'bg-rose-100 text-rose-600' },
    { id: 'sushi', name: 'Sushi', icon: 'fa-fish', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'cafe', name: 'Café & Dulces', icon: 'fa-mug-hot', color: 'bg-orange-100 text-orange-600' },
    { id: 'empanadas', name: 'Empanadas', icon: 'fa-box', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'helado', name: 'Helados', icon: 'fa-ice-cream', color: 'bg-pink-100 text-pink-600' }
];

const RESTAURANTS = [
    {
        id: 'r1',
        name: 'Dean & Dennys',
        rating: 4.8,
        reviews: '500+',
        time: '20-35 min',
        deliveryCost: 0,
        category: 'burger',
        tags: ['Hamburguesas', 'Papas', 'Bebidas'],
        banner: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80',
        products: [
            { id: 'p1', name: 'Doble Bacon Cheese', price: 4200, desc: 'Doble medallón de carne 100% vacuna, cheddar, panceta crocante y salsa cheddar casera.', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&auto=format&fit=crop&q=80', cat: 'Burgers' },
            { id: 'p2', name: 'Classic Burger', price: 3500, desc: 'Medallón simple, lechuga, tomate, queso danbo y salsa de la casa.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80', cat: 'Burgers' },
            { id: 'p3', name: 'Papas Rústicas con Cheddar', price: 1800, desc: 'Papas cortadas a mano con salsa de queso cheddar cremoso y verdeo.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80', cat: 'Acompañamientos' }
        ]
    },
    {
        id: 'r2',
        name: 'Guerrin Pizzeria',
        rating: 4.9,
        reviews: '1k+',
        time: '30-45 min',
        deliveryCost: 350,
        category: 'pizza',
        tags: ['Pizza Tradicional', 'Muzzarella'],
        banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=100&auto=format&fit=crop&q=80',
        products: [
            { id: 'p4', name: 'Pizza Muzzarella Gigante', price: 5800, desc: 'Abundante queso muzzarella, aceitunas verdes y orégano sobre masa al molde.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80', cat: 'Pizzas' },
            { id: 'p5', name: 'Fugazzeta Rellena', price: 6500, desc: 'Rellena con 1kg de muzzarella y jamón, cubierta de cebolla caramelizada.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&auto=format&fit=crop&q=80', cat: 'Pizzas' }
        ]
    },
    {
        id: 'r3',
        name: 'Sensu Sushi',
        rating: 4.6,
        reviews: '250+',
        time: '15-25 min',
        deliveryCost: 0,
        category: 'sushi',
        tags: ['Rolls', 'Nigiris', 'Asiática'],
        banner: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=100&auto=format&fit=crop&q=80',
        products: [
            { id: 'p6', name: 'Combo Philadelphia (15 piezas)', price: 7200, desc: 'Rolls de salmón fresco, queso crema y palta rebozados con sésamo.', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=80', cat: 'Combos' }
        ]
    }
];

// --- ESTADO GLOBAL DE LA APP ---
let cart = [];
let currentRestaurant = null;
let activeCategoryFilter = null;
let currentTip = 200;
let modalSelectedProduct = null;
let modalQuantity = 1;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderRestaurants(RESTAURANTS);
});

// --- NAVEGACIÓN ENTRE VISTAS ---
function showView(viewName) {
    document.getElementById('homeView').classList.add('hidden');
    document.getElementById('restaurantView').classList.add('hidden');
    document.getElementById('trackingView').classList.add('hidden');

    if (viewName === 'home') document.getElementById('homeView').classList.remove('hidden');
    if (viewName === 'restaurant') document.getElementById('restaurantView').classList.remove('hidden');
    if (viewName === 'tracking') document.getElementById('trackingView').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- RENDER CATEGORÍAS ---
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = CATEGORIES.map(cat => `
        <button onclick="filterByCategory('${cat.id}')" class="category-btn flex flex-col items-center gap-2 p-3 min-w-[85px] rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div class="w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center text-lg">
                <i class="fa-solid ${cat.icon}"></i>
            </div>
            <span class="text-xs font-semibold text-slate-700">${cat.name}</span>
        </button>
    `).join('');
}

// --- RENDER RESTAURANTES ---
function renderRestaurants(list) {
    const grid = document.getElementById('restaurantsGrid');
    
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-utensils text-4xl text-slate-300 mb-2"></i>
                <p class="text-slate-500 font-medium">No encontramos restaurantes que coincidan.</p>
            </div>`;
        return;
    }

    grid.innerHTML = list.map(rest => `
        <article onclick="openRestaurant('${rest.id}')" class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between">
            <div>
                <!-- Imagen Cover -->
                <div class="relative h-36 w-full overflow-hidden">
                    <img src="${rest.banner}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${rest.name}">
                    <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 shadow">
                        <i class="fa-solid fa-star text-amber-400"></i> ${rest.rating}
                    </div>
                    ${rest.deliveryCost === 0 ? `<span class="absolute bottom-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow">Envío Gratis</span>` : ''}
                </div>

                <!-- Info -->
                <div class="p-4">
                    <h3 class="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">${rest.name}</h3>
                    <p class="text-xs text-slate-400 mt-0.5">${rest.tags.join(' • ')}</p>
                </div>
            </div>

            <div class="px-4 pb-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
                <span class="flex items-center gap-1"><i class="fa-regular fa-clock text-slate-400"></i> ${rest.time}</span>
                <span class="font-medium text-slate-700">${rest.deliveryCost === 0 ? 'Sin costo' : `$${rest.deliveryCost} envío`}</span>
            </div>
        </article>
    `).join('');
}

// --- FILTROS Y BÚSQUEDA ---
function filterByCategory(catId) {
    if (activeCategoryFilter === catId) {
        activeCategoryFilter = null;
        renderRestaurants(RESTAURANTS);
    } else {
        activeCategoryFilter = catId;
        const filtered = RESTAURANTS.filter(r => r.category === catId);
        renderRestaurants(filtered);
    }
}

function filterQuick(type) {
    document.querySelectorAll('.quick-filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (type === 'all') renderRestaurants(RESTAURANTS);
    if (type === 'top') renderRestaurants(RESTAURANTS.filter(r => r.rating >= 4.8));
    if (type === 'free_delivery') renderRestaurants(RESTAURANTS.filter(r => r.deliveryCost === 0));
    if (type === 'fast') renderRestaurants(RESTAURANTS.filter(r => parseInt(r.time) <= 25));
}

function handleSearch(query) {
    const term = query.toLowerCase().trim();
    if (!term) {
        renderRestaurants(RESTAURANTS);
        return;
    }

    const filtered = RESTAURANTS.filter(r => 
        r.name.toLowerCase().includes(term) || 
        r.tags.some(t => t.toLowerCase().includes(term)) ||
        r.products.some(p => p.name.toLowerCase().includes(term))
    );
    renderRestaurants(filtered);
}

// --- VISTA DETALLE DE RESTAURANTE ---
function openRestaurant(id) {
    currentRestaurant = RESTAURANTS.find(r => r.id === id);
    if (!currentRestaurant) return;

    // Header del restaurante
    document.getElementById('restaurantHeader').innerHTML = `
        <div class="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-6 shadow-md">
            <img src="${currentRestaurant.banner}" class="w-full h-full object-cover" alt="Banner">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div class="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                <div>
                    <span class="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">Abierto</span>
                    <h1 class="text-2xl sm:text-4xl font-black">${currentRestaurant.name}</h1>
                    <p class="text-xs sm:text-sm text-slate-200 mt-1">${currentRestaurant.tags.join(' • ')}</p>
                </div>
                <div class="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                    <div class="text-center px-2">
                        <span class="block text-xs text-slate-300">Calificación</span>
                        <span class="font-bold text-amber-400 text-sm">★ ${currentRestaurant.rating}</span>
                    </div>
                    <div class="w-px h-6 bg-white/20"></div>
                    <div class="text-center px-2">
                        <span class="block text-xs text-slate-300">Demora</span>
                        <span class="font-bold text-sm">${currentRestaurant.time}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Categorías del Menú
    const categories = [...new Set(currentRestaurant.products.map(p => p.cat))];
    document.getElementById('menuCategories').innerHTML = categories.map((cat, i) => `
        <button class="px-4 py-2 rounded-xl text-xs font-bold ${i === 0 ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200'} shrink-0">
            ${cat}
        </button>
    `).join('');

    // Platos
    renderMenuProducts(currentRestaurant.products);
    showView('restaurant');
}

function renderMenuProducts(products) {
    const grid = document.getElementById('menuProductsGrid');
    grid.innerHTML = products.map(p => `
        <div onclick="openProductModal('${p.id}')" class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between gap-4 cursor-pointer group">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <h4 class="font-bold text-slate-900 group-hover:text-rose-600 transition-colors text-sm sm:text-base">${p.name}</h4>
                    <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">${p.desc}</p>
                </div>
                <span class="font-extrabold text-slate-900 text-sm mt-3">$${p.price.toLocaleString()}</span>
            </div>
            <div class="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="${p.name}">
                <button class="absolute bottom-1 right-1 w-7 h-7 rounded-lg bg-white/90 text-rose-600 flex items-center justify-center shadow text-xs font-bold hover:bg-rose-600 hover:text-white transition-colors">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// --- MODAL PRODUCTO ---
function openProductModal(productId) {
    modalSelectedProduct = currentRestaurant.products.find(p => p.id === productId);
    if (!modalSelectedProduct) return;

    modalQuantity = 1;
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');

    content.innerHTML = `
        <div class="relative h-48 overflow-hidden">
            <img src="${modalSelectedProduct.image}" class="w-full h-full object-cover" alt="${modalSelectedProduct.name}">
            <button onclick="closeProductModal()" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="p-5 space-y-4">
            <div>
                <h3 class="font-bold text-xl text-slate-900">${modalSelectedProduct.name}</h3>
                <p class="text-xs text-slate-500 mt-1">${modalSelectedProduct.desc}</p>
            </div>

            <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">Aclaraciones especiales</label>
                <textarea placeholder="Ej: Sin cebolla, salsa aparte..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none h-16"></textarea>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <!-- Selector Cantidad -->
                <div class="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button onclick="updateModalQty(-1)" class="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 rounded-l-xl transition-colors">-</button>
                    <span id="modalQtyDisplay" class="w-8 text-center text-xs font-bold text-slate-800">1</span>
                    <button onclick="updateModalQty(1)" class="w-9 h-9 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-200 rounded-r-xl transition-colors">+</button>
                </div>

                <button onclick="confirmAddToCart()" class="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all">
                    <span>Agregar</span>
                    <span id="modalTotalPrice">$${modalSelectedProduct.price.toLocaleString()}</span>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    content.classList.remove('scale-95');
}

function updateModalQty(delta) {
    modalQuantity = Math.max(1, modalQuantity + delta);
    document.getElementById('modalQtyDisplay').innerText = modalQuantity;
    document.getElementById('modalTotalPrice').innerText = `$${(modalSelectedProduct.price * modalQuantity).toLocaleString()}`;
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');
    modal.classList.add('opacity-0', 'pointer-events-none');
    content.classList.add('scale-95');
}

// --- CARRITO ---
function confirmAddToCart() {
    const existingIndex = cart.findIndex(item => item.id === modalSelectedProduct.id);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += modalQuantity;
    } else {
        cart.push({
            ...modalSelectedProduct,
            qty: modalQuantity,
            restaurantName: currentRestaurant.name
        });
    }

    closeProductModal();
    updateCartUI();
    toggleCartDrawer(true);
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('cartBadge');
    const footer = document.getElementById('cartFooter');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalQty;
    badge.style.transform = totalQty > 0 ? 'scale(1)' : 'scale(0)';

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <i class="fa-solid fa-basket-shopping text-5xl mb-3 opacity-30"></i>
                <p class="font-semibold text-slate-600 text-sm">Tu carrito está vacío</p>
                <p class="text-xs text-slate-400 mt-1">Explora los mejores restaurantes y agrega tus platos favoritos.</p>
            </div>`;
        footer.classList.add('hidden');
        return;
    }

    footer.classList.remove('hidden');

    container.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div class="flex-1">
                <h5 class="font-bold text-xs text-slate-800">${item.name}</h5>
                <span class="text-xs text-rose-600 font-extrabold block mt-0.5">$${(item.price * item.qty).toLocaleString()}</span>
            </div>
            
            <div class="flex items-center border border-slate-200 rounded-lg bg-white">
                <button onclick="changeCartItemQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100 text-xs">-</button>
                <span class="w-6 text-center text-xs font-bold text-slate-700">${item.qty}</span>
                <button onclick="changeCartItemQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100 text-xs">+</button>
            </div>
        </div>
    `).join('');

    // Cálculos de Total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const delivery = currentRestaurant ? currentRestaurant.deliveryCost : 350;
    const total = subtotal + delivery + currentTip;

    document.getElementById('cartSubtotal').innerText = `$${subtotal.toLocaleString()}`;
    document.getElementById('cartDelivery').innerText = delivery === 0 ? 'GRATIS' : `$${delivery}`;
    document.getElementById('cartTip').innerText = `$${currentTip}`;
    document.getElementById('cartTotal').innerText = `$${total.toLocaleString()}`;
}

function changeCartItemQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

function setTip(amount) {
    currentTip = amount;
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updateCartUI();
}

function toggleCartDrawer(open) {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (open) {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
    } else {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

// --- CHECKOUT & TRACKING SIMULADO ---
function processCheckout() {
    if (cart.length === 0) return;

    // Renderizar resumen en vista tracking
    const trackingSummary = document.getElementById('trackingItemsSummary');
    trackingSummary.innerHTML = cart.map(i => `
        <div class="flex justify-between py-1.5">
            <span class="text-slate-600">${i.qty}x ${i.name}</span>
            <span class="font-semibold text-slate-800">$${(i.price * i.qty).toLocaleString()}</span>
        </div>
    `).join('');

    // Reset Carrito
    cart = [];
    updateCartUI();
    toggleCartDrawer(false);

    // Ir a la pantalla de Tracking
    showView('tracking');
}
