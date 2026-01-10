// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ SW Terdaftar'))
            .catch(err => console.log('❌ SW Gagal', err));
    });
}

let deferredPrompt;
const installPrompt = document.getElementById('install-prompt');
const installBtn = document.getElementById('install-btn');
const dismissBtn = document.getElementById('dismiss-install');

window.addEventListener('beforeinstallprompt', (e) => {
    // Simpan event agar bisa dipicu nanti
    e.preventDefault();
    deferredPrompt = e;
    
    // Munculkan tombol install setelah 3 detik
    setTimeout(() => {
        if (installPrompt) installPrompt.classList.remove('hidden');
    }, 3000);
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        if (installPrompt) installPrompt.classList.add('hidden');
    });
}

if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
        if (installPrompt) installPrompt.classList.add('hidden');
    });
}

window.addEventListener('appinstalled', () => {
    console.log('🎉 Aplikasi berhasil terpasang!');
    if (installPrompt) installPrompt.classList.add('hidden');
});
