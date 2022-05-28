import { getRect, setTransition, setTransform } from './utils.js'

export default function Animation() {
  
  const animationState = []

  function getRange(children, drag, drop) {
    const start = children.indexOf(drag)
    const end = children.indexOf(drop)
    return start < end ? { start, end } : { start: end, end: start }
  }

  return {

    captureAnimationState() {
      const children = [...Array.from(this.rootEl.children)]
      const { start, end } = getRange(children, this.dragEl, this.dropEl)

      animationState.length = 0 // 重置

      children.slice(start, end + 1).forEach(child => {
        animationState.push({
          target: child,
          rect: getRect(child)
        })
      })
    },

    animateRange() {
      animationState.forEach(state => {
        const { target, rect } = state
        this.animate(target, rect, this.options.animation)
      })
    },

    animate(el, preRect, animation = 150) {
      const curRect = getRect(el)
      const left = preRect.left - curRect.left
      const top = preRect.top - curRect.top

      setTransition(el, 'none')
      setTransform(el, `translate3d(${left}px, ${top}px, 0)`)
  
      el.offsetLeft // 触发重绘
  
      setTransition(el, `${animation}ms`)
      setTransform(el, 'translate3d(0px, 0px, 0px)')

      clearTimeout(el.animated)
      el.animated = setTimeout(() => {
        setTransition(el, '')
        setTransform(el, '')
        el.animated = null
      }, animation)
    }
  }
}
