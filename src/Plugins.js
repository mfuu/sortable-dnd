import { css, getRect, setTransition, setTransform } from './utils.js'

export class State {
  constructor() {
    this.sortableDown = false
    this.sortableMove = false
    this.animationEnd = false
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
  constructor(options) {
    this.options = options
    this.diff = { x: 0, y: 0 }
    this.position = { x: 0, y: 0 }

    this.exist = false
  }

  init(el, rect) {
    if (this.$el) this.$el.remove()
    if (!el) return
    this.$el = el
    const { ghostClass, ghostStyle = {} } = this.options
    const { width, height } = rect
    
    this.$el.class = ghostClass
    this.$el.style.width = width + 'px'
    this.$el.style.height = height + 'px'
    this.$el.style.position = 'fixed'
    this.$el.style.left = 0
    this.$el.style.top = 0
    this.$el.style.zIndex = 100000
    this.$el.style.opacity = 0.8
    this.$el.style.pointerEvents = 'none'
    this.$el.style.cursor = 'move'

    setTransition(this.$el, 'none')
    setTransform(this.$el, 'translate3d(0px, 0px, 0px)')

    this.setStyle(ghostStyle)
  }

  setPosition(x, y) {
    this.position = {
      x: x - this.diff.x,
      y: y - this.diff.y
    }
  }

  setStyle(style) {
    for (const key in style) {
      css(this.$el, key, style[key])
    }
  }

  rect() {
    return getRect(this.$el)
  }

  move(smooth) {
    if (!this.$el) return
    const { ghostAnimation } = this.options
    if (smooth) setTransition(this.$el, `${ghostAnimation}ms`)
    else setTransition(this.$el, 'none')
    // 将初始化放在 move 事件中，避免与鼠标点击事件冲突
    if (!this.exist) {
      document.body.appendChild(this.$el)
      this.exist = true
    }
    setTransform(this.$el, `translate3d(${this.position.x}px, ${this.position.y}px, 0)`)
    if (this.$el.style.cursor !== 'move') this.$el.style.cursor = 'move'
  }

  destroy(rect) {
    if (rect) {
      this.position = { x: rect.left, y: rect.top }
      this.move(true)
    }
    const { ghostAnimation } = this.options
    ghostAnimation ? setTimeout(() => this.clear(), ghostAnimation) : this.clear()
  }

  clear() {
    if (this.$el) this.$el.remove()
    this.$el = null
    this.diff = { x: 0, y: 0 }
    this.position = { x: 0, y: 0 }
    this.exist = false
  }
}