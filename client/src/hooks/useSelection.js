import { useState, useCallback, useMemo } from 'react'

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState(new Set())

  const toggleSelection = useCallback((id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((checked, items) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) {
        items.forEach(item => next.add(item.id))
      } else {
        items.forEach(item => next.delete(item.id))
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((id) => {
    return selectedIds.has(id)
  }, [selectedIds])

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  const selectedItems = useMemo(() => Array.from(selectedIds), [selectedIds])

  const isAllSelected = useCallback((items) => {
    return items.length > 0 && items.every(item => selectedIds.has(item.id))
  }, [selectedIds])

  const isPartiallySelected = useCallback((items) => {
    const selectedInItems = items.filter(item => selectedIds.has(item.id))
    return selectedInItems.length > 0 && selectedInItems.length < items.length
  }, [selectedIds])

  return {
    selectedIds,
    selectedCount,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isPartiallySelected
  }
} 