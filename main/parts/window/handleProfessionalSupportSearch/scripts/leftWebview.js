// main\parts\window\handleProfessionalSupportSearch\scripts\leftWebview.js

export async function fetchLeftTable(left, facilityId, dateStr) {
  const url =
    `https://www.hug-ayumu.link/hug/wm/attendance.php?f_id=${facilityId}`;

  await new Promise(resolve => {
    left.addEventListener("did-stop-loading", resolve, { once: true });
    left.src = url;
  });

  return left.executeJavaScript(`
(() => {
  const result = [];

  const cells = document.querySelectorAll(
    '.calendar table.bizdayset td.calendar-day[id^="td_"]'
  );

  cells.forEach(td => {
    const date = td.id.replace('td_', '');

    const dayText = td.querySelector('p.calendar-day');
    const dayNumber = dayText
      ? dayText.childNodes[0].textContent.trim()
      : '';
    const weekday = dayText
      ? dayText.querySelector('span.sp')?.textContent.replace(/[()]/g, '') ?? ''
      : '';

    const dayData = {
      date,
      day: dayNumber,
      weekday,
      categories: {}
    };

    const dts = td.querySelectorAll('dl > dt');
    dts.forEach(dt => {
      const category = dt.querySelector('span')?.textContent.trim();
      const count = Number(dt.querySelector('b')?.textContent ?? 0);

      const dd = dt.nextElementSibling;
      const names = dd
        ? Array.from(dd.querySelectorAll('li'))
            .map(li => li.textContent.trim())
        : [];

      if (category) {
        dayData.categories[category] = {
          count,
          names
        };
      }
    });

    result.push(dayData);
  });

  return result;
})();
`);
}
