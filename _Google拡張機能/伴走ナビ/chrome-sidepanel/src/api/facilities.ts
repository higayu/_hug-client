import { apiClient } from './client';
import { MOCK_FACILITIES, type Facility } from '../lib/mockData';

export async function loadFacilities(): Promise<Facility[]> {
  try {
    const { data } = await apiClient.get<Facility[]>('/facilities');
    console.log('[loadFacilities] APIから取得した事業所データ:', data);
    return data;
  } catch (error) {
    console.warn('[loadFacilities] API取得に失敗したため、MOCK_FACILITIESを使用します:', error);
    return MOCK_FACILITIES;
  }
}
