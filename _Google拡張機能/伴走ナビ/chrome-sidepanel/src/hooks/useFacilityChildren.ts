import { useCallback, useEffect, useState } from 'react';
import { loadFacilities } from '../api';
import { fetchChildrenFromHugWm, fetchFacilitiesFromHugWm, type HugChild } from '../lib/hugWm';
import { MOCK_CHILDREN, MOCK_FACILITIES, type Facility } from '../lib/mockData';

export type Child = HugChild;

export function useFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacilities()
      .then(setFacilities)
      .finally(() => setLoading(false));
  }, []);

  return { facilities, loading };
}

export function useHugFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilitiesFromHugWm()
      .then((data) =>
        setFacilities(data.map((f) => ({ facility_id: f.facility_id, name: f.name }))),
      )
      .catch((error) => {
        console.warn('[loadHugFacilities] HUG取得に失敗したため、MOCK_FACILITIESを使用します:', error);
        setFacilities(MOCK_FACILITIES);
      })
      .finally(() => setLoading(false));
  }, []);

  return { facilities, loading };
}

export function useHugChildren(
  facilityId: number | '',
  dateRange: { date: string; dateEnd: string },
) {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!facilityId) {
      setChildrenList([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchChildrenFromHugWm({
        facilityId: Number(facilityId),
        date: dateRange.date,
        dateEnd: dateRange.dateEnd,
      });
      setChildrenList(data);
      console.log('[loadChildren] HUG WMから取得:', dateRange, data);
    } catch (error) {
      console.warn('[loadChildren] HUG取得に失敗したため、MOCK_CHILDRENを使用します:', error);
      setChildrenList(MOCK_CHILDREN[Number(facilityId)] || []);
    } finally {
      setLoading(false);
    }
  }, [facilityId, dateRange.date, dateRange.dateEnd]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { childrenList, loading, reload };
}

export function pickValidChildId(
  childrenList: Child[],
  current: number | '',
): number | '' {
  if (childrenList.length === 0) return '';
  if (current && childrenList.some((c) => c.child_id === current)) {
    return current;
  }
  return childrenList[0].child_id;
}

export function getFacilityName(facilities: Facility[], facilityId: number | '') {
  return facilities.find((f) => f.facility_id === facilityId)?.name || '';
}

export function getChildName(childrenList: Child[], childId: number | '') {
  return childrenList.find((c) => c.child_id === childId)?.name || '';
}
