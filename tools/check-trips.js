const http = require('http');

http.get('http://localhost/api/trips', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const j = JSON.parse(data);
      const trips = j.trips || [];
      console.log('trips:', trips.length);
      trips.forEach((t, i) => {
        const thumb = t.thumbnail || (t.images && t.images[0] && t.images[0].url);
        console.log(`${i+1}. ${t.title} -> ${thumb ? thumb : '<no-thumb>'}`);
      });
    } catch (e) {
      console.error('parse error', e, data);
    }
  });
}).on('error', (e) => console.error('request error', e));
