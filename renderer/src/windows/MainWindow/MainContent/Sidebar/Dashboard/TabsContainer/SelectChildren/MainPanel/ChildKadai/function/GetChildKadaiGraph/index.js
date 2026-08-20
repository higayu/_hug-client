import { getChildKadaiGraphFromLaravel } from './parts/laravel'

export function getChildKadaiGraph({ childrenId = null, recordTypeId = null } = {}) {
  return getChildKadaiGraphFromLaravel({
    children_id: childrenId,
    record_type_id: recordTypeId,
  })
}

export default getChildKadaiGraph
