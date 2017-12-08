const { app, BrowserWindow, dialog } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let webWindow;
let server;

function startElectron() {
  setTimeout(startServer, 0);
  setTimeout(createWebWindow, 1000);
}

/**
 * create a hidden BrowserWindow that spawns a new node process (and start the server)
 *
 * the server (and window) gets automatically killed if the webWindow is closed
 * */
function startServer() {
  process.argv.push(
      '--server=lively4-server/',
      '--port=8080',
      '--index-files=true',
      // for building with electron
      '--directory=resources/app/lively4/',
      // '--directory=lively4/',
      '--auto-commit=true');

  server = require('./lively4-server/dist/httpServer');
  server.start();
}

function createWebWindow() {
  // Create the browser window.
  webWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false
    },
    width: 1400,
    height: 800
  });

  webWindow.loadURL('http://localhost:8080/lively4-core/start.html');


  // Open the DevTools.
  webWindow.webContents.openDevTools();

  webWindow.on('close', (e) => {
    var choice = dialog.showMessageBox(
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      }
    );
    if (choice == 1) {
      e.preventDefault();
    }
  });

  // Emitted when the window is closed.
  webWindow.on('closed', () => {
    webWindow = null;
  });
}

// init
app.on('ready', startElectron);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (webWindow === null) {
    startElectron();
  }
});
