var errorMsg = document.getElementById('errmsg');
var usrName = document.getElementById('userdata-name');
var usrDob = document.getElementById('userdata-dob');
var restartButton = document.getElementById('restartscan');

var html5QrcodeScanner = new Html5Qrcode(/* element id */ "reader");
var config = { fps: 10, qrbox: {width: document.getElementById('reader').clientWidth*0.75, height: document.getElementById('reader').clientHeigth*0.75} };
// prefer back camera
html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess);

async function onScanSuccess(decodedText, decodedResult) {
    html5QrcodeScanner.stop().then((ignore) => {
        html5QrcodeScanner.clear();
    }).catch((err) => {
        console.log(err);
        document.getElementById('errborder').style.display = "flex";
        errorMsg.innerHTML(err);
      });
    document.getElementById('title').innerHTML = "";
    document.getElementById('title').style.display = "none";
    document.getElementById('reader').remove;
    
    // build the certificate from the string that has been read from QR
    try{
        var dcc = await DCC.fromRaw(String(decodedText));
    } catch(error){
        console.log(error);
        document.getElementById('errborder').style.display = "flex";
        console.log('Certificate is NOT valid.');
        errorMsg.innerHTML = 'Certificate is NOT valid.';
        restartButton.style.display = "flex";
        return;
    }
    
    // build rules array from files
    const rule_array = [];
    await fetch('../data/rules/VR-EU-0000.json')
    .then(response => {
        if (response.ok)
            return response.json();
        else
            throw new Error('Fetching error');
    })
    .then(data => {
        rule_array.push(Rule.fromJSON(data,{}));
    })
    .catch(error => {
        document.getElementById('errborder').style.display = "flex";
        errorMsg.className = "alert alert-danger";
        errorMsg.innerHTML = "Cannot fetch rule VR-EU-0000: " + error;
    });

    await fetch('../data/rules/VR-EU-0001.json')
    .then(response => {
        if (response.ok)
            return response.json();
        else
            throw new Error('Fetching error');
    })
    .then(data => {
        rule_array.push(Rule.fromJSON(data,{}));
    })
    .catch(error => {
        document.getElementById('errborder').style.display = "flex";
        errorMsg.className = "alert alert-danger";
        errorMsg.innerHTML = "Cannot fetch rule VR-EU-0001: " + error;
    });

    await fetch('../data/rules/VR-EU-0002.json')
    .then(response => {
        if (response.ok)
            return response.json();
        else
            throw new Error('Fetching error');
    })
    .then(data => {
        rule_array.push(Rule.fromJSON(data,{}));
    })
    .catch(error => {
        document.getElementById('errborder').style.display = "flex";
        errorMsg.className = "alert alert-danger";
        errorMsg.innerHTML = "Cannot fetch rule VR-EU-0002: " + error;
    });

    await fetch('../data/rules/VR-EU-0003.json')
    .then(response => {
        if (response.ok)
            return response.json();
        else
            throw new Error('Fetching error');
    })
    .then(data => {
        rule_array.push(Rule.fromJSON(data, {
            //valueSets,
            validationClock : new Date().toISOString(),
        }));
    })
    .catch(error => {
        document.getElementById('errborder').style.display = "flex";
        errorMsg.className = "alert alert-danger";
        errorMsg.innerHTML = "Cannot fetch rule VR-EU-0003: " + error;
    });

    await fetch('../data/rules/VR-EU-0004.json')
    .then(response => {
        if (response.ok)
            return response.json();
        else
            throw new Error('Fetching error');
    })
    .then(data => {
        rule_array.push(Rule.fromJSON(data,{}));
    })
    .catch(error => {
        document.getElementById('errborder').style.display = "flex";
        errorMsg.className = "alert alert-danger";
        errorMsg.innerHTML = "Cannot fetch rule VR-EU-0004: " + error;
    });

    // check if dcc follows all the rules in the array
    const rulesValid = await areRulesValid(dcc, rule_array);
    if (dcc && rulesValid){//dcc check isnt even needed because its in a try-catch block
        console.log('Certificate content is valid.');
        console.log(`Name: ${dcc.payload.nam.gn} ${dcc.payload.nam.fn}`);
        console.log(`Date of birth: ${dcc.payload.dob}`);
        // fetch list of public keys
        var keysList;
        await fetch('../data/public_keys.json')
        .then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error('Fetching error');
        })
        .then(data => {    
            keysList = data;     
        })
        .catch(error => {
            document.getElementById('errborder').style.display = "flex";
            errorMsg.className = "alert alert-danger";
            errorMsg.innerHTML = "Cannot fetch rule VR-EU-0004: " + error;
        });
        // check if cose signature is valid against set of public keys
        const verified = await verify(dcc, keysList);
        if (verified) {
            document.getElementById('succborder').classList.remove("bg-danger");
            document.getElementById('succborder').classList.add("bg-success");
            document.getElementById('contentsucc').innerHTML = "Certificate is valid.";
            document.getElementById('succborder').style.display = "flex";
            usrName.innerHTML = `${dcc.payload.nam.gn} ${dcc.payload.nam.fn}`;
            usrDob.innerHTML = `${dcc.payload.dob}`;
        }
        else {
            document.getElementById('contentsucc').innerHTML = "Certificate is NOT valid.";
            document.getElementById('succborder').style.display = "flex";
            document.getElementById('succborder').style.color = "red";
            document.getElementById('succborder').classList.remove("bg-success");
            document.getElementById('succborder').classList.add("bg-danger");
            usrName.innerHTML = `${dcc.payload.nam.gn} ${dcc.payload.nam.fn}`;
            usrDob.innerHTML = `${dcc.payload.dob}`;

        }
        console.log(verified ? "Certificate signature has been verified." : "Certificate signature CANNOT be verified.");
    }

    else {
        document.getElementById('errborder').style.display = "flex";
        console.log('Certificate content is NOT valid.');
        errorMsg.innerHTML = 'Certificate content is NOT valid.';
    }

    restartButton.style.display = "flex";
}

// check if cose signature is valid against set of public keys
const verify = async function (dcc, keysList) {
    try{
        return cose.verify(dcc._coseRaw, { key:  keysList.keys[dcc.kid].publicKey});
    } catch{
        return false;
    }
    
}

// check if dcc follows set of rules
const areRulesValid = async function (dcc, rules) {
    if (rules.length < 4)
        return false;
    let validity = true;
    let i = 0;
    for(const rule of rules) {
        if (rule.evaluateDCC(dcc)) console.log(`Rule ${i} valid: ${rule.getDescription()}`);
        else console.log(`Rule ${i} NOT valid: ${rule.getDescription()}`);
        validity = (await rule.evaluateDCC(dcc)) && validity;
        if (!validity) return false;
        i++;
    }
    return validity;
}

// rescan button click event
restartButton.addEventListener('click', function() {
    flush();
    html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess);
})

// clear page for restart
const flush = function () {
    usrName.innerHTML = "";
    usrDob.innerHTML = "";
    document.getElementById('succborder').style.display="none";
    document.getElementById('errborder').style.display="none";
    errorMsg.innerHTML = "";
    restartButton.style.display = "none";
    document.getElementById('title').style.display = "flex";
    document.getElementById('title').innerHTML = "Frame the DGCC QR code:";
    document.getElementById('contentsucc').innerHTML = "";
}