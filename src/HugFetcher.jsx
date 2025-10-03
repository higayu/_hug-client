import React, { useEffect, useState } from "react";

function HugFetcher() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await window.hugAPI.fetchPage();
      setHtml(data);
    };
    load();
  }, []);

  return (
    <div>
      <h1>Hug ページ (ログイン後)</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default HugFetcher;
