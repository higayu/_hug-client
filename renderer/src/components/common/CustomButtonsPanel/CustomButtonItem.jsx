// src/components/CustomButtonsPanel/CustomButtonItem.jsx

function CustomButtonItem({ buttonConfig, onClick }) {
  return (
    <li className="m-0 p-0">
      <button
        onClick={() => onClick(buttonConfig)}
        style={{
          backgroundColor: buttonConfig.color,
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '4px',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        {buttonConfig.text}
      </button>
    </li>
  )
}

export default CustomButtonItem
