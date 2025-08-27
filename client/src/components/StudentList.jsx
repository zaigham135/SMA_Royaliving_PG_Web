import React, { useEffect, useMemo, useState } from 'react'
import logo from '../image/logo.jpg'
import StudentsTable from './StudentsTable'
import StudentDetailsModal from './StudentDetailsModal'
import StudentForm from './StudentForm'
import AlertModal from './AlertModal'
import { useStudents } from '../hooks/useStudents'
import { useAlert } from '../hooks/useAlert'
import { useSelection } from '../hooks/useSelection'

const StudentList = () => {
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, student: null })
  const [showEditForm, setShowEditForm] = useState(false)

  const {
    students,
    loading,
    error,
    loadStudents,
    updateStudent,
    deleteStudent,
    bulkDeleteStudents,
    addSampleData,
    exportExcel
  } = useStudents()

  const {
    alertState,
    showSuccess,
    showError,
    showWarning,
    hideAlert
  } = useAlert()

  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection
  } = useSelection()

  // Load students on component mount
  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    const searchTerm = filter.trim().toLowerCase()
    if (!searchTerm) return students

    return students.filter(student =>
      String(student.name).toLowerCase().includes(searchTerm) ||
      String(student.phone).toLowerCase().includes(searchTerm) ||
      String(student.room).toLowerCase().includes(searchTerm) ||
      String(student.notes).toLowerCase().includes(searchTerm) ||
      String(student.college).toLowerCase().includes(searchTerm)
    )
  }, [students, filter])

  // Handle student update
  const handleStudentUpdate = async (studentData) => {
    try {
      if (editing?.id) {
        await updateStudent(editing.id, studentData)
      }
      showSuccess('Success!', 'Student updated successfully!')
      setEditing(null)
    } catch (err) {
      showError('Error', err?.response?.data?.error || 'Error updating student')
    }
  }

  // Handle student delete
  const handleStudentDelete = (id) => {
    showWarning(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
      async () => {
        try {
          await deleteStudent(id)
          showSuccess('Success!', 'Student deleted successfully!')
        } catch (err) {
          showError('Error', 'Failed to delete student')
        }
      }
    )
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedCount === 0) return

    showWarning(
      'Confirm Bulk Delete',
      `Are you sure you want to delete ${selectedCount} selected student(s)?`,
      async () => {
        try {
          await bulkDeleteStudents(Array.from(selectedIds))
          clearSelection()
          showSuccess('Success!', `${selectedCount} student(s) deleted successfully!`)
        } catch (err) {
          showError('Error', err?.response?.data?.error || 'Bulk delete failed')
        }
      }
    )
  }

  // Handle sample data addition
  const handleAddSampleData = async () => {
    try {
      await addSampleData()
      showSuccess('Success!', 'Sample data added successfully!')
    } catch (err) {
      showError('Error', 'Failed to add sample data')
    }
  }

  // Handle view details
  const handleViewDetails = (student) => {
    setDetailsModal({ isOpen: true, student })
  }

  const handleEditClick = (student) => {
    setEditing(student)
    setShowEditForm(true)
  }

  const handleEditSaved = async (data) => {
    try {
      if (editing?.id) await updateStudent(editing.id, data)
      showSuccess('Success!', 'Student updated successfully!')
      setShowEditForm(false)
      setEditing(null)
    } catch (err) {
      showError('Error', err?.response?.data?.error || 'Failed to update student')
    }
  }

  // Handle close details modal
  const handleCloseDetails = () => {
    setDetailsModal({ isOpen: false, student: null })
  }

  // Handle table selection
  const handleSelectAll = (checked) => {
    selectAll(checked, filteredStudents)
  }

  // Handle table row selection
  const handleToggleSelection = (id, checked) => {
    toggleSelection(id, checked)
  }

  // Show error if any
  useEffect(() => {
    if (error) {
      showError('Error', error)
    }
  }, [error, showError])

  return (
    <div className="container">
      {/* Header */}
      {/* <div className="header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <h1>PG Student Management</h1>
      </div> */}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search name/phone/room/notes/college..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <div className="toolbar-actions">
          <button onClick={exportExcel} className="primary">
            Export Excel
          </button>
          <button onClick={handleAddSampleData} disabled={loading}>
            Add Sample
          </button>
          <button 
            onClick={handleBulkDelete} 
            disabled={selectedCount === 0 || loading}
            className="danger"
          >
            Delete Selected ({selectedCount})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      {/* Students Table */}
      <StudentsTable
        rows={filteredStudents}
        onEdit={setEditing}
        onDelete={handleStudentDelete}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelection}
        onSelectAll={handleSelectAll}
        onViewDetails={handleViewDetails}
        onEditClick={handleEditClick}
      />

      {showEditForm && (
        <div className="edit-modal">
          <div className="modal-inner">
            <button className="close-edit" onClick={() => { setShowEditForm(false); setEditing(null) }}>&times;</button>
            <StudentForm onSaved={handleEditSaved} editing={editing} setEditing={setEditing} />
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={detailsModal.student}
        isOpen={detailsModal.isOpen}
        onClose={handleCloseDetails}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onConfirm={() => {
          if (alertState.onConfirm) alertState.onConfirm()
          hideAlert()
        }}
        onCancel={hideAlert}
      />
    </div>
  )
}

export default StudentList 