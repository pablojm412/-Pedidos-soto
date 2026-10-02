// ESTADO DE USUARIOS Y SESIÓN LOCAL
let currentUser = JSON.parse(localStorage.getItem('rrap_user')) || null;
let registeredUsers = JSON.parse(localStorage.getItem('rrap_users_db')) || [];

// Al cargar el documento, inicializamos la interfaz del usuario
document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
});

// ABRIR/CERRAR MODAL DE AUTENTICACIÓN
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    switchAuthTab(tab);
    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}

// CAMBIAR PESTAÑAS DEL MODAL (LOGIN / REGISTRO / FORGOT)
function switchAuthTab(tabName) {
    document.getElementById('formLogin').classList.add('hidden');
    document.getElementById('formRegister').classList.add('hidden');
    document.getElementById('formForgot').classList.add('hidden');

    if (tabName === 'login') {
        document.getElementById('formLogin').classList.remove('hidden');
    } else if (tabName === 'register') {
        document.getElementById('formRegister').classList.remove('hidden');
    } else if (tabName === 'forgot') {
        document.getElementById('formForgot').classList.remove('hidden');
    }
}

// MANEJAR INICIO DE SESIÓN
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

// MANEJAR REGISTRO DE USUARIO
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

// MANEJAR RECUPERACIÓN DE CONTRASEÑA
function handleForgot(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();

    const user = registeredUsers.find(u => u.email === email);
    if (user) {
        alert(`Se ha enviado un enlace de recuperación al correo: ${email}.\n(Tu contraseña registrada es: ${user.password})`);
        switchAuthTab('login');
    } else {
        alert('No encontramos ninguna cuenta asociada a este correo electrónico.');
    }
}

// CERRAR SESIÓN
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rrap_user');
    updateUserUI();
    alert('Has cerrado sesión correctamente.');
}

// ACTUALIZAR INTERFAZ DE USUARIO EN HEADER
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
                        <a href="#" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><i class="fa-solid fa-receipt mr-2 text-brand-orange"></i>Mis Pedidos</a>
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
