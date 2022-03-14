const fileSelector = document.getElementById('file-selector')
const downloadButton = document.getElementById('download')
const qrCanvas = document.getElementById('qrcode-canvas')
const errorMsg = document.getElementById('error-msg')
const resMsg = document.getElementById('result-msg')
const radios = document.getElementById('radios')
const cameraBtn = document.getElementById('qrcamera-btn')


import QrScanner from './lib/qr-scanner.js';
QrScanner.WORKER_PATH = './lib/qr-scanner-worker.min.js';

// camera scan setup
var html5QrcodeScanner = new Html5Qrcode(/* element id */ "reader");
var config = { fps: 10, qrbox: { width: document.getElementById('reader').clientWidth * 0.75, height: document.getElementById('reader').clientHeigth * 0.75 } };

var qrCode;
var dcc;
var qrEngine;
var text;
var tab = "home";
var lang = ita;

var qr = "6BFKOCQRRT9V1DRCTMJ9J7$CBX4TXV-V7UWAU-GS$L1WL*WII7ULPMW.PTA881V6:PSTTD%G4G3$75M.B3WVJLMO$E% 7416Y1C-XDFRCWOK-GGKX4X6EZV0*Q43.QPWDAB864KAAWL7UI2I99W/5WHVVQC1946/565-SA24440$N054"

// on load: load localization and set up qrscanner engine
$(document).ready(function () {
    load_text();
    try{
        qrEngine = QrScanner.createQrEngine();
        // window.downloadCertificateList("192.168.1.137");
        // window.downloadVaccineList("192.168.1.137");
        // window.downloadTestList("192.168.1.137");
        // window.downloadDiseaseList("192.168.1.137");
        // window.downloadAlgorithmList("192.168.1.137");
    }
    catch(error){
        console.log(error);
    }
    
});

// listener for change on file selector, when a new qr is inserted try to decode it
fileSelector.addEventListener('change', event => {
    var file = fileSelector.files[0];
    if (!file) return;
    resetPage();
    // scan qr from image
    QrScanner.scanImage(file, null, qrEngine)
        .then(result => {
            verify(result);
        })
        .catch(e => error(e || 'No QR code found.'));
});


fileSelector.addEventListener("click", event => {
    revertScan();
});

// camera button listener to activate the camera scanner
cameraBtn.addEventListener("click", function (element) {
    if (cameraBtn.className === "btn btn-success") {
        html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess)
            .then(success => {
                cameraBtn.className = "btn btn-danger";
                cameraBtn.value = lang["home"]["stop-scanner"];
            })
            .catch(err => {
                error("No camera was found.");
            });
    }
    else
        revertScan();
});

// when a qr is successfully scanned
async function onScanSuccess(decodedText) {
    revertScan();
    resetPage();
    text = decodedText;
    verify(text);
}

// stop camera scanning
function revertScan() {
    cameraBtn.className = "btn btn-success";
    cameraBtn.value = lang["home"]["qrcamera-btn"]
    try { html5QrcodeScanner.stop(); }
    catch (error) { }
}

// verify function called if the file scan was ok
async function verify(/*label,*/ result) {
    // decode of cose content into dcc variable
    DCC.fromRaw(result).then(value =>{
        console.log(value)
        var pk_raw = (JSON.parse(localStorage.certificates))[value.kid]["publicKeyPem"]
        var pk = "-----BEGIN PUBLIC KEY-----\n"+pk_raw+"\n-----END PUBLIC KEY-----";
        window.verify(value.payload, value.signature, pk).then(result =>{
            if(result){
                console.log("Signature is correct.");
            }
            else{
                console.log("Signature is wrong.");
            }
        });
    }).catch(err => {
        error("Could not verify the DCC.");
    });


}

// on-click listener for the download button
downloadButton.addEventListener('click', function () {
    // download generated image as jpg with a random name
    qrCode.download({ name: "QR-Optimized", extension: "jpeg" });
}, false);

// faq top nav click
document.getElementById("nav-faq-btn").addEventListener("click", function () {
    if (tab === "home") {
        $('#nav-faq-btn').removeAttr("href");
        $('#nav-home-btn').attr('href', '#');
        document.getElementById("main-container").style.display = "none";
        document.getElementById("faq-container").style.display = "table";
        document.getElementById("nav-title").innerHTML = lang["faq"]["nav-title"];
        // stop camera scanning if active
        revertScan();
        tab = "faq";
    }

}, false);

// home top nav click
document.getElementById("nav-home-btn").addEventListener("click", function () {
    if (tab === "faq") {
        $('#nav-home-btn').removeAttr("href");
        $('#nav-faq-btn').attr('href', '#');
        document.getElementById("main-container").style.display = "table";
        document.getElementById("faq-container").style.display = "none";
        document.getElementById("nav-title").innerHTML = lang["home"]["nav-title"];
        tab = "home";
    }
}, false);

// load text strings from json of the selected language
function load_text() {
    // home
    if (tab === "home")
        $('#nav-title').text(lang["home"]["nav-title"]);
    else
        $('#nav-title').text(lang["faq"]["nav-title"]);
    $('#main-title').html(lang["home"]["main-title"]);
    $('#file-selector-label').html(lang["home"]["file-selector"]);
    $("#qrcamera-btn").val(lang["home"]["qrcamera-btn"]);
    $("#adv-options").html(lang["home"]["adv-options"]);
    $("#radio-label-eu").html(lang["home"]["radio-eu"]);
    $("#radio-label-it").html(lang["home"]["radio-it"]);
    if (resMsg.innerHTML)
        resMsg.innerHTML = lang["home"]["success-msg"];
    // faq
    $('.question').text(lang["faq"]["question"]);
    $('.answer').text(lang["faq"]["answer"]);
    $('.adv-detail').text(lang["faq"]["adv-detail"]);
    $('#question1').html(lang["faq"]["question1"]);
    $('#answer1').html(lang["faq"]["answer1"]);
    $('#question2').html(lang["faq"]["question2"]);
    $('#answer2').html(lang["faq"]["answer2"]);
    $('#question3').html(lang["faq"]["question3"]);
    $('#answer3').html(lang["faq"]["answer3"]);
    $('#question4').html(lang["faq"]["question4"]);
    $('#answer4').html(lang["faq"]["answer4"]);
    $('#question5').html(lang["faq"]["question5"]);
    $('#answer5').html(lang["faq"]["answer5"]);
    $('#question6').html(lang["faq"]["question6"]);
    $('#answer6').html(lang["faq"]["answer6"]);
    $('#question7').html(lang["faq"]["question7"]);
    $('#answer7').html(lang["faq"]["answer7"]);
    //$('#question8').html(lang["faq"]["question8"]);
    //$('#answer8').html(lang["faq"]["answer8"]);
    $('#adv-ans3').html(lang["faq"]["adv-ans3"]);
    $('#adv-ans3-file-sel1').html(lang["faq"]["adv-ans3-file-sel1"]);
    $('#adv-ans3-file-sel2').html(lang["faq"]["adv-ans3-file-sel2"]);
    $('#adv-ans3-file-sel3').html(lang["faq"]["adv-ans3-file-sel3"]);
    $('#adv-ans3-qr-scan1').html(lang["faq"]["adv-ans3-qr-scan1"]);
    $('#adv-ans3-qr-scan2').html(lang["faq"]["adv-ans3-qr-scan2"]);
    $('#adv-ans3-qr-gen1').html(lang["faq"]["adv-ans3-qr-gen1"]);
    $('#adv-ans3-qr-gen2').html(lang["faq"]["adv-ans3-qr-gen2"]);
    $('#adv-ans5').html(lang["faq"]["adv-ans5"]);

    // listener for dinamically generated faq link in advanced settings
    document.getElementById("setting-faq-btn").addEventListener("click", function () {
        document.getElementById("nav-faq-btn").click();
    }, false);
}

// italian language on click
$('#ita').click(function () {
    // change language to italian
    lang = ita;
    load_text();
    $('#ita').removeAttr("href");
    $('#eng').attr('href', '#');
});

// english language on click
$('#eng').click(function () {
    // change language to english
    lang = eng;
    load_text();
    $('#eng').removeAttr("href");
    $('#ita').attr('href', '#');
});

// flush errors and previous prints
function resetPage() {
    errorMsg.innerHTML = "";
    errorMsg.className = "";
    resMsg.innerHTML = "";
    resMsg.className = "";
    downloadButton.style.display = "none";
    qrCanvas.innerHTML = "";
}

// error print
function error(msg) {
    errorMsg.className = "alert alert-danger";
    errorMsg.innerHTML = msg;
}