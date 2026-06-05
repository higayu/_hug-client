const puppeteer = require("puppeteer");

async function loginHug() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://www.hug-ayumu.link/hug/wm/", { waitUntil: "networkidle2" });

    // ログインフォームに入力
  await page.type('input[name="username"]', "ユーザID");
  await page.type('input[name="password"]', "パスワード");

  // ✅ チェックボックスをONにする
  const checkbox = await page.$('input[name="setexpire"]');
  const isChecked = await (await checkbox.getProperty("checked")).jsonValue();
  if (!isChecked) {
    await checkbox.click();
  }

  // ログインボタンをクリック
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click("input.btn-login"),
  ]);

  // 任意のページに遷移
  await page.goto("https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=3&date=2025-10-03", {
    waitUntil: "networkidle2",
  });
  const html = await page.content();
  await browser.close();
}

loginHug();
