export const formatDateOnly = (value) => {
  if (!value) return ''
  const str = String(value)
  return str.includes('T') ? str.split('T')[0] : str
}

export const formatAddress = (address) => {
  if (!address) return 'Not provided'
  const parts = [address.street, address.city, address.state, address.pin].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Not provided'
}

export const formatDisplayId = (student) => {
  if (!student) return ''
  return student.serial != null ? `SMA-${String(student.serial).padStart(5, '0')}` : formatIdFromMongoId(student.id)
}

export const formatIdFromMongoId = (fullId) => {
  if (!fullId) return ''
  const s = String(fullId)
  const hexTail = s.slice(-5)
  const num = parseInt(hexTail, 16) % 100000
  return `SMA-${String(num).padStart(5, '0')}`
}

export const formatCurrency = (amount) => {
  return `₹${amount || 0}`
}

export const formatPhone = (phone) => {
  if (!phone) return 'Not provided'
  return phone
}

export const formatName = (name) => {
  if (!name) return 'Not provided'
  return name
}

export const formatCollege = (college) => {
  if (!college) return 'Not provided'
  return college
}

export const formatSection = (section) => {
  if (!section) return 'Not provided'
  return section
}

export const formatRoom = (room) => {
  if (!room) return 'Not provided'
  return room
}

export const formatNotes = (notes) => {
  if (!notes) return 'No notes'
  return notes
} 