require('hazardous');
const portfinder = require('portfinder');
const path = require('path');
const appRootDir = require('app-root-dir');
const { app, BrowserWindow, dialog } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let webWindow;
let server;
let serverPort;

function getPlatform() {
  switch (process.platform) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
  }
}

function addGitPath() {
  if (getPlatform() === 'mac') {
    process.env.PATH = path.join(__dirname, 'bin/mac') + ':' + process.env.PATH;
  } else if (getPlatform() === 'win') {
    process.env.PATH = path.join(appRootDir.get(), 'bin/win32/bin') + ';' + process.env.PATH;
  } else if (getPlatform() === 'linux') {
    process.env.PATH = path.join(__dirname, 'bin/linux') + ':' + process.env.PATH;
  }
}

function startElectron() {
  addGitPath();
  setTimeout(startServer, 0);
  setTimeout(createWebWindow, 1000);
}

function startServer() {
  // https://github.com/epsitec-sa/hazardous
  let serverDir = path.join(__dirname, 'lively4-server');
  let livelyDir = path.join(__dirname, 'lively4/');

  // needed for windows path - replace 'C:\' with '/'
  if (serverDir.indexOf(':') !== -1) serverDir = `/${serverDir.substring(3)}`;
  if (livelyDir.indexOf(':') !== -1) livelyDir = `/${livelyDir.substring(3)}`;

  portfinder.getPort(function (err, port) {
    serverPort = port;

    process.argv.push(
      `--server=${serverDir}`,
      `--port=${port}`,
      `--index-files={true}`,
      `--directory=${livelyDir}`,
      `--auto-commit=${true}`);

    server = require('./lively4-server/dist/httpServer');
    server.start();
  });
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

  webWindow.loadURL(`http://localhost:${serverPort}/lively4-core/start.html`);


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
