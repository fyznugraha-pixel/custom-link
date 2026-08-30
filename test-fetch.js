const http = require('https');

http.get('https://www.fyurl.fun/21Agustus', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Location:', res.headers.location);
}).on('error', (e) => {
  console.error(e);
});
