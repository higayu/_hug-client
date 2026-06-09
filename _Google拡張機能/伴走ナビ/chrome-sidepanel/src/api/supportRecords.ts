import { apiClient } from './client';
import { getAuthUser } from '../lib/authStorage';
import type { SupportRecord } from '../lib/mockData';

export type SupportRecordInput = {
  child_id: number;
  target_date: string;
  content: string;
  user_id?: number;
  user_name?: string;
  facility_id?: number;
};

export type SupportRecordBulkResult = {
  created: number;
  updated: number;
  users_created?: number;
  total: number;
};

export async function searchSupportRecords(childId: number): Promise<SupportRecord[]> {
  const { data } = await apiClient.get<SupportRecord[]>('/support_records/_search', {
    params: { pk: 'child_id', values: childId },
  });
  return data;
}

export async function saveSupportRecord(record: SupportRecordInput): Promise<void> {
  await apiClient.post('/support_records', {
    ...record,
    user_id: record.user_id ?? getAuthUser()?.user_id,
  });
}

export async function saveSupportRecordsBulk(
  records: SupportRecordInput[],
): Promise<SupportRecordBulkResult> {
  const { data } = await apiClient.post<SupportRecordBulkResult>('/support_records/bulk', {
    records,
  });
  return data;
}
