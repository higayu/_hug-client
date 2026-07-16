// renderer/src/components/Sidebar/AiInquiry/MainContainer/Create/index.jsx

import {
  PlusCircle,
  Send,
} from 'lucide-react'

export default function Create() {
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
        <PlusCircle
          className="h-6 w-6 text-gray-700"
          aria-hidden="true"
        />

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            作成
          </h1>

          <p className="text-sm text-gray-500">
            新しいAI問い合わせを作成します。
          </p>
        </div>
      </header>

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          p-6
        "
      >
        <div
          className="
            flex
            min-h-0
            flex-1
            flex-col
            rounded-xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >
          <label
            htmlFor="ai-inquiry-message"
            className="
              text-sm
              font-medium
              text-gray-700
            "
          >
            問い合わせ内容
          </label>

          <textarea
            id="ai-inquiry-message"
            placeholder="AIへの問い合わせを入力してください"
            className="
              mt-2
              min-h-[200px]
              flex-1
              resize-none
              rounded-lg
              border
              border-gray-300
              p-4
              text-sm
              leading-6
              text-gray-900
              outline-none
              transition
              placeholder:text-gray-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition-colors
                hover:bg-blue-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-blue-500
                focus-visible:ring-offset-2
              "
            >
              <Send
                className="h-4 w-4"
                aria-hidden="true"
              />

              送信
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}