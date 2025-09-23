import { ref, watch, onMounted, onUnmounted } from 'vue'

export const useTypewriter = (source: () => string, options: { 
  typeSpeed?: number
  deleteSpeed?: number 
} = {}) => {
  const { typeSpeed = 60, deleteSpeed = 10 } = options
  const displayedText = ref('')
  let interval: number | null = null

  const clear = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  const type = (text: string) => {
    clear()
    let i = 0
    interval = setInterval(() => {
      if (i < text.length) {
        displayedText.value += text[i++]
      } else {
        clear()
      }
    }, typeSpeed) as unknown as number
  }

  const del = (callback?: () => void) => {
    clear()
    interval = setInterval(() => {
      if (displayedText.value.length > 0) {
        displayedText.value = displayedText.value.slice(0, -1)
      } else {
        clear()
        callback?.()
      }
    }, deleteSpeed) as unknown as number
  }

  const update = (newText: string) => {
    if (newText === '') {
      del()
    } else if (displayedText.value === '') {
      type(newText)
    } else {
      del(() => type(newText))
    }
  }

  onMounted(() => update(source()))

  watch(source, (newVal) => update(newVal))

  onUnmounted(clear)

  return { displayedText }
}