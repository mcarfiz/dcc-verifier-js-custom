const ECDSA = require('elliptic').ec;
const crypto = require('crypto');
const buffer = require('buffer');
const sha256 = require('js-sha256');

function verify(payload, signature, public_key){
    var ec = new ECDSA('p256');
    const ver = crypto.Verify('sha256');
    var buf = new Uint8Array(signature);
    var sig_hex = buffer.Buffer.from(buf).toString("hex");
    const sig = {
      r: sig_hex.slice(0, 64),
      s: sig_hex.slice(64)
    }
    ver.update(payload);
    ver.end();
    buf = ver.verify(public_key, sig).data.subjectPublicKey.data
    var pk_hex = buffer.Buffer.from(buf).toString("hex");
    const key = ec.keyFromPublic(pk_hex, 'hex');
    console.log(payload)
    console.log(key.verify(payload, sig));

}
// function verify (sig, hash, key, signType, tag) {
//     var pub = parseKeys(key)
//     return pub;

// window.EC = ec;
// window.CRYPTO = crypto;
window.BUFFER = buffer;
window.verify = verify;

