// src/components/CustomButtonsPanel/CustomButtonItem.jsx

function CustomButtonItem({ buttonConfig, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onClick(buttonConfig)}
      style={{ backgroundColor: buttonConfig.color }}
      className="mb-1 w-full cursor-pointer rounded border-none px-3 py-2 text-white transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      {buttonConfig.text}
    </button>
  )
}

export default CustomButtonItem
