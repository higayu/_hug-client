// renderer/src/components/Sidebar/AiInquiry/MainContainer/Search/index.jsx

import {
  Search as SearchIcon,
} from 'lucide-react'

export default function Search() {
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
        <SearchIcon
          className="h-6 w-6 text-gray-700"
          aria-hidden="true"
        />

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            検索
          </h1>

          <p className="text-sm text-gray-500">
            過去の問い合わせを検索します。
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
          <label
            htmlFor="ai-inquiry-search"
            className="
              block
              text-sm
              font-medium
              text-gray-700
            "
          >
            キーワード
          </label>

          <div className="relative mt-2">
            <SearchIcon
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-gray-400
              "
              aria-hidden="true"
            />

            <input
              id="ai-inquiry-search"
              type="search"
              placeholder="問い合わせを検索"
              className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                py-2.5
                pl-10
                pr-4
                text-sm
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            検索機能は今後実装予定です。
          </p>
        </div>
      </div>
    </section>
  )
}