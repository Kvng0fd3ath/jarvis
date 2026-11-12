const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('node:path');

let mainWindow;
let updateStatus = 'Checking for updates';

function sendUpdateStatus(status) {
  updateStatus = status;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updates:status', status);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 720,
    minHeight: 600,
    title: 'Zero',
    backgroundColor: '#090b0d',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

function configureUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => sendUpdateStatus('Checking for updates'));
  autoUpdater.on('update-available', info => sendUpdateStatus(`Downloading version ${info.version}`));
  autoUpdater.on('update-not-available', () => sendUpdateStatus('You’re up to date'));
  autoUpdater.on('download-progress', progress => sendUpdateStatus(`Downloading update · ${Math.round(progress.percent)}%`));
  autoUpdater.on('update-downloaded', info => sendUpdateStatus(`Version ${info.version} is ready · restart to install`));
  autoUpdater.on('error', error => {
    console.error('Updater error:', error);
    sendUpdateStatus(app.isPackaged ? 'Could not check for updates' : 'Updates available in installed builds');
  });
  if (app.isPackaged) {
    // Allow the app UI to load before making its first update request.
    setTimeout(() => autoUpdater.checkForUpdates().catch(console.error), 2500);
    // Also check periodically while the app stays open.
    setInterval(() => autoUpdater.checkForUpdates().catch(console.error), 6 * 60 * 60 * 1000);
  } else {
    updateStatus = 'Updates available in installed builds';
  }
}

ipcMain.handle('updates:get-status', () => updateStatus);
ipcMain.handle('updates:install', () => {
  if (app.isPackaged) autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
  createWindow();
  configureUpdater();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
