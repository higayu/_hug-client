(async () => {

  const SELECT_CHILLED = 99; // 92;



  const DATE = "2025-06-01";

  const DATE_END = "2026-05-30";

  const FACILITY_ID = 3;



  const listParams = {

    facilityId: FACILITY_ID,

    date: DATE,

    dateEnd: DATE_END,

    childId: SELECT_CHILLED

  };



  try {

    const probeUrl = buildContactBookListUrl(listParams);

    const probeDoc = await fetchContactBookListDoc(probeUrl);

    const pages = getContactBookPageNumbers(probeDoc);



    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log("[HUG WM] page 処理開始:", page);

      const listUrl = buildContactBookListUrl({ ...listParams, page });
      const listDoc =
        i === 0 ? probeDoc : await fetchContactBookListDoc(listUrl);

     // console.log(`[HUG WM] listDoc:i[${i}]:`, listDoc);
      await processContactBookTableFromDoc(listDoc);
    }

  } catch (error) {

    console.error("[HUG WM] エラー:", error);

  }

})();

