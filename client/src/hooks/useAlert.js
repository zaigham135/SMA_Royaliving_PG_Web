import { useState, useCallback } from 'react'

export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  })

  const showAlert = useCallback((type, title, message, onConfirm = null, onCancel = null) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const showSuccess = useCallback((title, message, onConfirm = null) => {
    showAlert('success', title, message, onConfirm)
  }, [showAlert])

  const showError = useCallback((title, message, onConfirm = null) => {
    showAlert('error', title, message, onConfirm)
  }, [showAlert])

  const showWarning = useCallback((title, message, onConfirm = null, onCancel = null) => {
    showAlert('warning', title, message, onConfirm, onCancel)
  }, [showAlert])

  const showInfo = useCallback((title, message, onConfirm = null) => {
    showAlert('info', title, message, onConfirm)
  }, [showAlert])

  const confirmAction = useCallback((title, message, onConfirm, onCancel = null) => {
    showAlert('warning', title, message, onConfirm, onCancel)
  }, [showAlert])

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmAction
  }
} 