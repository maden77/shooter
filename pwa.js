// PWA untuk GitHub Pages
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Sesuaikan path dengan GitHub Pages
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker terdaftar');
            })
            .catch(error => {
                console.log('Service Worker gagal:', error);
            });
    });
}

// Install Prompt untuk GitHub Pages
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show prompt setelah 3 detik
    setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            showInstallPrompt();
        }
    }, 3000);
});

// Tampilkan install prompt
function showInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt && deferredPrompt) {
        prompt.classList.remove('hidden');
    }
}

// Setup buttons
document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User menginstall PWA');
    }
    
    document.getElementById('install-prompt').classList.add('hidden');
    deferredPrompt = null;
});

document.getElementById('dismiss-install')?.addEventListener('click', () => {
    document.getElementById('install-prompt').classList.add('hidden');
});

// App installed event
window.addEventListener('appinstalled', () => {
    console.log('PWA terinstall!');
});