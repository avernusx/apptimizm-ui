import { Ref, onMounted, onUnmounted, nextTick } from 'vue'

export default function useScrollPagination (
  callback: () => void,
  trigger: Ref<HTMLElement>,
  root?: Ref<HTMLElement>
) {
  const params: { threshold: number, root?: HTMLElement } = { threshold: 0 }
  
  if (root) params.root = root.value

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      callback()
    }
  }, params)
  
  onMounted(() => {
    nextTick(() => {
      observer.observe(trigger.value)
    })
  })

  onUnmounted(() => {
    observer.disconnect()
  })
}