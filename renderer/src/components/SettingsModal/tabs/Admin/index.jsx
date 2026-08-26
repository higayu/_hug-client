import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useAppState } from '@/AppStateContext'
import { selectLaravelAuth } from '@/store/slices/authSlice'

import Base from './Base'
import Login from './Login'

export default function AdminTab() {
  const auth = useSelector(selectLaravelAuth)
  const isAdmin = Number(auth.user?.role_id) === 1
  const authenticatedStaffId = auth.user?.staff_id
  const { databaseState } = useAppState()
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [activeSection, setActiveSection] = useState('base')

  const editableStaffs = useMemo(() => {
    const staffs = Array.isArray(databaseState?.staffs)
      ? databaseState.staffs
      : []

    return staffs.filter(
      (staff) =>
        String(staff?.id) !== String(authenticatedStaffId),
    )
  }, [databaseState?.staffs, authenticatedStaffId])

  useEffect(() => {
    if (
      editableStaffs.some(
        (staff) => String(staff.id) === String(selectedStaffId),
      )
    ) {
      return
    }

    setSelectedStaffId(
      editableStaffs[0]?.id == null
        ? ''
        : String(editableStaffs[0].id),
    )
  }, [editableStaffs, selectedStaffId])

  const selectedStaff = editableStaffs.find(
    (staff) => String(staff.id) === String(selectedStaffId),
  ) ?? null

  if (!isAdmin) {
    return null
  }

  return (
    <div>
      <div className="mb-5">
        <label
          htmlFor="admin-staff-select"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          編集する職員
        </label>

        <select
          id="admin-staff-select"
          value={selectedStaffId}
          onChange={(event) => setSelectedStaffId(event.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {editableStaffs.length === 0 && (
            <option value="">編集できる職員がいません</option>
          )}

          {editableStaffs.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name || `職員ID: ${staff.id}`}
            </option>
          ))}
        </select>
      </div>

      {selectedStaffId && (
        <>
          <div className="mb-5 flex gap-2 border-b border-gray-200">
            {[
              ['base', '基本情報'],
              ['login', 'ログイン情報'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeSection === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeSection === 'base' ? (
            <Base staffId={selectedStaffId} />
          ) : (
            <Login staff={selectedStaff} />
          )}
        </>
      )}
    </div>
  )
}
