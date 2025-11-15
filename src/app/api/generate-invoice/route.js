import puppeteer from "puppeteer";

export async function POST(req) {
  const { html } = await req.json();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1) Create base HTML with Tailwind CDN
  await page.setContent(
    `
    <html dir="rtl">
      <head>
        <meta charset="UTF-8" />

        <!-- Tailwind CDN -->
        <script src="https://cdn.tailwindcss.com"></script>

        <style>
          body {
            background: white;
            padding: 20px;
            font-family: 'Arial', sans-serif;
          }
        </style>
      </head>

      <body>
        <div id="invoice-wrapper">${html}</div>
      </body>
    </html>
  `
  );

  // 2) WAIT for Tailwind to load (REQUIRED)
  await page.waitForFunction(() => {
    return window.getComputedStyle(document.body).padding !== "";
  });

  // 3) Generate PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
    },
  });
}
