import { css, getRect, toggleClass, setTransition, setTransform } from './utils.js'
import { IOS } from './Brower.js'

export class State {
  constructor() {
    this.sortableDown = undefined
    this.sortableMove = undefined
    this.animationEnd = undefined
  }
}

/**
 * 拖拽前后差异初始化
 */
export class Differ {
  constructor() {
    this.from = { node: null, rect: {}, offset: {} }
    this.to = { node: null, rect: {}, offset: {} }
  }
  get(key) {
    return this[key]
  }
  set(key, value) {
    this[key] = value
  }
  destroy() {
    this.from = { node: null, rect: {}, offset: {} }
    this.to = { node: null, rect: {}, offset: {} }
  }
}

/**
 * 拖拽中的元素
 */
export class Ghost {
  constructor(sortable) {
    this.$el = null
    this.distance = { x: 0, y: 0 }
    this.options = sortable.options
    this.container = sortable.container
  }

  init(el, rect) {
    this.$el = el
    const { ghostClass, ghostStyle = {} } = this.options

    toggleClass(this.$el, ghostClass, true)

    css(this.$el, 'box-sizing', 'border-box')
    css(this.$el, 'margin', 0)
    css(this.$el, 'top', rect.top)
    css(this.$el, 'left', rect.left)
    css(this.$el, 'width', rect.width)
    css(this.$el, 'height', rect.height)
    css(this.$el, 'opacity', '0.8')
    // css(this.$el, 'position', IOS ? 'absolute' : 'fixed')
    css(this.$el, 'position', 'fixed')
    css(this.$el, 'zIndex', '100000')
		css(this.$el, 'pointerEvents', 'none')

    this.setStyle(ghostStyle)

    setTransition(this.$el, 'none')
    setTransform(this.$el, 'translate3d(0px, 0px, 0px)')

    this.container.appendChild(this.$el)

    css(this.$el, 'transform-origin', (this.distance.x / parseInt(this.$el.style.width) * 100) + '% ' + (this.distance.y / parseInt(this.$el.style.height) * 100) + '%')
  }

  setStyle(style) {
    for (const key in style) {
      css(this.$el, key, style[key])
    }
  }

  rect() {
    return getRect(this.$el)
  }

  move(x, y, smooth = false) {
    if (!this.$el) return
    setTransition(this.$el, smooth ? `${this.options.ghostAnimation}ms` : 'none')
    setTransform(this.$el, `translate3d(${x}px, ${y}px, 0)`)
  }

  destroy(rect) {
    const left = parseInt(this.$el.style.left)
    const top = parseInt(this.$el.style.top)
    this.move(rect.left - left, rect.top - top, true)
    const { ghostAnimation } = this.options
    ghostAnimation ? setTimeout(() => this.clear(), ghostAnimation) : this.clear()
  }

  clear() {
    this.$el && this.$el.remove()
    this.distance = { x: 0, y: 0 }
    this.$el = null
  }
}