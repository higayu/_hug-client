export async function fetchLeftTable(left, facilityId, dateStr) {
  const url =
    `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facilityId}&date=${dateStr}`;

  await new Promise(resolve => {
    left.addEventListener("did-stop-loading", resolve, { once: true });
    left.src = url;
  });

  return left.executeJavaScript(`
    const t = document.querySelector("table.js_adding_table") || document.querySelector("table");
    t ? t.outerHTML : "<p>左：テーブルなし</p>";
  `);
}
