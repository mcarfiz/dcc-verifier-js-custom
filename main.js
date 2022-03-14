const { app, BrowserWindow, nativeTheme } = require("electron");
const path = require('path');

//WARNING: certificates are not checked for testing with self signed certificates
app.commandLine.appendSwitch('ignore-certificate-errors')

// create new application window
function createWindow() {
    const win = new BrowserWindow({
        width: 590,
        height: 770,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0d6efd',
            symbolColor: '#000000'
        }/*, // preload support
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }*/
    })

    win.menuBarVisible = false
    // set color mode to follow system settings
    nativeTheme.themeSource = 'system'
    // debug console
    win.webContents.openDevTools()
    win.loadFile(path.join(__dirname, '/public/index.html'))

}

// on activation
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// app closure
app.on('window-all-closed', () => {
    // on macos app should be closed only manually
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
