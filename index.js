require('hazardous');
const path = require('path');
const appRootDir = require('app-root-dir');
const { app, BrowserWindow, dialog } = require('electron');
const tcpPortUsed = require('tcp-port-used');
const terminalServer = require('./server.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let webWindow;
let server;
let serverPort;
let runTerminalServer = true;

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
    process.env.PATH = path.join(__dirname, 'bin/mac/libexec/git-core') + ':' + process.env.PATH;
  } else if (getPlatform() === 'win') {
    process.env.PATH = path.join(appRootDir.get(), 'bin/win32/bin') + ';' + process.env.PATH;
  } else if (getPlatform() === 'linux') {
    process.env.PATH = path.join(__dirname, 'bin/linux') + ':' + process.env.PATH;
  }
}

function startElectron() {
  addGitPath();
  setTimeout(startServers, 0);
  setTimeout(createWebWindow, 1000);
}

function getLivelyDir() {
  let livelyDir = path.join(__dirname, 'lively4/');
  let currDir = __dirname;
  // TODO refactor
  if (currDir.indexOf('app.asar') > -1) {
    livelyDir = currDir.slice(0, -8) + 'lively4/';
  }
  // needed for windows path - replace 'C:\' with '/'
  if (livelyDir.indexOf(':') !== -1) livelyDir = `/${livelyDir.substring(3)}`;
  return livelyDir;
}

function getServerDir() {
  // https://github.com/epsitec-sa/hazardous
  let serverDir = path.join(__dirname, 'lively4-server');
  if (serverDir.indexOf(':') !== -1) serverDir = `/${serverDir.substring(3)}`;
  return serverDir;
}

function startServer(port) {
  serverPort = port;

  // With the built version it can happen that there is only one argument.
  // The lively4-server is using https://www.npmjs.com/package/argv which calls 'process.argv.slice( 2 )'.
  // Thus, a random argument needs to be added.
  if (process.argv.length < 2) {
    process.argv.push(`--random=123`);
  }

  process.argv.push(
    `--server=${getServerDir()}`,
    `--port=${port}`,
    `--index-files=true`,
    `--directory=${getLivelyDir()}`,
    `--auto-commit=true`);

  server = require('./lively4-server/dist/httpServer');
  server.start();
}

function findPort(port) {
  tcpPortUsed.check(port, '127.0.0.1')
  .then( (inUse) => {
    if (inUse) {
      findPort(port + 1);
    } else {
      if (runTerminalServer) {
        tcpPortUsed.check(port + 1, '127.0.0.1')
        .then( (inUseTerminal) => {
          if (inUseTerminal) {
            findPort(port + 1);
          } else {
            startServer(port);
            terminalServer.terminalServer(port + 1);
          }
        });
      } else {
        startServer(port);
      }
    }
  });
}

function startServers() {
  findPort(8000);
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

  // webWindow.loadURL(`http://localhost:${serverPort}/lively4-core/start.html`);
  webWindow.loadURL(`http://localhost:${serverPort}/lively4-core/start.html`);

  // Open the DevTools.
  // webWindow.webContents.openDevTools();

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
    app.quit();
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
