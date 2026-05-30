(() => {
  const HF = (window.HugPersonalForm = window.HugPersonalForm || {});
  const MonthFetch = (HF.MonthFetch = HF.MonthFetch || {});

  const MAX_MONTHS_DEFAULT = 6;

  const formatDateInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getTodayDateString = () => formatDateInput(new Date());

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDateInput(d);
  };

  /**
   * 月ごと取得は過去分のみ。当日は範囲・ヒット判定から除外する。
   * 今月で過去日が無い（月初当日など）場合は null。
   */
  const getPastOnlyMonthRange = (dateStart, dateEnd) => {
    const today = getTodayDateString();
    let effectiveEnd = dateEnd;
    if (effectiveEnd >= today) {
      effectiveEnd = getYesterdayDateString();
    }
    if (effectiveEnd < dateStart) {
      return null;
    }
    return { dateStart, dateEnd: effectiveEnd };
  };

  /** @param {number} monthOffset 0=今月, 1=先月, … */
  const getMonthDateRange = (monthOffset = 0) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() - monthOffset;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const dateStart = formatDateInput(start);
    const calendarEnd = formatDateInput(end);

    if (monthOffset === 0) {
      const pastOnly = getPastOnlyMonthRange(dateStart, calendarEnd);
      if (!pastOnly) {
        return {
          monthOffset,
          dateStart,
          dateEnd: dateStart,
          skipsPastSearch: true
        };
      }
      return { monthOffset, ...pastOnly };
    }

    return {
      monthOffset,
      dateStart,
      dateEnd: calendarEnd
    };
  };

  const buildMonthWindows = (maxMonths = MAX_MONTHS_DEFAULT) => {
    const n = Math.max(1, Math.min(maxMonths, MAX_MONTHS_DEFAULT));
    const windows = [];
    for (let i = 0; i < n; i += 1) {
      windows.push(getMonthDateRange(i));
    }
    return windows;
  };

  const pickRowInMonth = (rows, dateStart, dateEnd) => {
    const normalize =
      window.HugPersonalList?.normalizeListDate ||
      ((text) => String(text || "").trim());
    const today = getTodayDateString();

    const inRange = rows.filter((row) => {
      const d = row.dateNorm || normalize(row.date);
      if (!d || d === today) {
        return false;
      }
      return d >= dateStart && d <= dateEnd;
    });

    inRange.sort((a, b) => {
      const da = a.dateNorm || normalize(a.date);
      const db = b.dateNorm || normalize(b.date);
      return db.localeCompare(da);
    });

    let fallback = null;
    for (const row of inRange) {
      if (row.attendance === "出席") {
        return row;
      }
      if (!fallback) {
        fallback = row;
      }
    }
    return fallback;
  };

  const attachNoteToRow = async (row, withNotes) => {
    if (!withNotes) {
      return { ...row, note: "" };
    }

    const fetchEditData = window.HugEditPage?.fetchContactBookEditData;
    if (!fetchEditData) {
      throw new Error("HugEditPage が読み込まれていません（editpage.js）");
    }

    const { note, recordStaff } = await fetchEditData(row.editPath);
    return { ...row, note, recordStaff };
  };

  /**
   * 今月（月末〜1日）から最大6か月さかのぼり、1か月ずつ一覧取得し、
   * 1件取得できるまで繰り返す（form.js の「個人記録を取得」と同系統）。
   * 当日分はヒット対象外（過去記録用。当日は日付指定の取得ボタンを使う）。
   *
   * @returns {Promise<{
   *   record: object,
   *   records: object[],
   *   monthWindow: { monthOffset, dateStart, dateEnd },
   *   monthsAttempted: { monthOffset, dateStart, dateEnd, rowCount: number }[]
   * }>}
   */
  const fetchPersonalRecordsUntilFound = async ({
    facilityId,
    childId,
    withNotes = true,
    maxMonths = MAX_MONTHS_DEFAULT,
    onMonthAttempt
  }) => {
    const fetchList = window.HugPersonalList?.fetchPersonalRecordList;
    if (!fetchList) {
      throw new Error("personallist.js が読み込まれていません");
    }

    if (!facilityId || !childId) {
      throw new Error("施設ID・児童IDが必要です");
    }

    const monthsAttempted = [];
    const windows = buildMonthWindows(maxMonths);

    for (const window of windows) {
      const { dateStart, dateEnd, monthOffset, skipsPastSearch } = window;

      if (skipsPastSearch) {
        monthsAttempted.push({
          monthOffset,
          dateStart,
          dateEnd,
          rowCount: 0,
          skipped: true
        });
        onMonthAttempt?.({
          phase: "empty",
          monthOffset,
          dateStart,
          dateEnd,
          rowCount: 0,
          skippedTodayOnlyMonth: true
        });
        continue;
      }

      onMonthAttempt?.({
        phase: "list",
        monthOffset,
        dateStart,
        dateEnd
      });

      const rows = await fetchList({
        facilityId,
        date: dateStart,
        dateEnd,
        childId
      });

      monthsAttempted.push({
        monthOffset,
        dateStart,
        dateEnd,
        rowCount: rows.length
      });

      const row = pickRowInMonth(rows, dateStart, dateEnd);
      if (!row) {
        onMonthAttempt?.({
          phase: "empty",
          monthOffset,
          dateStart,
          dateEnd,
          rowCount: rows.length
        });
        continue;
      }

      onMonthAttempt?.({
        phase: "note",
        monthOffset,
        dateStart,
        dateEnd,
        rowCount: rows.length
      });

      const record = await attachNoteToRow(row, withNotes);

      return {
        record,
        records: [record],
        monthWindow: window,
        monthsAttempted
      };
    }

    const tried = monthsAttempted
      .map((m) => `${m.dateStart}〜${m.dateEnd}(${m.rowCount}行)`)
      .join(", ");

    throw new Error(
      `${maxMonths}か月分を取得しましたが、個人記録が1件も見つかりませんでした（${tried}）`
    );
  };

  MonthFetch.MAX_MONTHS_DEFAULT = MAX_MONTHS_DEFAULT;
  MonthFetch.formatDateInput = formatDateInput;
  MonthFetch.getMonthDateRange = getMonthDateRange;
  MonthFetch.buildMonthWindows = buildMonthWindows;
  MonthFetch.fetchPersonalRecordsUntilFound = fetchPersonalRecordsUntilFound;
})();
