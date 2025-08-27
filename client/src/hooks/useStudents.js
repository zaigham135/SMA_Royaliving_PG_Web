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
      setStudents(data)
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
      setStudents(prev => [data, ...prev])
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
      setStudents(prev => {
        const index = prev.findIndex(s => s.id === id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = data
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
      setStudents(prev => prev.filter(s => !ids.includes(s.id)))
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
    return students.find(s => s.id === id)
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