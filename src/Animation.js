import { getRect, css } from './utils.js'

export default function Animation() {
  
  const animationState = []

  return {

    captureAnimationState() {
      const children = [...Array.from(this.$el.children)]
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
        this.animate(target, rect, this.animation)
      })
    },

    animate(el, preRect, animation = 150) {
      const curRect = getRect(el)
      const left = preRect.left - curRect.left
      const top = preRect.top - curRect.top
      
      css(el, 'transition', 'none')
      css(el, 'transform', `translate3d(${left}px, ${top}px, 0)`)
  
      el.offsetLeft // 触发重绘
  
      css(el, 'transition', `all ${animation}ms`)
      css(el, 'transform', 'translate3d(0px, 0px, 0px)')
      clearTimeout(el.animated)
      el.animated = setTimeout(() => {
        css(el, 'transition', '')
        css(el, 'transform', '')
        el.animated = null
      }, animation)
    }
  }
}

function getRange(children, drag, drop) {
  const start = children.indexOf(drag)
  const end = children.indexOf(drop)
  return start< end ? { start, end } : { start: end, end: start }
}