import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const show = (message, options = {}) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3000,
      action: options.action,
      onUndo: options.onUndo
    }
    
    toasts.value.push(toast)
    
    if (toast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, toast.duration)
    }
    
    return id
  }

  const dismiss = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, options) => show(message, { ***REMOVED***options, type: 'success' })
  const error = (message, options) => show(message, { ***REMOVED***options, type: 'error' })
  const info = (message, options) => show(message, { ***REMOVED***options, type: 'info' })

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    info
  }
}
