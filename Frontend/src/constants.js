// Constants for the Facilities & Assets Catalogue
// These match the backend enum values exactly

export const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall', icon: '🏛️', color: '#6366f1', unit: 'seats' },
  { value: 'LAB', label: 'Laboratory', icon: '🔬', color: '#06b6d4', unit: 'seats' },
  { value: 'MEETING_ROOM', label: 'Meeting Room', icon: '🤝', color: '#8b5cf6', unit: 'seats' },
  { value: 'PROJECTOR', label: 'Projector', icon: '📽️', color: '#f59e0b', unit: 'units' },
  { value: 'CAMERA', label: 'Camera', icon: '📷', color: '#ec4899', unit: 'units' },
  { value: 'EQUIPMENT', label: 'Equipment', icon: '🔧', color: '#10b981', unit: 'units' },
]

export const STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: '#10b981' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service', color: '#ef4444' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: '#f59e0b' },
]

export const FACULTIES = [
  { value: 'Faculty of Computing', label: 'Faculty of Computing' },
  { value: 'Faculty of Engineering', label: 'Faculty of Engineering' },
  { value: 'Faculty of Business', label: 'Faculty of Business' },
  { value: 'Faculty of Humanities and Science', label: 'Humanities & Sciences' },
]

export const getTypeInfo = (type) =>
  RESOURCE_TYPES.find((t) => t.value === type) || {
    value: type,
    label: type,
    icon: '📦',
    color: '#64748b',
  }

export const getStatusInfo = (status) =>
  STATUSES.find((s) => s.value === status) || {
    value: status,
    label: status,
    color: '#64748b',
  }

export const getUnitLabel = (type, capacity) => {
  const info = getTypeInfo(type);
  if (info.unit === 'seats') {
    return capacity === 1 ? 'seat' : 'seats';
  }
  return capacity === 1 ? 'unit' : 'units';
}
