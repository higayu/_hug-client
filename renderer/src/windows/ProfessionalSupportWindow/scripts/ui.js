// renderer/src/windows/ProfessionalSupportWindow
export function initTabs() {
  const tabView = document.getElementById("tabView");
  const tabResult = document.getElementById("tabResult");
  const webviews = document.getElementById("webviews");
  const resultView = document.getElementById("resultView");
  const setActiveTab = (active, inactive) => {
    active.classList.add("border-t-2", "border-blue-600", "bg-white", "text-blue-700");
    active.classList.remove("text-gray-600");
    inactive.classList.remove("border-t-2", "border-blue-600", "bg-white", "text-blue-700");
    inactive.classList.add("text-gray-600");
  };

  tabView.onclick = () => {
    setActiveTab(tabView, tabResult);
    webviews.style.display = "flex";
    resultView.style.display = "none";
  };

  tabResult.onclick = () => {
    setActiveTab(tabResult, tabView);
    webviews.style.display = "none";
    resultView.style.display = "block";
  };
}
