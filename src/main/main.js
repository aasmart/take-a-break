"use strict";
const { app, BrowserWindow, Menu, nativeImage, Tray, ipcMain } = require('electron');
const { platform } = require('os');
const path = require('path');
let tray = null;
let win = null;
function createTray() {
    const icon = path.join('assets/icon.png'); // required.
    const trayicon = nativeImage.createFromPath(icon);
    tray = new Tray(trayicon.resize({ width: 16 }));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                win.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit(); // actually quit the app.
            }
        },
    ]);
    tray.setContextMenu(contextMenu);
}
const createWindow = () => {
    if (!tray)
        createTray();
    win = new BrowserWindow({
        width: 1000,
        height: 900,
        minWidth: 550,
        minHeight: 375,
        icon: 'assets/icon.png',
        autoHideMenuBar: true,
        center: true,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'src/preload/preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.maximize();
    win.loadFile('src/main/index.html');
    win.on('close', (event) => {
        if (app.quitting) {
            win.quit();
            return;
        }
        event.preventDefault();
        win.hide();
    });
    ipcMain.on('open-page', (event, name) => {
        win.loadFile(`src/main/${name}.html`);
    });
    ipcMain.on('show-window', (event, name) => {
        if (name === 'main')
            win.show();
    });
};
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.setLoginItemSettings({
    openAtLogin: true
});
app.on('before-quit', () => app.quitting = true);
