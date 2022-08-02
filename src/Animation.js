import { getRect, setTransition, setTransform } from './utils.js'

export default function Animation() {
  
  const animationState = []

  function getRange(children, drag, drop) {
    const start = children.indexOf(drag)
    const end = children.indexOf(drop)
    return start < end ? { start, end } : { start: end, end: start }
  }

  return {

    _captureAnimationState() {
      const children = [...Array.from(this.rootEl.children)]
      const { start, end } = getRange(children, this.dragEl, this.dropEl)

      animationState.length = 0 // reset

      children.slice(start, end + 1).forEach(child => {
        animationState.push({
          target: child,
          rect: getRect(child)
        })
      })
    },

    _rangeAnimate() {
      animationState.forEach(state => {
        const { target, rect } = state
        this._animate(target, rect, this.options.animation)
      })
    },

    _animate(el, preRect, animation = 150) {
      const curRect = getRect(el)
      const left = preRect.left - curRect.left
      const top = preRect.top - curRect.top

      setTransition(el, 'none')
      setTransform(el, `translate3d(${left}px, ${top}px, 0)`)
  
      el.offsetWidth // trigger repaint
  
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
