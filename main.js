const { app, BrowserWindow, nativeTheme } = require("electron");
const https = require('https');
const fs = require('fs');
const path = require('path');
const GATEWAY_URL = "192.168.1.111";
const LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage(path.join(__dirname, "/public/data"));


async function updateList(){
    var date = new Date().toLocaleDateString();
    if (localStorage.getItem('upDate') === date)
        return;
    downloadList(GATEWAY_URL, "/certificateList", "/public/data/certficateList.json");
    downloadList(GATEWAY_URL, "/vaccineList", "/public/data/vaccineList.json");
    downloadList(GATEWAY_URL, "/testList", "/public/data/testList.json");
    downloadList(GATEWAY_URL, "/diseaseList", "/public/data/diseaseList.json");
    downloadList(GATEWAY_URL, "/algorithmList", "/public/data/algorithmList.json");    
    localStorage.setItem('upDate', date);
}

async function downloadList(url, urlPath, fsPath){   

    const options = {
        hostname: url,
        port: 5000,
        path: urlPath,
        method: 'GET',
        //WARNING: certificates are not checked for testing with self signed certificates
        rejectUnauthorized: false
    }
    let result;
    const req = https.request(options, res=>{
        res.on('data', d =>{
            fs.writeFile(path.join(__dirname, fsPath), d, function(err){
            });
        })
    })
    req.end();
}

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
    updateList();
})

// app closure
app.on('window-all-closed', () => {
    // on macos app should be closed only manually
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
