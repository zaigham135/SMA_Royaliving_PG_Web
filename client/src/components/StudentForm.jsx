import React, { useState, useEffect, useCallback } from 'react'
import AlertModal from './AlertModal'
import ImageUpload from './ImageUpload'

const INITIAL_FORM_STATE = {
  name: '', 
  phone: '', 
  room: '', 
  join_date: '', 
  fee_due: 0, 
  notes: '',
  college: '', 
  section: '',
  temp_address: { street: '', city: '', state: '', pin: '' },
  perm_address: { street: '', city: '', state: '', pin: '' },
  parent: { name: '', phone: '', relation: '' },
  profileImage: null
}

const FormSection = ({ title, children }) => (
  <div className="form-section">
    <h3>{title}</h3>
    <div className="row">
      {children}
    </div>
  </div>
)

const FormField = ({ label, name, value, onChange, type = "text", placeholder, required = false }) => (
  <div>
    <label>{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
)

const StudentForm = ({ onSaved, editing, setEditing }) => {
  const [form, setForm] = useState(INITIAL_FORM_STATE)
  const [saving, setSaving] = useState(false)
  const [alertModal, setAlertModal] = useState({ 
    isOpen: false, 
    type: 'info', 
    title: '', 
    message: '', 
    onConfirm: null 
  })

  useEffect(() => {
    if (editing) {
      const normalizedJoinDate = editing.join_date ? String(editing.join_date).split('T')[0] : ''
      setForm({
        ...editing,
        join_date: normalizedJoinDate,
        college: editing.college || '',
        section: editing.section || '',
        temp_address: editing.temp_address || { street: '', city: '', state: '', pin: '' },
        perm_address: editing.perm_address || { street: '', city: '', state: '', pin: '' },
        parent: editing.parent || { name: '', phone: '', relation: '' },
        profileImage: editing.profileImage || null
      })
    } else {
      setForm(INITIAL_FORM_STATE)
    }
  }, [editing])

  const onChange = useCallback((e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [objectName, fieldName] = name.split('.')
      setForm(prev => ({
        ...prev,
        [objectName]: {
          ...prev[objectName],
          [fieldName]: value
        }
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }, [])

  const handleImageUpload = useCallback((imageData) => {
    setForm(prev => ({
      ...prev,
      profileImage: imageData
    }))
  }, [])

  const showAlert = useCallback((type, title, message, onConfirm = null) => {
    setAlertModal({ isOpen: true, type, title, message, onConfirm })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertModal({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })
  }, [])

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE)
    setEditing(null)
  }, [setEditing])

  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const formData = {
        ...form,
        temp_address: {
          street: form.temp_address?.street || '',
          city: form.temp_address?.city || '',
          state: form.temp_address?.state || '',
          pin: form.temp_address?.pin || ''
        },
        perm_address: {
          street: form.perm_address?.street || '',
          city: form.perm_address?.city || '',
          state: form.perm_address?.state || '',
          pin: form.perm_address?.pin || ''
        },
        parent: {
          name: form.parent?.name || '',
          phone: form.parent?.phone || '',
          relation: form.parent?.relation || ''
        },
        profileImage: form.profileImage
      }
      
      onSaved(formData)
      showAlert('success', 'Success!', editing ? 'Student updated successfully!' : 'Student added successfully!')
      resetForm()
    } catch (err) {
      showAlert('error', 'Error', err?.response?.data?.error || 'Error saving student')
    } finally {
      setSaving(false)
    }
  }, [form, editing, onSaved, showAlert, resetForm])

  return (
    <>
      <form onSubmit={onSubmit}>
        <FormSection title="Profile Photo">
          <div className="image-upload-wrapper">
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImageUrl={form.profileImage?.url}
              folder="pg-students-profiles"
            />
          </div>
        </FormSection>

        <FormSection title="Basic Information">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Student name"
            required
          />
          <FormField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="9876543210"
          />
          <FormField
            label="College"
            name="college"
            value={form.college}
            onChange={onChange}
            placeholder="College name"
          />
          <FormField
            label="Section"
            name="section"
            value={form.section}
            onChange={onChange}
            placeholder="Section"
          />
          <FormField
            label="Room"
            name="room"
            value={form.room}
            onChange={onChange}
            placeholder="A1"
          />
          <FormField
            label="Join Date"
            name="join_date"
            type="date"
            value={form.join_date}
            onChange={onChange}
          />
          <FormField
            label="Fee Due"
            name="fee_due"
            type="number"
            value={form.fee_due}
            onChange={onChange}
          />
          <FormField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={onChange}
            placeholder="Any notes"
          />
        </FormSection>

        <FormSection title="Temporary Address">
          <FormField
            label="Street"
            name="temp_address.street"
            value={form.temp_address.street}
            onChange={onChange}
            placeholder="Street"
          />
          <FormField
            label="City/District"
            name="temp_address.city"
            value={form.temp_address.city}
            onChange={onChange}
            placeholder="City/District"
          />
          <FormField
            label="State"
            name="temp_address.state"
            value={form.temp_address.state}
            onChange={onChange}
            placeholder="State"
          />
          <FormField
            label="PIN Code"
            name="temp_address.pin"
            value={form.temp_address.pin}
            onChange={onChange}
            placeholder="PIN Code"
          />
        </FormSection>

        <FormSection title="Permanent Address">
          <FormField
            label="Street"
            name="perm_address.street"
            value={form.perm_address.street}
            onChange={onChange}
            placeholder="Street"
          />
          <FormField
            label="City/District"
            name="perm_address.city"
            value={form.perm_address.city}
            onChange={onChange}
            placeholder="City/District"
          />
          <FormField
            label="State"
            name="perm_address.state"
            value={form.perm_address.state}
            onChange={onChange}
            placeholder="State"
          />
          <FormField
            label="PIN Code"
            name="perm_address.pin"
            value={form.perm_address.pin}
            onChange={onChange}
            placeholder="PIN Code"
          />
        </FormSection>

        <FormSection title="Parent/Guardian Details">
          <FormField
            label="Parent Name"
            name="parent.name"
            value={form.parent.name}
            onChange={onChange}
            placeholder="Parent/Guardian Name"
          />
          <FormField
            label="Parent Phone"
            name="parent.phone"
            value={form.parent.phone}
            onChange={onChange}
            placeholder="Phone"
          />
          <FormField
            label="Relation"
            name="parent.relation"
            value={form.parent.relation}
            onChange={onChange}
            placeholder="Relation"
          />
        </FormSection>

        <div className="form-actions">
          <button className="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : (editing ? 'Update Student' : 'Add Student')}
          </button>
          {editing && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <AlertModal
        isOpen={alertModal.isOpen}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => {
          if (alertModal.onConfirm) alertModal.onConfirm()
          hideAlert()
        }}
        onCancel={hideAlert}
      />
    </>
  )
}

export default StudentForm 