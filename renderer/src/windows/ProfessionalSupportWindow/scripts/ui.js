// renderer/src/windows/ProfessionalSupportWindow
export function initTabs() {
  const tabView = document.getElementById("tabView");
  const tabResult = document.getElementById("tabResult");
  const webviews = document.getElementById("webviews");
  const resultView = document.getElementById("resultView");

  tabView.onclick = () => {
    tabView.classList.add("active");
    tabResult.classList.remove("active");
    webviews.style.display = "flex";
    resultView.style.display = "none";
  };

  tabResult.onclick = () => {
    tabResult.classList.add("active");
    tabView.classList.remove("active");
    webviews.style.display = "none";
    resultView.style.display = "block";
  };
}
