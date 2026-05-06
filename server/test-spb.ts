import { createManualSpb } from './src/services/manual-spb.service.js';

async function main() {
  try {
    for (let i = 0; i < 15; i++) {
        const spb = await createManualSpb("TestingUser", "Emergency", [
          { materialName: "Material A", qtyPallets: 1, qtyPcs: 10 }
        ]);
        console.log("SPB Created:", spb.spbNumber);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
main();
