(() => {
  const HA = (window.HugAttendance = window.HugAttendance || {});
  const Form = (HA.Form = HA.Form || {});
  let lastAttendanceListSnapshot = [];
  Form.getLastSnapshot = () => lastAttendanceListSnapshot;
  Form.setLastSnapshot = (list) => {
    lastAttendanceListSnapshot = list;
  };
})();
