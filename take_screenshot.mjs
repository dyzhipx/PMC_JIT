import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const artifactsDir = 'C:\\Users\\54321\\.gemini\\antigravity\\brain\\4e6ad590-5593-46fc-b3d8-a2298f34da8f\\artifacts';

if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
    const page = await browser.newPage();
    
    const baseUrl = 'http://localhost:5137';

    console.log('Taking screenshot of Login...');
    await page.goto(`${baseUrl}/#/login`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactsDir, 'login.png') });

    // Simulate login
    console.log('Logging in...');
    await page.type('#username', 'Admin');
    await page.type('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard navigation
    await page.waitForFunction('window.location.hash.includes("dashboard")', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));
    console.log('Taking screenshot of Dashboard...');
    await page.screenshot({ path: path.join(artifactsDir, 'dashboard.png') });

    console.log('Taking screenshot of Warehouse...');
    await page.goto(`${baseUrl}/#/warehouse/stock`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactsDir, 'warehouse.png') });

    console.log('Taking screenshot of Transit...');
    await page.goto(`${baseUrl}/#/transit/stock-on-hand`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactsDir, 'transit.png') });

    console.log('Taking screenshot of Produksi...');
    await page.goto(`${baseUrl}/#/produksi/inbound`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactsDir, 'produksi.png') });

    console.log('Taking screenshot of TV Dashboard...');
    await page.goto(`${baseUrl}/#/tv/inbound`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(artifactsDir, 'tv_dashboard.png') });

    await browser.close();
    console.log('All screenshots saved!');
})();
