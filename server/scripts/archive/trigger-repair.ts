import { getTransitInventory } from "../src/services/transit.service.js";

async function main() {
  console.log("Triggering transit inventory fetching to repair MIDs...");
  const items = await getTransitInventory();
  console.log(`Fetched ${items.length} items. Background repair should be running...`);
  
  // wait a little bit for the background promise to complete
  await new Promise(r => setTimeout(r, 2000));
  console.log("Done.");
  process.exit();
}
main();
