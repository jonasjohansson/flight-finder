const PROBE_URL = 'https://api.tequila.kiwi.com/v2/search?fly_from=ARN&fly_to=NRT&date_from=01/06/2026&date_to=07/06/2026&limit=1';

const status = document.getElementById('app');
status.textContent = 'Probing Kiwi CORS...';

fetch(PROBE_URL, { headers: { apikey: 'invalid-key-for-probe' } })
  .then(r => {
    status.textContent = `CORS OK. Status: ${r.status} (401 expected for bad key — that means the request reached Kiwi).`;
  })
  .catch(err => {
    status.textContent = `CORS BLOCKED: ${err.message}. Will need proxy.`;
  });
