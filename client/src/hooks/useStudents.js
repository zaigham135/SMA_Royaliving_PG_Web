import { useState, useCallback, useMemo } from 'react'
import { api } from '../api'

export const useStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/students')
  // Normalize students: ensure each has a string `id` property (use `_id` when present)
  const normalized = (data || []).map(s => ({ ...s, id: String(s._id ?? s.id ?? '') }))
  setStudents(normalized)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load students')
      console.error('Error loading students:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addStudent = useCallback(async (studentData) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.post('/students', studentData)
  const s = { ...data, id: String(data._id ?? data.id ?? '') }
  setStudents(prev => [s, ...prev])
      return data
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add student')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStudent = useCallback(async (id, studentData) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.put(`/students/${id}`, studentData)
      const normalized = { ...data, id: String(data._id ?? data.id ?? '') }
      setStudents(prev => {
        const index = prev.findIndex(s => s.id === id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = normalized
          return updated
        }
        return prev
      })
      return data
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update student')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteStudent = useCallback(async (id) => {
    try {
      setLoading(true)
      setError(null)
      await api.delete(`/students/${id}`)
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete student')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteStudents = useCallback(async (ids) => {
    try {
      setLoading(true)
      setError(null)
      await api.post('/students/bulk-delete', { ids })
  // ids may be ObjectId strings; compare as strings
  const idSet = new Set((ids || []).map(String))
  setStudents(prev => prev.filter(s => !idSet.has(String(s.id))))
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete students')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addSampleData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await api.post('/seed')
      await loadStudents()
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add sample data')
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadStudents])

  const exportExcel = useCallback(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    window.location.href = `${API_URL}/api/export`
  }, [])

  const getStudentById = useCallback((id) => {
  return students.find(s => String(s.id) === String(id))
  }, [students])

  const studentsCount = useMemo(() => students.length, [students])

  return {
    students,
    loading,
    error,
    studentsCount,
    loadStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkDeleteStudents,
    addSampleData,
    exportExcel,
    getStudentById
  }
} 