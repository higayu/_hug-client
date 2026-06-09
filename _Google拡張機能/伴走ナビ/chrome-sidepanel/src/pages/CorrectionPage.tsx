import { useState, useEffect } from "react";
import { Wand2, Save, X, RefreshCw, Check, ChevronDown, ChevronRight } from "lucide-react";
import { saveSupportRecord } from "../api";
import { buildCorrectionMessages, callAi } from "../lib/ai";
import {
  useFacilities,
  useHugChildren,
  getFacilityName,
  getChildName,
  pickValidChildId,
} from "../hooks/useFacilityChildren";
import {
  loadPrefs,
  savePrefs,
  applyCorrectionPrefs,
  mergePrefs,
} from "../lib/prefs";

const CorrectionPage = () => {
  const defaultDate = new Date().toISOString().split("T")[0];
  const correctionPrefs = applyCorrectionPrefs(loadPrefs().correction, {
    targetDate: defaultDate,
  });

  const [activeTab, setActiveTab] = useState<"simple" | "advanced">("simple");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetDate, setTargetDate] = useState(correctionPrefs.targetDate);
  const { facilities } = useFacilities();
  const [facilityId, setFacilityId] = useState<number | "">(correctionPrefs.facilityId);
  const [childId, setChildId] = useState<number | "">(correctionPrefs.childId);
  const [isCorrecting, setIsCorrecting] = useState(false);

  const { childrenList, loading: childrenLoading } = useHugChildren(facilityId, {
    date: targetDate,
    dateEnd: targetDate,
  });

  useEffect(() => {
    if (facilities.length > 0 && !facilityId) {
      setFacilityId(facilities[0].facility_id);
    }
  }, [facilities, facilityId]);

  useEffect(() => {
    setChildId((prev) => pickValidChildId(childrenList, prev));
  }, [childrenList]);

  const persistPrefs = (overrides?: Record<string, unknown>) => {
    savePrefs(
      mergePrefs(loadPrefs(), "correction", {
        facilityId: facilityId || undefined,
        childId: childId || undefined,
        targetDate,
        ...overrides,
      }),
    );
  };
  const [originalText, setOriginalText] = useState(
    "今日は公園で遊んだ。少し疲れた様子だった。",
  );
  const [correctedText, setCorrectedText] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    original: true,
    systemPrompt: true,
    additionalPrompt: true,
    corrected: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCorrect = async () => {
    if (!originalText.trim()) {
      alert("校正するテキストを入力してください");
      return;
    }

    setIsCorrecting(true);
    try {
      const result = await callAi(
        buildCorrectionMessages({ originalText, additionalPrompt }),
      );
      setCorrectedText(result);
      setIsModalOpen(true);
    } catch (err) {
      console.error("[handleCorrect]", err);
      alert(
        `AI校正に失敗しました: ${(err as Error).message}\n\nOllama が起動しているか、.env の設定を確認してください。`,
      );
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleRegister = async () => {
    const selectedFacility = getFacilityName(facilities, facilityId);
    const selectedChild = getChildName(childrenList, childId);
    const content = correctedText.trim() || originalText.trim();
    const contentSource = correctedText.trim() ? "校正後の記録" : "原文";

    if (!content) {
      alert("登録する記録内容がありません。原文を入力するか、AI校正を行ってください。");
      return;
    }

    if (
      window.confirm(
        `【登録内容の確認】\n・事業所: ${selectedFacility}\n・児童: ${selectedChild}\n・支援日: ${targetDate}\n・登録内容: ${contentSource}\n\nこの内容で記録を登録します。よろしいですか？`,
      )
    ) {
      try {
        await saveSupportRecord({
          child_id: Number(childId),
          content,
          target_date: targetDate,
        });

        alert("DBへの登録が完了しました！");
        setOriginalText("");
        setCorrectedText("");
        setIsModalOpen(false);
        persistPrefs();
      } catch (error) {
        console.error("Error saving record:", error);
        alert(`登録に失敗しました: ${(error as Error).message}`);
      }
    }
  };

  return (
    <div className="w-full">
      <header className="mb-6">
        <h1>AI校正機能（入力支援）</h1>
        <p style={{ color: "var(--text-light)" }}>
          支援記録をF-SOAIP形式などに校正します。
        </p>
      </header>

      {/* タブ切り替え（モック用） */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "0.5rem",
        }}
      >
        <button
          className="btn"
          style={{
            backgroundColor:
              activeTab === "simple" ? "var(--primary-color)" : "transparent",
            color: activeTab === "simple" ? "white" : "var(--text-main)",
          }}
          onClick={() => setActiveTab("simple")}
        >
          案1: シンプル重視
        </button>
        <button
          className="btn"
          style={{
            backgroundColor:
              activeTab === "advanced"
                ? "var(--secondary-color)"
                : "transparent",
            color: activeTab === "advanced" ? "white" : "var(--text-main)",
          }}
          onClick={() => setActiveTab("advanced")}
        >
          案2: 多機能・利便性重視
        </button>
      </div>

      <div className="card">
        <div className="responsive-flex" style={{ marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label className="label">事業所</label>
            <select
              className="input-field"
              value={facilityId}
              onChange={(e) => {
                setFacilityId(Number(e.target.value));
                persistPrefs({ facilityId: Number(e.target.value) });
              }}
            >
              {facilities.map(f => (
                <option key={f.facility_id} value={f.facility_id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">児童</label>
            {childrenLoading && (
              <p className="child-fetch-status" role="status" aria-live="polite">
                取得中…
              </p>
            )}
            <select
              className="input-field"
              value={childId}
              disabled={childrenLoading}
              onChange={(e) => {
                setChildId(Number(e.target.value));
                persistPrefs({ childId: Number(e.target.value) });
              }}
            >
              {childrenList.map(c => (
                <option key={c.child_id} value={c.child_id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">支援日</label>
            <input
              type="date"
              className="input-field"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                persistPrefs({ targetDate: e.target.value });
              }}
            />
          </div>
        </div>

        {activeTab === "simple" ? (
          /* =========================================
             案1: シンプル重視案
             ========================================= */
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                backgroundColor: "var(--bg-color)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <label className="label">
                校正の仕方の指示プロンプト（編集不可）
              </label>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-light)",
                  margin: 0,
                }}
              >
                放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
              </p>
            </div>

            <div>
              <label className="label">支援記録コメント欄に記載する文章</label>
              <textarea
                className="input-field"
                rows={6}
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="記録を入力してください..."
              />
            </div>
          </div>
        ) : (
          /* =========================================
             案2: 多機能・利便性重視案
             ========================================= */
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                backgroundColor: "var(--bg-color)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <label className="label">
                校正の仕方の指示プロンプト（編集不可）
              </label>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-light)",
                  margin: 0,
                }}
              >
                放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
              </p>
            </div>

            <div>
              <label className="label">追加プロンプト（任意）</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="例：保護者への感謝の気持ちを追加してください。"
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="label">支援記録コメント欄に記載する文章</label>
              <textarea
                className="input-field"
                rows={6}
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="記録を入力してください..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-4">
          <button className="btn btn-secondary" onClick={handleRegister}>
            <Save size={18} /> 登録する
          </button>
          <button className="btn btn-primary" onClick={handleCorrect} disabled={isCorrecting}>
            <Wand2 size={18} /> AIで校正する
          </button>
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
        >
          <div
            className="card modal-content"
            style={{
              width: "100%",
              maxWidth: "800px",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ margin: 0 }}>校正結果の確認</h2>
              <button
                className="btn btn-secondary"
                style={{ padding: "0.25rem" }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                overflowY: "auto",
                paddingRight: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {activeTab === "advanced" && (
                <>
                  <div>
                    <button
                      className="flex justify-between items-center w-full"
                      onClick={() => toggleSection("original")}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: "0.5rem" }}
                    >
                      <label className="label" style={{ cursor: "pointer", margin: 0 }}>
                        校正前、元になった文章（編集可能）
                      </label>
                      {expandedSections.original ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {expandedSections.original && (
                      <textarea
                        className="input-field"
                        rows={3}
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      backgroundColor: "var(--bg-color)",
                      padding: "1rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <button
                      className="flex justify-between items-center w-full"
                      onClick={() => toggleSection("systemPrompt")}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: expandedSections.systemPrompt ? "0.5rem" : 0 }}
                    >
                      <label className="label" style={{ cursor: "pointer", margin: 0 }}>
                        校正の仕方の指示プロンプト（編集不可）
                      </label>
                      {expandedSections.systemPrompt ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {expandedSections.systemPrompt && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-light)",
                          margin: 0,
                        }}
                      >
                        放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      className="flex justify-between items-center w-full"
                      onClick={() => toggleSection("additionalPrompt")}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: "0.5rem" }}
                    >
                      <label className="label" style={{ cursor: "pointer", margin: 0 }}>
                        校正の仕方の指示追加プロンプト（編集可能）
                      </label>
                      {expandedSections.additionalPrompt ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {expandedSections.additionalPrompt && (
                      <textarea
                        className="input-field"
                        rows={2}
                        value={additionalPrompt}
                        onChange={(e) => setAdditionalPrompt(e.target.value)}
                      />
                    )}
                  </div>
                </>
              )}

              {activeTab === "simple" && (
                <div
                  style={{
                    backgroundColor: "var(--bg-color)",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <label className="label">元になった文章</label>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>
                    {originalText}
                  </p>
                </div>
              )}

              <div>
                <button
                  className="flex justify-between items-center w-full"
                  onClick={() => toggleSection("corrected")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: "0.5rem" }}
                >
                  <label className="label" style={{ cursor: "pointer", margin: 0 }}>
                    校正後の文章（編集可能）
                  </label>
                  {expandedSections.corrected ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {expandedSections.corrected && (
                  <textarea
                    className="input-field"
                    rows={8}
                    value={correctedText}
                    onChange={(e) => setCorrectedText(e.target.value)}
                    style={{
                      backgroundColor: "var(--primary-light)",
                      borderColor: "var(--primary-color)",
                    }}
                  />
                )}
              </div>
            </div>

            <div
              className="flex justify-end gap-2 mt-4"
              style={{
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              {activeTab === "advanced" && (
                <button className="btn btn-secondary">クリア</button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                キャンセル
              </button>
              <button className="btn btn-secondary">
                <RefreshCw size={18} /> 再校正
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setOriginalText(correctedText);
                  setIsModalOpen(false);
                }}
              >
                <Check size={18} /> 反映して閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrectionPage;
