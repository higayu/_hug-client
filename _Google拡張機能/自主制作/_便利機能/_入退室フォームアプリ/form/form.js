(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = HA.Form || {};
  HA.renderAttendanceForm = Form.renderAttendanceForm;
  HA.createPanelIfNeeded = Form.createPanelIfNeeded;
  HA.togglePanel = Form.togglePanel;
})();
