const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const spawn = require('child_process').spawn;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function startElectron() {
  createServer();
  setTimeout(function () {
    createWindow();
  }, 1000);
}

function createServer() {
  var t = spawn('node', ['lively4-server/dist/httpServer.js',
    '--server=lively4-server/',
    '--port=8080',
    '--index-files=true',
    '--directory=lively4/',
    '--auto-commit=true']);

  t.on('data', function (data) {
    console.log(data.toString());
  });

  t.stdout.pipe(process.stdout);
  t.stderr.pipe(process.stderr);
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false
    }
  });
  win.maximize();

  // and load the index.html of the app.
  // win.loadURL(url.format({
  //   pathname: path.join(__dirname, './lively4-core/start.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }));
  win.loadURL('http://localhost:8080/lively4-core/start.html');


  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', startElectron);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit();
  // }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});
