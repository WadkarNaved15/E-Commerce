import puppeteer from 'puppeteer';


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to your dashboard URL
  await page.goto(`http://localhost:5173/admin/dashboard`);

  // Set viewport to capture the entire page
  await page.setViewport({ width: 1280, height: 800 });

  // Take a screenshot or export as PDF
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' }); // e.g., "August"
  const year = date.getFullYear();
  
  await page.pdf({
    path: `reports/${month}-${year}-dashboard-report.pdf`, 
    format: 'A4',
    printBackground: true
  });
  

  await browser.close();
})();
