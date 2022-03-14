const https = require('https');

async function requestCertificates(url, callback){   
  const options = {
      hostname: url,
      port: 5000,
      path: '/certificates',
      method: 'GET',
  }
  let result;
  const req = https.request(options, res=>{
      res.on('data', d =>{
          callback(JSON.parse(d));
      })
  })

  req.on('error', error =>{
      console.log(error);
  })
  req.end();
}
window.requestCertificates = requestCertificates;