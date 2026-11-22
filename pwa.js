
// MY LIFE — PWA REGISTRATION

const pwaScriptUrl = document.currentScript.src;

window.addEventListener('load', async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker не поддерживается браузером.');
    return;
  }

  try {
    const serviceWorkerUrl = new URL('sw.js', pwaScriptUrl);

    const registration = await navigator.serviceWorker.register(
      serviceWorkerUrl.href
    );

    console.log('My Life PWA подключено!', registration);

  } catch (error) {
    console.error('Ошибка подключения PWA:', error);
  }
});
