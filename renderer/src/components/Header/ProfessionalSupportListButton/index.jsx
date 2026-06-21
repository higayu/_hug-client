import { useTabs } from '@/hooks/useTabs'

export default function ProfessionalSupportListButton() {
  const { addProfessionalSupportListTab } = useTabs()

  return (
    <button
      id="professional-support"
      onClick={addProfessionalSupportListTab}
      className="rounded-lg block text-left border-none bg-[#f8461f] text-white px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
    >
      専門的支援-一覧
    </button>
  )
}