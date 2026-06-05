function dataListFromEnterButton(btn, { mail_flg = 0 } = {}) {
    const m = btn.getAttribute('onclick')?.match(
      /sendEnterMail\s*\(\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*['"]?([^'",)]+)['"]?\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/
    );
    if (!m) throw new Error('sendEnterMail の onclick を解析できません');
  
    const [, r_id, is_mail, c_id, f_id, attend_flg, linkage, date, strength_action, special_support, meal_add] = m;
  
    return {
      attendance_type: 1,
      r_id: String(r_id).trim(),
      mail_flg: Number(mail_flg), // ボタン由来ではなく明示（入室直後の POST は通常 0）
      c_id: Number(String(c_id).trim()),
      f_id: Number(String(f_id).trim()),
      attend_flg: Number(String(attend_flg).trim()),
      linkage: Number(String(linkage).trim()),
      date: String(date).trim(),
      strength_action: Number(String(strength_action).trim()),
      special_support: Number(String(special_support).trim()),
      meal_add: Number(String(meal_add).trim()),
    };
  }
  
  // 例: クリックしたボタンから
  // const btn = event.currentTarget;
  // const dataList = dataListFromEnterButton(btn, { mail_flg: 0 });


const base = 'https://www.hug-ayumu.link/hug/wm/'; // 実際の出席表と同じオリジンに合わせる
const url = new URL('ajax/ajax_attendance.php', base).href;

const dataList = {
  attendance_type: 1,
  r_id: '40080',
  mail_flg: 0,
  c_id: 78,
  f_id: 3,
  attend_flg: 1,
  linkage: 0,
  date: '2026-05-16',
  strength_action: 0,
  special_support: 0,
  meal_add: 0,
};

const body = new URLSearchParams();
for (const [key, value] of Object.entries(dataList)) {
  body.append(`data_list[${key}]`, String(value));
}

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest', // jQuery と揃えたい場合（サーバが見ていなければ省略可）
  },
  body: body.toString(),
  credentials: 'include', // セッション Cookie 必須なら必須
});

const data = await res.json(); // 元コードは dataType: 'json'