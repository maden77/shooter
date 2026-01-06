// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker terdaftar');
            })
            .catch(function(error) {
                console.log('❌ Service Worker gagal:', error);
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
    return window.matchMedia('(display-mode: standalone)').matches;
}

// Show install prompt
function showInstallPrompt() {
    if (!isAppInstalled() && deferredPrompt) {
        installPrompt.classList.remove('hidden');
    }
}

// Hide install prompt
function hideInstallPrompt() {
    installPrompt.classList.add('hidden');
}

// Event listener for beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📲 PWA bisa diinstall');
    
    // Prevent Chrome from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button after 3 seconds
    setTimeout(() => {
        if (!isAppInstalled()) {
            showInstallPrompt();
        }
    }, 3000);
});

// Install button click handler
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response: ${outcome}`);
        
        // Hide the install prompt
        hideInstallPrompt();
        
        // We've used the prompt, and can't use it again
        deferredPrompt = null;
    });
}

// Dismiss button click handler
if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
        hideInstallPrompt();
    });
}

// App installed event
window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA terinstall!');
    hideInstallPrompt();
});

// Hide splash screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
    }, 1500);
});