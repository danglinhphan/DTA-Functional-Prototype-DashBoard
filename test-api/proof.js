const fetch = require('node-fetch');

async function getProof() {
    const url = 'https://data.gov.au/data/dataset/d41c5c1c-1bae-4871-af56-1eca5b340039/resource/e33c772c-e59f-43a0-a014-01d066d65e42/download/mdpr-2026-project-data.csv';
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');
    console.log('--- API Data (First 3 Projects) ---');
    for (let i = 1; i < 4; i++) {
        console.log(`Project ${i}: ${lines[i]}`);
    }
}

getProof();
