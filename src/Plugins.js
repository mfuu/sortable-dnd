import { css, getRect, toggleClass, setTransition, setTransform } from './utils.js'

/**
 * Sortable states
 */
export class State {
  constructor() {
    this.sortableDown = undefined
    this.sortableMove = undefined
    this.animationEnd = undefined
  }
}

/**
 * Difference before and after dragging
 */
export class Differ {
  constructor() {
    this.from = { sortable: null, group: null, node: null, rect: {}, offset: {} }
    this.to = { sortable: null, group: null, node: null, rect: {}, offset: {} }
  }
  destroy() {
    this.from = { sortable: null, group: null, node: null, rect: {}, offset: {} }
    this.to = { sortable: null, group: null, node: null, rect: {}, offset: {} }
  }
}

/**
 * Elements being dragged
 */
export class Ghost {
  constructor(sortable) {
    this.el = null
    this.initPos = this.distance = { x: 0, y: 0 }
    this.options = sortable.options
    this.container = sortable.container
  }

  init(el, rect, append = true) {
    this.el = el
    if (!append) return
    const { ghostClass, ghostStyle = {} } = this.options

    toggleClass(this.el, ghostClass, true)

    css(this.el, 'box-sizing', 'border-box')
    css(this.el, 'margin', 0)
    css(this.el, 'top', rect.top)
    css(this.el, 'left', rect.left)
    css(this.el, 'width', rect.width)
    css(this.el, 'height', rect.height)
    css(this.el, 'opacity', '0.8')
    // css(this.el, 'position', IOS ? 'absolute' : 'fixed')
    css(this.el, 'position', 'fixed')
    css(this.el, 'zIndex', '100000')
		css(this.el, 'pointerEvents', 'none')

    this.setStyle(ghostStyle)

    setTransition(this.el, 'none')
    setTransform(this.el, 'translate3d(0px, 0px, 0px)')

    this.container.appendChild(this.el)

    css(this.el, 'transform-origin', (this.distance.x / parseInt(this.el.style.width) * 100) + '% ' + (this.distance.y / parseInt(this.el.style.height) * 100) + '%')
    css(this.el, 'transform', 'translateZ(0)')
  }

  setStyle(style) {
    for (const key in style) {
      css(this.el, key, style[key])
    }
  }

  rect() {
    return getRect(this.el)
  }

  move(x, y, smooth = false) {
    if (!this.el) return
    setTransition(this.el, smooth ? `${this.options.ghostAnimation}ms` : 'none')
    setTransform(this.el, `translate3d(${x - this.initPos.x}px, ${y - this.initPos.y}px, 0)`)
  }

  clear() {
    this.distance = { x: 0, y: 0 }
    this.el && this.el.remove()
    this.el = null
  }

  destroy(rect) {
    if (!this.el) return

    const left = parseInt(this.el.style.left)
    const top = parseInt(this.el.style.top)
    this.move(rect.left - left, rect.top - top, true)

    const { ghostAnimation } = this.options
    ghostAnimation ? setTimeout(() => this.clear(), ghostAnimation) : this.clear()
  }
}