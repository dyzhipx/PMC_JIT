async function test() {
  const resp = await fetch('http://localhost:3000/api/master/sku', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'TEST_SKU_NODE_99', name: 'Test SKU Name From Node', uom: 'BOX' })
  });
  console.log('Status:', resp.status);
  const data = await resp.json();
  console.log('Data:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
