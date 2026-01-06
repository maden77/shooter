// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker terdaftar dengan scope:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update ditemukan!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('📱 Aplikasi siap diupdate. Refresh halaman untuk update terbaru.');
                        }
                    });
                });
            })
            .catch(function(error) {
                console.log('❌ Service Worker gagal didaftarkan:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
const installPrompt = document.getElementById('install-prompt');
const installBtn = document.getElementById('install-btn');
const dismissBtn = document.getElementById('dismiss-install');

// Check if app is already installed
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

// Show install prompt
function showInstallPrompt() {
    if (!isAppInstalled() && deferredPrompt) {
        installPrompt.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Hide install prompt
function hideInstallPrompt() {
    installPrompt.classList.add('hidden');
    document.body.style.overflow = '';
}

// Event listener for beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📲 beforeinstallprompt event triggered');
    
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Update UI to notify the user they can install the PWA
    console.log('✅ PWA dapat diinstall');
    
    // Show install button after 3 seconds
    setTimeout(() => {
        if (!isAppInstalled()) {
            showInstallPrompt();
        }
    }, 3000);
    
    // Optional: Log analytics event
    console.log('📊 Install prompt available');
});

// Install button click handler
installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
        console.log('❌ Tidak ada deferredPrompt');
        return;
    }
    
    console.log('🔄 Menginstal aplikasi...');
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`✅ User response: ${outcome}`);
    
    // Hide the install prompt
    hideInstallPrompt();
    
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    
    // Optional: Send analytics event
    if (outcome === 'accepted') {
        console.log('🎉 User menerima instalasi PWA');
    } else {
        console.log('😞 User menolak instalasi PWA');
    }
});

// Dismiss button click handler
dismissBtn.addEventListener('click', () => {
    console.log('❌ User menutup install prompt');
    hideInstallPrompt();
    
    // Show again after 1 day
    localStorage.setItem('installPromptDismissed', Date.now());
});

// Check if we should show the install prompt
function checkAndShowInstallPrompt() {
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    if (!lastDismissed || (Date.now() - lastDismissed) > oneDay) {
        if (!isAppInstalled() && deferredPrompt) {
            setTimeout(showInstallPrompt, 2000);
        }
    }
}

// App installed detection
window.addEventListener('appinstalled', (evt) => {
    console.log('🎉 Aplikasi berhasil diinstall!');
    hideInstallPrompt();
    
    // Optional: Send analytics event
    console.log('📊 PWA installed');
    
    // Show welcome message
    setTimeout(() => {
        alert('🎊 Selamat! Egg Shooter telah berhasil diinstall di perangkatmu!');
    }, 1000);
});

// Online/Offline Detection
window.addEventListener('online', () => {
    console.log('🌐 Aplikasi online');
    showOnlineStatus();
});

window.addEventListener('offline', () => {
    console.log('🔴 Aplikasi offline');
    showOfflineStatus();
});

function showOnlineStatus() {
    const statusEl = document.createElement('div');
    statusEl.className = 'online-status';
    statusEl.textContent = 'Koneksi kembali pulih!';
    statusEl.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(statusEl);
    
    setTimeout(() => {
        statusEl.remove();
    }, 3000);
}

function showOfflineStatus() {
    const statusEl = document.createElement('div');
    statusEl.className = 'offline-status';
    statusEl.textContent = 'Koneksi terputus! Bermain dalam mode offline.';
    statusEl.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #f44336;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(statusEl);
    
    setTimeout(() => {
        statusEl.remove();
    }, 5000);
}

// PWA Lifecycle Events
window.addEventListener('load', () => {
    console.log('🚀 Aplikasi dimuat');
    
    // Check install status
    if (isAppInstalled()) {
        console.log('📱 Aplikasi berjalan dalam mode standalone');
    } else {
        console.log('🌐 Aplikasi berjalan dalam browser');
    }
    
    // Check and show install prompt if appropriate
    checkAndShowInstallPrompt();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    #install-prompt {
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// Export functions for global use
window.showInstallPrompt = showInstallPrompt;
window.isAppInstalled = isAppInstalled;