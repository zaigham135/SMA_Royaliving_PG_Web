import React from 'react'

const AlertModal = ({ isOpen, type, title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel" }) => {
  if (!isOpen) return null

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    }
    return icons[type] || icons.info
  }

  const getColors = () => {
    const colors = {
      success: {
        bg: 'linear-gradient(135deg, #10b981, #059669)',
        icon: '#ffffff'
      },
      error: {
        bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
        icon: '#ffffff'
      },
      warning: {
        bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        icon: '#ffffff'
      },
      info: {
        bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        icon: '#ffffff'
      }
    }
    return colors[type] || colors.info
  }

  const colors = getColors()

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="alert-modal" onClick={e => e.stopPropagation()}>
        <div className="alert-header" style={{ background: colors.bg }}>
          <div className="alert-icon" style={{ color: colors.icon }}>
            {getIcon()}
          </div>
          <h3>{title}</h3>
        </div>
        <div className="alert-body">
          <p>{message}</p>
        </div>
        <div className="alert-actions">
          {onCancel && (
            <button className="alert-btn secondary" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className="alert-btn primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal 