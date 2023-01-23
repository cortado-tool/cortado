const { ipcRenderer } = require('electron');
acceptButton = document.getElementById("acceptButton");
denyButton = document.getElementById("denyButton");
acceptButton.addEventListener('click', () => {
  ipcRenderer.send('license-dialog', 'accepted');
});
denyButton.addEventListener('click', () => {
  ipcRenderer.send('license-dialog', 'denied');
});