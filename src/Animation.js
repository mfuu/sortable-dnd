import { getRect, css } from './utils.js'

const CSS_TRANSITIONS = ['-webkit-transition', '-moz-transition', '-ms-transition', '-o-transition', 'transition']
const CSS_TRANSFORMS = ['-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform', 'transform']

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

      CSS_TRANSITIONS.forEach(ts => css(el, ts, 'none'))
      CSS_TRANSFORMS.forEach(tf => css(el, tf, `${tf.split('transform')[0]}translate3d(${left}px, ${top}px, 0)`))
  
      el.offsetLeft // 触发重绘
  
      CSS_TRANSITIONS.forEach(ts => css(el, ts, `${ts.split('transition')[0]}transform ${animation}ms`))
      CSS_TRANSFORMS.forEach(tf => css(el, tf, `${tf.split('transform')[0]}translate3d(0px, 0px, 0px)`))

      clearTimeout(el.animated)
      el.animated = setTimeout(() => {
        CSS_TRANSITIONS.forEach(ts => css(el, ts, ''))
        CSS_TRANSFORMS.forEach(tf => css(el, tf, ''))
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