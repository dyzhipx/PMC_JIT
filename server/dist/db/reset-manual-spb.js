import { db } from "../config/database.js";
async function resetManualSpb() {
    console.log("Starting reset of Manual SPB data...");
    try {
        // Delete items first due to foreign key
        const deletedItems = await db.manualSpbItem.deleteMany({});
        console.log(`Deleted ${deletedItems.count} SPB items.`);
        const deletedSpb = await db.manualSpb.deleteMany({});
        console.log(`Deleted ${deletedSpb.count} SPB headers.`);
        console.log("Reset completed successfully.");
    }
    catch (err) {
        console.error("Error during reset:", err);
        process.exit(1);
    }
    finally {
        process.exit(0);
    }
}
resetManualSpb();
