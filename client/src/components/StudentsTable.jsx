import React, { memo } from 'react'

const formatId = (fullId) => {
  if (!fullId) return ''
  const s = String(fullId)
  const hexTail = s.slice(-5)
  const num = parseInt(hexTail, 16) % 100000
  return `SMA-${String(num).padStart(5, '0')}`
}

const formatDateOnly = (value) => {
  if (!value) return ''
  const str = String(value)
  return str.includes('T') ? str.split('T')[0] : str
}

const formatDisplayId = (student) => {
  return student.serial != null ? `SMA-${String(student.serial).padStart(5, '0')}` : formatId(student.id)
}

const TableRow = memo(({ student, selectedIds, onToggleSelect, onEdit, onDelete, onViewDetails }) => (
  <tr key={student.id}>
    <td className="checkbox-cell">
      <input 
        type="checkbox" 
        checked={selectedIds.has(student.id)} 
        onChange={(e) => onToggleSelect(student.id, e.target.checked)} 
      />
    </td>
    <td className="profile-cell">
      <div className="student-profile-display">
        {student.profileImage?.url ? (
          <img 
            src={student.profileImage.optimizedUrl || student.profileImage.url} 
            alt={student.name}
            className="profile-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : (
          <div className="profile-image-placeholder">
            <span>{student.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
        )}
        <div className="student-info">
          <div className="student-name">{student.name}</div>
          <div className="student-id">{formatDisplayId(student)}</div>
        </div>
      </div>
    </td>
    <td>{student.phone}</td>
    <td>{student.college}</td>
    <td>{student.room}</td>
    <td>{formatDateOnly(student.join_date)}</td>
    <td><span className="badge">₹{student.fee_due}</span></td>
    <td className="actions">
      <button onClick={() => onViewDetails(student)}>Details</button>
      <button onClick={() => onEdit(student)}>Edit</button>
      <button className="danger" onClick={() => onDelete(student.id)}>Delete</button>
    </td>
  </tr>
))

TableRow.displayName = 'TableRow'

const StudentsTable = ({ 
  rows, 
  onEdit, 
  onDelete, 
  selectedIds, 
  onToggleSelect, 
  onSelectAll, 
  onViewDetails 
}) => {
  const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id))

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th className="checkbox-cell">
              <input 
                type="checkbox" 
                onChange={(e) => onSelectAll(e.target.checked)} 
                checked={allSelected} 
              />
            </th>
            <th>Student</th>
            <th>Phone</th>
            <th>College</th>
            <th>Room</th>
            <th>Join Date</th>
            <th>Fee Due</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(student => (
            <TableRow
              key={student.id}
              student={student}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(StudentsTable) 