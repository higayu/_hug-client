// renderer/src/components/Sidebar/AiInquiry/MainContainer/Profile/index.jsx

import {
  User,
} from 'lucide-react'

export default function Profile() {
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
        <User
          className="h-6 w-6 text-gray-700"
          aria-hidden="true"
        />

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            プロフィール
          </h1>

          <p className="text-sm text-gray-500">
            ユーザー情報を確認します。
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
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-100
              "
            >
              <User
                className="h-7 w-7 text-gray-500"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                ユーザー
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                プロフィール情報は今後実装予定です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}