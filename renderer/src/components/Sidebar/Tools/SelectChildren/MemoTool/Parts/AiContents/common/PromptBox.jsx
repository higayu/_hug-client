import React, { useState } from "react";
import PersonalRecordPrompt from "./PersonalRecordPrompt";
import ProfessionalPrompt from "./ProfessionalPrompt";

export default function PromptBox() {
  const [active, setActive] = useState("personal"); // personal | professional

  return (
    <div className="flex flex-col gap-4 p-3 w-full">

      {/* 切替ボタン */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${
            active === "personal"
              ? "bg-sky-400 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActive("personal")}
        >
          個人
        </button>

        <button
          className={`px-3 py-1 rounded ${
            active === "professional"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActive("professional")}
        >
          専門的支援
        </button>
      </div>

      {/* 表示切替 */}
      {active === "personal" && <PersonalRecordPrompt />}
      {active === "professional" && <ProfessionalPrompt />}
    </div>
  );
}
