import React from 'react'

const formatDateOnly = (value) => {
  if (!value) return ''
  const str = String(value)
  return str.includes('T') ? str.split('T')[0] : str
}

const formatAddress = (address) => {
  if (!address) return 'Not provided'
  const parts = [address.street, address.city, address.state, address.pin].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Not provided'
}

const formatDisplayId = (student) => {
  return student.serial != null ? `SMA-${String(student.serial).padStart(5, '0')}` : student.id
}

const DetailRow = ({ label, value, fallback = 'Not provided' }) => (
  <div className="detail-row">
    {label && <span className="detail-label">{label}:</span>}
    <span className="detail-value">{value || fallback}</span>
  </div>
)

const DetailSection = ({ title, children }) => (
  <div className="detail-section">
    <h3>{title}</h3>
    {children}
  </div>
)

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Student Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* Profile Section */}
          <div className="student-profile-section">
            {student.profileImage?.url ? (
              <img 
                src={student.profileImage.optimizedUrl || student.profileImage.url} 
                alt="Profile" 
                className="student-profile-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
            ) : (
              <div className="student-profile-image-placeholder">
                <span>📷</span>
              </div>
            )}
            <h3 className="student-profile-name">{student.name}</h3>
            <p className="student-profile-id">{formatDisplayId(student)}</p>
          </div>

          <div className="details-grid">
            <DetailSection title="Basic Information">
              <DetailRow label="ID" value={formatDisplayId(student)} />
              <DetailRow label="Name" value={student.name} />
              <DetailRow label="Phone" value={student.phone} />
              <DetailRow label="College" value={student.college} />
              <DetailRow label="Section" value={student.section} />
              <DetailRow label="Room" value={student.room} />
              <DetailRow label="Join Date" value={formatDateOnly(student.join_date)} />
              <DetailRow label="Fee Due" value={`₹${student.fee_due || 0}`} />
              <DetailRow label="Notes" value={student.notes} fallback="No notes" />
            </DetailSection>

            <DetailSection title="Temporary Address">
              <DetailRow value={formatAddress(student.temp_address)} />
            </DetailSection>

            <DetailSection title="Permanent Address">
              <DetailRow value={formatAddress(student.perm_address)} />
            </DetailSection>

            <DetailSection title="Parent/Guardian Details">
              <DetailRow label="Name" value={student.parent?.name} />
              <DetailRow label="Phone" value={student.parent?.phone} />
              <DetailRow label="Relation" value={student.parent?.relation} />
            </DetailSection>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailsModal 