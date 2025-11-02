function Tabs() {
  return (
    <div id="tabs" className="bg-[#555] p-1 flex-none">
      <button 
        data-target="hugview" 
        className="active-tab mr-1 px-2.5 py-1 border-none cursor-pointer bg-[#777] text-black rounded font-bold shadow-sm"
      >
        Hug
      </button>
    </div>
  )
}

export default Tabs

