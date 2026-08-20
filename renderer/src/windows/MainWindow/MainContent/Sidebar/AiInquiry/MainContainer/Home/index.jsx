// renderer/src/components/Sidebar/AiInquiry/MainContainer/Home/index.jsx

import { Home as HomeIcon } from 'lucide-react'

export default function Home() {
  return (
    <section
      className="
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
      "
    >
      <header
        className="
          flex
          shrink-0
          items-center
          gap-3
          border-b
          border-gray-200
          bg-white
          px-6
          py-4
        "
      >
        <HomeIcon
          className="h-6 w-6 text-gray-700"
          aria-hidden="true"
        />

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            ホーム
          </h1>

          <p className="text-sm text-gray-500">
            AI問い合わせのホーム画面です。
          </p>
        </div>
      </header>

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          p-6
        "
      >
        <div
          className="
            rounded-xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <h2 className="text-base font-semibold text-gray-900">
            AI問い合わせ
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            左側のナビゲーションから機能を選択してください。
          </p>
        </div>
      </div>
    </section>
  )
}