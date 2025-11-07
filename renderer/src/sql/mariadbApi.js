// src/api/mariadbApi.js

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from "../contexts/AppStateContext.jsx";
import { ELEMENT_IDS } from "../utils/constants.js";
import { fetchAndExtractAttendanceData } from "../store/slices/attendanceSlice.js";
import { selectExtractedData, selectAttendanceError } from "../store/slices/attendanceSlice.js"

const [childrenData, setLocalChildrenData] = useState([]);
const [waitingChildrenData, setWaitingChildrenData] = useState([]);
const [experienceChildrenData, setExperienceChildrenData] = useState([]);

export const mariadbApi = {
    async getChildrenByStaffAndDay({ staffId, date, facility_id }) {
      return await window.electronAPI.GetChildrenByStaffAndDay({
        staffId,
        date,
        facility_id
      });
    },
  
    async getStaffAndFacility() {
      return await window.electronAPI.getStaffAndFacility();
    }
  };
  