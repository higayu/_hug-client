(async () => {
  const SELECT_CHILLED = 99;//92;

  const listUrl =
    `https://www.hug-ayumu.link/hug/wm/addition_plan_situation.php?mode=list&c_id=${SELECT_CHILLED}`;

  /**
   * HTML要素をMarkdownに変換する
   */
  function htmlElementToMarkdown(root) {
    const lines = [];

    const normalizeText = (text) => {
      return text
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    };

    const getCellText = (cell) => {
      return normalizeText(cell.innerText || cell.textContent || "");
    };

    // タイトル
    const title = root.querySelector("h3");
    if (title) {
      const titleText = normalizeText(title.innerText || title.textContent || "")
        .replace(/\s*公開\s*$/, "");

      if (titleText) {
        lines.push(`# ${titleText}`);
        lines.push("");
      }
    }

    // 右上の基本情報
    const info = root.querySelector(".pull-right p");
    if (info) {
      const infoLines = normalizeText(info.innerText || info.textContent || "")
        .split("\n")
        .map(v => normalizeText(v))
        .filter(Boolean);

      if (infoLines.length) {
        lines.push("## 基本情報");
        lines.push("");

        for (const line of infoLines) {
          lines.push(`- ${line}`);
        }

        lines.push("");
      }
    }

    // 上部テーブル：受給者証番号、支援期間、回数など
    const firstTable = root.querySelector(".ebox-content table");
    if (firstTable) {
      const cells = [...firstTable.querySelectorAll("th, td")].map(getCellText);

      if (cells.length >= 2) {
        lines.push("## 計画情報");
        lines.push("");

        for (let i = 0; i < cells.length; i += 2) {
          const key = cells[i];
          const value = cells[i + 1];

          if (key && value !== undefined) {
            lines.push(`- ${key}: ${value}`);
          }
        }

        lines.push("");
      }
    }

    // アセスメント、方針、長期目標、短期目標
    const summaryRows = [...root.querySelectorAll(".ebox-content table tr")]
      .filter(row => {
        const th = row.querySelector("th");
        const td = row.querySelector("td");
        return th && td;
      });

    for (const row of summaryRows) {
      const th = row.querySelector("th");
      const td = row.querySelector("td");

      const heading = getCellText(th);
      const body = getCellText(td);

      // 受給者証番号などの1行テーブルは除外
      if (
        ["受給者証番号", "支援期間", "回数"].includes(heading)
      ) {
        continue;
      }

      if (heading && body) {
        lines.push(`## ${heading}`);
        lines.push("");
        lines.push(body);
        lines.push("");
      }
    }

    // 支援内容テーブル
    const careTable = root.querySelector(".carePlanContent table");
    if (careTable) {
      const rows = [...careTable.querySelectorAll("tr")];

      const headerRow = rows.find(row => row.querySelectorAll("th").length >= 2);
      const headers = headerRow
        ? [...headerRow.querySelectorAll("th")].map(getCellText).filter(Boolean)
        : [];

      const bodyRows = rows.filter(row => row.querySelector("td"));

      if (headers.length && bodyRows.length) {
        lines.push("## 支援内容");
        lines.push("");

        lines.push(`| ${headers.join(" | ")} |`);
        lines.push(`| ${headers.map(() => "---").join(" | ")} |`);

        for (const row of bodyRows) {
          const cells = [...row.querySelectorAll("th, td")]
            .map(cell => {
              return getCellText(cell)
                .replace(/\n/g, "<br>")
                .replace(/\|/g, "｜");
            });

          lines.push(`| ${cells.join(" | ")} |`);
        }

        lines.push("");
      }
    }

    // 署名欄
    const signArea = root.querySelector(".individualSign");
    if (signArea) {
      const signText = normalizeText(signArea.innerText || signArea.textContent || "");

      if (signText) {
        lines.push("## 同意・署名");
        lines.push("");
        lines.push(signText);
        lines.push("");
      }
    }

    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  try {
    console.log("[HUG WM] 一覧HTML fetch開始:", listUrl);

    const listResponse = await fetch(listUrl, {
      method: "GET",
      credentials: "include"
    });

    console.log("[HUG WM] 一覧 status:", listResponse.status);
    console.log("[HUG WM] 一覧 ok:", listResponse.ok);

    if (!listResponse.ok) {
      throw new Error(`一覧HTML取得エラー: ${listResponse.status}`);
    }

    const listHtml = await listResponse.text();
    const parser = new DOMParser();
    const listDoc = parser.parseFromString(listHtml, "text/html");

    const table = listDoc.querySelector("div.individualSituation table.table");

    if (!table) {
      console.warn("[HUG WM] テーブル未存在");
      return;
    }

    const openLabel = [...table.querySelectorAll("i")]
      .find(el => el.textContent.trim() === "公開");

    if (!openLabel) {
      console.warn("[HUG WM] 公開ラベル未存在");
      return;
    }

    const link = openLabel.closest("a");

    if (!link) {
      console.warn("[HUG WM] 公開リンク未存在");
      return;
    }

    const href = link.getAttribute("href");

    const detailUrlObj = new URL(
      href,
      "https://www.hug-ayumu.link/hug/wm/"
    );

    const SELECT_ID = detailUrlObj.searchParams.get("id");

    if (!SELECT_ID) {
      console.warn("[HUG WM] id取得失敗");
      return;
    }

    console.log("[HUG WM] 取得したSELECT_ID:", SELECT_ID);

    const detailUrl =
      `https://www.hug-ayumu.link/hug/wm/addition_plan.php?mode=detail&id=${SELECT_ID}`;

    console.log("[HUG WM] 詳細HTML fetch開始:", detailUrl);

    const detailResponse = await fetch(detailUrl, {
      method: "GET",
      credentials: "include"
    });

    console.log("[HUG WM] 詳細 status:", detailResponse.status);
    console.log("[HUG WM] 詳細 ok:", detailResponse.ok);

    if (!detailResponse.ok) {
      throw new Error(`詳細HTML取得エラー: ${detailResponse.status}`);
    }

    const detailHtml = await detailResponse.text();
    const detailDoc = parser.parseFromString(detailHtml, "text/html");

    const carebreak = detailDoc.querySelector("#carebreak");

    if (!carebreak) {
      console.warn("[HUG WM] #carebreak 未存在");
      return;
    }

    console.log("[HUG WM] #carebreak 要素:");
    console.log(carebreak);

    console.log("[HUG WM] #carebreak HTML:");
    console.log(carebreak.outerHTML);

    console.log("[HUG WM] #carebreak テキスト:");
    console.log(carebreak.textContent.trim());

    // Markdown変換
    const markdown = htmlElementToMarkdown(carebreak);

    console.log("[HUG WM] #carebreak Markdown:");
    console.log(markdown);

    // クリップボードにもコピーしたい場合
    await navigator.clipboard.writeText(markdown);
    console.log("[HUG WM] Markdownをクリップボードにコピーしました");

  } catch (error) {
    console.error("[HUG WM] エラー:", error);
  }
})();