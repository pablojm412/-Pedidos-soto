/* ==========================================================================
   1. DATOS DE EJEMPLO (RESTAURANTES Y CATEGORÍAS)
   ========================================================================== */

const categoriesData = [
    { id: 'burgers', name: 'Hamburguesas', icon: 'fa-burger' },
    { id: 'pizza', name: 'Pizzas', icon: 'fa-pizza-slice' },
    { id: 'empanadas', name: 'Empanadas', icon: 'fa-pie-chart' },
    { id: 'sushi', name: 'Sushi', icon: 'fa-fish' },
    { id: 'drinks', name: 'Bebidas', icon: 'fa-wine-bottle' },
    { id: 'icecream', name: 'Helados', icon: 'fa-ice-cream' }
];

const restaurantsData = [
    {
        id: 1,
        name: 'Burger Grill',
        category: 'burgers',
        rating: 4.8,
        deliveryTime: '20-30 min',
        isFreeDelivery: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        products: [
            { id: 101, name: 'Doble Cheeseburger', price: 4500, desc: 'Doble carne 180g, queso cheddar y salsa especial.' },
            { id: 102, name: 'Bacon Smoke Burger', price: 5200, desc: 'Carne, panceta ahumada, cebolla caramelizada y barbacoa.' }
        ]
    },
    {
        id: 2,
        name: 'Pizzería Soto',
        category: 'pizza',
        rating: 4.6,
        deliveryTime: '30-45 min',
        isFreeDelivery: false,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
        products: [
            { id: 201, name: 'Pizza Muzzarella', price: 6000, desc: 'Salsa de tomate casera, muzzarella y orégano.' },
            { id: 202, name: 'Pizza Napolitana', price: 6800, desc: 'Muzzarella, rodajas de tomate fresco, ajo y albahaca.' }
        ]
    }
];

/* ==========================================================================
   2. SISTEMA DE AUTENTICACIÓN Y SESIÓN LOCAL
   ========================================================================== */

let currentUser = JSON.parse(localStorage.getItem('rrap_user')) || null;
let registeredUsers = JSON.parse(localStorage.getItem('rrap_users_db')) || [];

function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    switchAuthTab(tab);
    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
}

function switchAuthTab(tabName) {
    const loginForm = document.getElementById('formLogin');
    const regForm = document.getElementById('formRegister');
    const forgotForm = document.getElementById('formForgot');

    if (!loginForm || !regForm || !forgotForm) return;

    loginForm.classList.add('hidden');
    regForm.classList.add('hidden');
    forgotForm.classList.add('hidden');

    if (tabName === 'login') loginForm.classList.remove('hidden');
    if (tabName === 'register') regForm.classList.remove('hidden');
    if (tabName === 'forgot') forgotForm.classList.remove('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const user = registeredUsers.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = { name: user.name, email: user.email };
        localStorage.setItem('rrap_user', JSON.stringify(currentUser));
        updateUserUI();
        closeAuthModal();
        alert(`¡Bienvenido de nuevo, ${user.name}!`);
    } else {
        alert('Correo o contraseña incorrectos. Verifica tus datos o regístrate.');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    const exists = registeredUsers.some(u => u.email === email);
    if (exists) {
        alert('Este correo electrónico ya está registrado. Intenta iniciar sesión.');
        return;
    }

    const newUser = { name, email, password };
    registeredUsers.push(newUser);
    localStorage.setItem('rrap_users_db', JSON.stringify(registeredUsers));

    currentUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem('rrap_user', JSON.stringify(currentUser));

    updateUserUI();
    closeAuthModal();
    alert('¡Registro exitoso! Tu cuenta ha sido creada.');
}

function handleForgot(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    const user = registeredUsers.find(u => u.email === email);

    if (user) {
        alert(`Se ha enviado un enlace de recuperación a: ${email}.\n(Tu contraseña es: ${user.password})`);
        switchAuthTab('login');
    } else {
        alert('No encontramos ninguna cuenta asociada a este correo electrónico.');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rrap_user');
    updateUserUI();
    alert('Has cerrado sesión correctamente.');
}

function updateUserUI() {
    const container = document.getElementById('userMenuContainer');
    if (!container) return;
    
    if (currentUser) {
        container.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="flex flex-col text-right hidden sm:block">
                    <span class="text-xs font-bold text-slate-800 leading-none">${currentUser.name}</span>
                    <span class="text-[10px] text-slate-400 font-semibold">${currentUser.email}</span>
                </div>
                <div class="relative group">
                    <button class="w-9 h-9 rounded-full bg-brand-orange text-white font-extrabold flex items-center justify-center shadow-md border-2 border-white">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </button>
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                        <div class="px-4 py-2 border-b border-slate-100 sm:hidden">
                            <p class="text-xs font-bold text-slate-800">${currentUser.name}</p>
                            <p class="text-[10px] text-slate-400">${currentUser.email}</p>
                        </div>
                        <a href="#" onclick="showView('tracking')" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><i class="fa-solid fa-receipt mr-2 text-brand-orange"></i>Mis Pedidos</a>
                        <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                            <i class="fa-solid fa-right-from-bracket mr-2"></i>Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button onclick="openAuthModal('login')" class="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-brand-darkblue transition-all shadow-md shadow-brand-blue/20">
                <i class="fa-regular fa-user"></i>
                <span>Ingresar</span>
            </button>
        `;
    }
}

/* ==========================================================================
   3. NAVEGACIÓN Y RENDERIZADO DE INTERFAZ
   ========================================================================== */

let cart = [];
let currentTip = 200;
const deliveryFee = 350;

document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    renderCategories();
    renderRestaurants(restaurantsData);
});

function showView(viewName) {
    const homeView = document.getElementById('homeView');
    const restaurantView = document.getElementById('restaurantView');
    const trackingView = document.getElementById('trackingView');

    if (homeView) homeView.classList.add('hidden');
    if (restaurantView) restaurantView.classList.add('hidden');
    if (trackingView) trackingView.classList.add('hidden');

    if (viewName === 'home' && homeView) homeView.classList.remove('hidden');
    if (viewName === 'restaurant' && restaurantView) restaurantView.classList.remove('hidden');
    if (viewName === 'tracking' && trackingView) trackingView.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = categoriesData.map(cat => `
        <button onclick="filterByCategory('${cat.id}')" class="flex flex-col items-center gap-2 p-3 min-w-[90px] bg-white rounded-2xl border border-slate-100 hover:border-brand-orange/30 shadow-sm hover:shadow-md transition-all shrink-0 group">
            <div class="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <i class="fa-solid ${cat.icon}"></i>
            </div>
            <span class="text-xs font-bold text-slate-700">${cat.name}</span>
        </button>
    `).join('');
}

function renderRestaurants(list) {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-8">No se encontraron locales.</p>`;
        return;
    }

    grid.innerHTML = list.map(rest => `
        <div onclick="openRestaurant(${rest.id})" class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between">
            <div class="relative h-44 overflow-hidden">
                <img src="${rest.image}" alt="${rest.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow">
                    ⭐ ${rest.rating}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-extrabold text-slate-800 text-lg group-hover:text-brand-orange transition-colors">${rest.name}</h3>
                <div class="flex items-center gap-3 text-xs text-slate-500 font-medium mt-2">
                    <span><i class="fa-regular fa-clock mr-1"></i>${rest.deliveryTime}</span>
                    <span>•</span>
                    <span class="${rest.isFreeDelivery ? 'text-emerald-600 font-bold' : ''}">
                        ${rest.isFreeDelivery ? 'Envío Gratis' : 'Envío $' + deliveryFee}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterByCategory(catId) {
    const filtered = restaurantsData.filter(r => r.category === catId);
    renderRestaurants(filtered);
}

function filterQuick(type) {
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('bg-brand-blue', 'text-white');
        btn.classList.add('bg-white', 'text-slate-600');
    });
    event.currentTarget.classList.remove('bg-white', 'text-slate-600');
    event.currentTarget.classList.add('bg-brand-blue', 'text-white');

    if (type === 'all') renderRestaurants(restaurantsData);
    if (type === 'top') renderRestaurants(restaurantsData.filter(r => r.rating >= 4.7));
    if (type === 'free_delivery') renderRestaurants(restaurantsData.filter(r => r.isFreeDelivery));
    if (type === 'fast') renderRestaurants(restaurantsData.filter(r => parseInt(r.deliveryTime) <= 30));
}

function handleSearch(query) {
    const q = query.toLowerCase().trim();
    const filtered = restaurantsData.filter(r => r.name.toLowerCase().includes(q));
    renderRestaurants(filtered);
}

function openRestaurant(id) {
    const rest = restaurantsData.find(r => r.id === id);
    if (!rest) return;

    const header = document.getElementById('restaurantHeader');
    const grid = document.getElementById('menuProductsGrid');

    header.innerHTML = `
        <div class="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-6">
            <img src="${rest.image}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
                <div class="text-white">
                    <h1 class="text-3xl font-black">${rest.name}</h1>
                    <p class="text-sm opacity-90 mt-1">⭐ ${rest.rating} | ${rest.deliveryTime}</p>
                </div>
            </div>
        </div>
    `;

    grid.innerHTML = rest.products.map(p => `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
                <h4 class="font-bold text-slate-800">${p.name}</h4>
                <p class="text-xs text-slate-400 mt-1">${p.desc}</p>
                <p class="text-sm font-extrabold text-brand-orange mt-2">$${p.price}</p>
            </div>
            <button onclick="addToCart('${p.name}', ${p.price})" class="px-3.5 py-2 bg-orange-50 text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl text-xs font-bold transition-colors">
                + Agregar
            </button>
        </div>
    `).join('');

    showView('restaurant');
}

/* ==========================================================================
   4. MANEJO DEL CARRITO
   ========================================================================== */

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

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    toggleCartDrawer(true);
}

function setTip(val) {
    currentTip = val;
    updateCartUI();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('cartBadge');
    const footer = document.getElementById('cartFooter');

    const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
    badge.innerText = totalQty;
    badge.style.transform = totalQty > 0 ? 'scale(1)' : 'scale(0)';

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<div class="text-center py-12 text-slate-400 font-medium">Tu carrito está vacío 🛒</div>`;
        footer.classList.add('hidden');
        return;
    }

    footer.classList.remove('hidden');

    itemsContainer.innerHTML = cart.map((item, index) => `
        <div class="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
                <h5 class="text-xs font-bold text-slate-800">${item.name}</h5>
                <span class="text-xs text-brand-orange font-bold">$${item.price * item.qty}</span>
            </div>
            <div class="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-slate-200">
                <button onclick="changeQty(${index}, -1)" class="text-xs text-slate-500 font-bold px-1">-</button>
                <span class="text-xs font-bold text-slate-700">${item.qty}</span>
                <button onclick="changeQty(${index}, 1)" class="text-xs text-slate-500 font-bold px-1">+</button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    document.getElementById('cartSubtotal').innerText = `$${subtotal}`;
    document.getElementById('cartDelivery').innerText = `$${deliveryFee}`;
    document.getElementById('cartTip').innerText = `$${currentTip}`;
    document.getElementById('cartTotal').innerText = `$${subtotal + deliveryFee + currentTip}`;
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

function processCheckout() {
    if (!currentUser) {
        toggleCartDrawer(false);
        openAuthModal('login');
        alert('Debes iniciar sesión para realizar un pedido.');
        return;
    }

    alert('¡Pedido procesado con éxito!');
    cart = [];
    updateCartUI();
    toggleCartDrawer(false);
    showView('tracking');
}
