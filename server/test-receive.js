const fetch = require('node-fetch'); // Assumes fetch is built-in or polyfilled. Using native fetch if Node 18+.

(async () => {
  console.log("Sending request to /production/receive ...");
  try {
    const res = await fetch('http://localhost:3000/production/receive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        line: "A",
        material: "KARTON ABC SUSU 12 X 10 X 30",
        barcode: "00086",
        pcs: 1250
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
})();
