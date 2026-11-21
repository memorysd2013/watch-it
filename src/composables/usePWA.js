import { ref, onMounted } from 'vue'
import { useToast } from './useToast'

export function usePWA() {
  const { info } = useToast()
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  const updateServiceWorker = ref(null)

  onMounted(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                needRefresh.value = true
                updateServiceWorker.value = () => {
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                }
                
                info('發現新版本', {
                  action: '更新',
                  duration: 0,
                  onUndo: updateServiceWorker.value
                })
              }
            })
          }
        })
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (needRefresh.value) {
          window.location.reload()
        }
      })
    }
  })

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker
  }
}
