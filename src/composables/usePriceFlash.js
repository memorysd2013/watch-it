import { ref } from 'vue'

const flashStates = ref(new Map())

export function usePriceFlash() {
  const flash = (id, direction) => {
    flashStates.value.set(id, direction)
    
    setTimeout(() => {
      flashStates.value.delete(id)
    }, 150)
  }

  const getFlashClass = (id) => {
    const state = flashStates.value.get(id)
    if (!state) return ''
    return state === 'up' ? 'flash-up' : 'flash-down'
  }

  return {
    flash,
    getFlashClass
  }
}
