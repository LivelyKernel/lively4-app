const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const spawn = require('child_process').spawn;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let webWindow;
let serverWindow;
let serverAlive = false;

function startElectron() {
    createServerWindow();
    setTimeout(function () {
        createWebWindow();
    }, 1000);
}

/**
 * create a hidden BrowserWindow that spawns a new node process (and start the server)
 *
 * the server (and window) gets automatically killed if the webWindow is closed
 * */
function createServerWindow() {
    serverWindow = new BrowserWindow({
        show: false
    });

    serverWindow.loadURL(url.format({
        pathname: path.join(__dirname, './server.html'),
        protocol: 'file:',
        slashes: true
    }));

    let t;
    serverWindow.webContents.openDevTools();
    serverWindow.webContents.once("did-finish-load", function () {
        serverAlive = true;

        console.log('foo');
        t = spawn('node', ['lively4-server/dist/httpServer.js',
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
    });

    serverWindow.on('closed', () => {
        // kill process t
        t.kill();
    });
}

function createWebWindow() {
    // Create the browser window.
    webWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false
        }
    });
    // webWindow.maximize();

    webWindow.loadURL('http://localhost:8080/lively4-core/start.html');


    // Open the DevTools.
    webWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    webWindow.on('closed', () => {
        // close server if alive
        setTimeout(function () {
            if (serverWindow !== null && serverAlive) {
                serverWindow.close();
                serverWindow = null;
            }
        }, 1000);
        webWindow = null;
    });
}

// init
app.on('ready', startElectron);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    console.log('closing..');
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
