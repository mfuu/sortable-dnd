import utils from "./utils.js"


/**
 * 拖拽前后差异初始化
 */
 export class Diff {
  constructor() {
    this.old = { node: null, rect: {} }
    this.new = { node: null, rect: {} }
  }

  get(key) {
    return this[key]
  }

  set(key, value) {
    this[key] = value
  }

  destroy() {
    this.old = { node: null, rect: {} }
    this.new = { node: null, rect: {} }
  }
}


/**
 * 拖拽中的元素
 */
export class Ghost {
  constructor(options) {
    this.options = options
    this.x = 0
    this.y = 0
    this.exist = false
  }

  init(el) {
    if (!el) {
      console.error('Ghost Element is required')
      return
    }
    this.$el = el
    const { ghostClass, ghostStyle = {} } = this.options
    
    this.$el.class = ghostClass
    // this.$el.style.width = rect.width
    // this.$el.style.height = rect.height
    this.$el.style.transform = ''
    this.$el.style.transition = ''
    this.$el.style.position = 'fixed'
    this.$el.style.left = 0
    this.$el.style.top = 0
    this.$el.style.zIndex = 100000
    this.$el.style.opacity = 0.8
    this.$el.style.pointerEvents = 'none'

    // utils.css(this.$el, 'width', rect.width)
    // utils.css(this.$el, 'height', rect.height)
    for (const key in ghostStyle) {
      utils.css(this.$el, key, ghostStyle[key])
    }
  }

  get (key) {
    return this[key]
  }

  set (key, value) {
    this[key] = value
    this[key] = value
  }

  move() {
    // 将初始化放在 move 事件中，避免与鼠标点击事件冲突
    if (!this.exist) {
      document.body.appendChild(this.$el)
      this.exist = true
    }
    this.$el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`
  }

  destroy() {
    if (this.$el) this.$el.remove()
    this.exist = false
  }
}