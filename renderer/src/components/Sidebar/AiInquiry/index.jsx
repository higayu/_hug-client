import VerticalNav from "./VerticalNav";
import MainContainer from "./MainContainer";

/**
 * 縦型ナビ付きの汎用コンテナ。
 * 高さ・枠線・角丸・選択状態などは利用側から指定します。
 */
export default function AiInquiry({
  className = "",
  contentClassName = "",
  navProps = {},
}) {
  return (
    <div className={`flex min-h-0 w-full overflow-hidden bg-white ${className}`}>
      <VerticalNav {...navProps} />

      <main className={`min-w-0 flex-1 overflow-auto ${contentClassName}`}>
        <MainContainer />
      </main>
    </div>
  );
}