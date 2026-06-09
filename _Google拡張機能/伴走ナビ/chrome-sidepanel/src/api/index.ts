export { getApiBase } from './config';
export { apiClient } from './client';
export { formatFetchError } from './formatFetchError';

export { login, fetchMe, type AuthSession } from './auth';
export { loadFacilities } from './facilities';
export {
  searchSupportRecords,
  saveSupportRecord,
  saveSupportRecordsBulk,
  type SupportRecordInput,
  type SupportRecordBulkResult,
} from './supportRecords';

export type { AuthUser } from '../lib/authStorage';
