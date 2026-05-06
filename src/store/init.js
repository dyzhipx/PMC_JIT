/* ===== PMC Global Store - Auto Init ===== */
import './core.js';
import './master.js';
import './inventory.js';
import './production.js';
import './delivery.js';
import './audit.js';

const PMCStore = window.PMCStore;

PMCStore.loadMasterDataFromAPI();
PMCStore.loadSchedulesFromAPI();
PMCStore.loadActiveDeliveriesFromAPI();
PMCStore.loadTransitInfoFromAPI();
if (PMCStore.loadLineStockFromAPI) PMCStore.loadLineStockFromAPI();
if (PMCStore.loadLineBarcodesFromAPI) PMCStore.loadLineBarcodesFromAPI();
if (PMCStore.loadPendingReturnsFromAPI) PMCStore.loadPendingReturnsFromAPI();
if (PMCStore.loadTransitOutboundPendingFromAPI) PMCStore.loadTransitOutboundPendingFromAPI();
if (PMCStore.loadStockMutationsFromAPI) PMCStore.loadStockMutationsFromAPI();
if (PMCStore.loadTransitInventoryFromAPI) PMCStore.loadTransitInventoryFromAPI();
if (PMCStore.loadMaterialRecehFromAPI) PMCStore.loadMaterialRecehFromAPI();