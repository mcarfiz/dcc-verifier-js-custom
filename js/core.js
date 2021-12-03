var errorMsg = document.getElementById('errmsg');
var usrName = document.getElementById('userdata-name');
var usrDob = document.getElementById('userdata-dob');
var restartButton = document.getElementById('restartscan');
var resultBorder = document.getElementById('resultborder');

var BASE_URL = "https://mcarfiz.github.io/dgcc-verifier-js-custom/";
var RULES_NUMBER = 5;

var html5QrcodeScanner = new Html5Qrcode(/* element id */ "reader");
var config = { fps: 10, qrbox: { width: document.getElementById('reader').clientWidth * 0.75, height: document.getElementById('reader').clientHeigth * 0.75 } };
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
    try {
        var dcc = await DCC.fromRaw(String(decodedText));
    } catch (error) {
        console.log(error);
        certNotValid(`N/A`, `N/A`);
        restartButton.style.display = "flex";
        return;
    }

    const rule_array = [];
    var valueSets;

    // fetch value sets
    await fetch(BASE_URL + '/data/rules/valueSets.json')
        .then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error('Fetching error');
        })
        .then(data => {
            valueSets = data;
        })
        .catch(error => {
            document.getElementById('errborder').style.display = "flex";
            errorMsg.className = "alert alert-danger";
            errorMsg.innerHTML = "Cannot fetch rule value sets: " + error;
        });

    // fetch general rules and push it into rules array
    await fetch(BASE_URL + '/data/rules/GR-EU-0001.json')
        .then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error('Fetching error');
        })
        .then(data => {
            rule_array.push(Rule.fromJSON(data, {
                valueSets
            }));
        })
        .catch(error => {
            document.getElementById('errborder').style.display = "flex";
            errorMsg.className = "alert alert-danger";
            errorMsg.innerHTML = "Cannot fetch rule GR-EU-0001: " + error;
        });

    // build rules array from vaccination files
    if ('v' in dcc.payload) {
        await fetch(BASE_URL + '/data/rules/VR-EU-0000.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule VR-EU-0000: " + error;
            });

        await fetch(BASE_URL + '/data/rules/VR-EU-0001.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule VR-EU-0001: " + error;
            });

        await fetch(BASE_URL + '/data/rules/VR-EU-0002.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule VR-EU-0002: " + error;
            });

        await fetch(BASE_URL + '/data/rules/VR-EU-0003.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {
                    validationClock: new Date().toISOString(),
                }));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule VR-EU-0003: " + error;
            });

        await fetch(BASE_URL + '/data/rules/VR-EU-0004.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule VR-EU-0004: " + error;
            });

        console.log("vaccination");
    }
        
    // build rules array from test files
    if ('t' in dcc.payload) {
        await fetch(BASE_URL + '/data/rules/TR-EU-0000.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule TR-EU-0000: " + error;
            });

        await fetch(BASE_URL + '/data/rules/TR-EU-0001.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {valueSets}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule TR-EU-0001: " + error;
            });

        await fetch(BASE_URL + '/data/rules/TR-EU-0002.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {valueSets}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule TR-EU-0002: " + error;
            });

        await fetch(BASE_URL + '/data/rules/TR-EU-0003.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {valueSets}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule TR-EU-0003: " + error;
            });

        await fetch(BASE_URL + '/data/rules/TR-EU-0004.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule TR-EU-0004: " + error;
            });
        console.log("test");
    }
        
    // build rules array from recovery files
    if ('r' in dcc.payload) {
        await fetch(BASE_URL + '/data/rules/RR-EU-0000.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule RR-EU-0000: " + error;
            });

        await fetch(BASE_URL + '/data/rules/RR-EU-0001.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {
                    validationClock: new Date().toISOString(),
                }));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule VR-EU-0001: " + error;
            });

        await fetch(BASE_URL + '/data/rules/RR-EU-0002.json')
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Fetching error');
            })
            .then(data => {
                rule_array.push(Rule.fromJSON(data, {}));
            })
            .catch(error => {
                document.getElementById('errborder').style.display = "flex";
                errorMsg.className = "alert alert-danger";
                errorMsg.innerHTML = "Cannot fetch rule RR-EU-0002: " + error;
            });
        console.log("recovery");
    }

    // check if dcc follows all the rules in the array
    const rulesValid = await areRulesValid(dcc, rule_array);
    if (dcc && rulesValid) {//dcc check isnt even needed because its in a try-catch block
        console.log('Certificate content is valid.');
        console.log(`Name: ${dcc.payload.nam.gn} ${dcc.payload.nam.fn}`);
        console.log(`Date of birth: ${dcc.payload.dob}`);
        // fetch list of public keys
        var keysList;
        await fetch(BASE_URL + '/data/public_keys.json')
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
                errorMsg.innerHTML = "Cannot fetch keys list: " + error;
            });
        // check if cose signature is valid against set of public keys
        try{ // try-catch needed to handle exception that is thrown when kid is valid but signature is not matching
            var verified = await verify(dcc, keysList);
        }catch{
            verified = false;
        }
        
        if (verified) {
            certValid(`${dcc.payload.nam.gn} ${dcc.payload.nam.fn}`, `${dcc.payload.dob}`);
        }
        else {
            certNotValid(`${dcc.payload.nam.gn} ${dcc.payload.nam.fn}`, `${dcc.payload.dob}`);
        }
        console.log(verified ? "Certificate signature has been verified." : "Certificate signature CANNOT be verified.");
    }

    else {
        certNotValid(`N/A`, `N/A`);
    }

    restartButton.style.display = "flex";
}

// check if cose signature is valid against set of public keys
const verify = async function (dcc, keysList) {
    try {
        return cose.verify(dcc._coseRaw, { key: keysList.keys[dcc.kid].publicKey });
    } catch{ // if key is not found in provided list
        return false;
    }
}

// check if dcc follows set of rules
const areRulesValid = async function (dcc, rules) {
    // certificate cannot be verified if all rules haven't been fetched
    if (rules.length < RULES_NUMBER)
        return false;
    let validity = true;
    let i = 0;
    for (const rule of rules) {
        // handling exception of when the payload has valid structure but data of wrong type
        // or anything that doesn't work with the rules
        try{
            rule_valid = await rule.evaluateDCC(dcc);
            if (rule_valid) 
                console.log(`Rule ${i} valid: ${rule.getDescription()}`);
            else 
                console.log(`Rule ${i} NOT valid: ${rule.getDescription()}`);
            validity = rule_valid && validity;
            // end loop when a rule is not respected
            if (!validity) return false;
            i++;
        }catch(error){
            console.log(error);
            return false;
        }
    }
    return validity;
}

// rescan button click event
restartButton.addEventListener('click', function () {
    flush();
    html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess);
})

// clear page for restart
const flush = function () {
    usrName.innerHTML = "";
    usrDob.innerHTML = "";
    resultBorder.style.display = "none";
    document.getElementById('errborder').style.display = "none";
    errorMsg.innerHTML = "";
    restartButton.style.display = "none";
    document.getElementById('title').style.display = "flex";
    document.getElementById('title').innerHTML = "Frame the DGCC QR code:";
    document.getElementById('contentresult').innerHTML = "";
}

// fill result div with error colors and result values
const certNotValid = function (name, dob) {
    document.getElementById('contentresult').innerHTML = "Certificate is NOT valid.";
    resultBorder.style.display = "flex";
    resultBorder.style.color = "red";
    resultBorder.classList.remove("bg-success");
    resultBorder.classList.remove("border-success");
    resultBorder.classList.add("border-danger");
    resultBorder.classList.add("bg-danger");
    usrName.innerHTML = name;
    usrDob.innerHTML = dob;
}

// fill result div with success colors and result values
const certValid = function (name, dob) {
    document.getElementById('contentresult').innerHTML = "Certificate is valid.";
    resultBorder.classList.remove("bg-danger");
    resultBorder.classList.remove("border-danger");
    resultBorder.classList.add("border-success");
    resultBorder.classList.add("bg-success");
    resultBorder.style.display = "flex";
    usrName.innerHTML = name;
    usrDob.innerHTML = dob;
}