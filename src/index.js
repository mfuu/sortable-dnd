import utils from './utils.js'
import { Safari } from './brower.js'

/**
 * 拖拽前后差异初始化
 */
class Diff {
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
class Ghost {
  constructor(options) {
    this.options = options
    this.x = 0
    this.y = 0
    this.exist = false
  }

  init(el, rect) {
    if (!el) {
      console.error('Ghost Element is required')
      return
    }
    this.$el = el
    this.rect = rect
    const { ghostClass, ghostStyle = {} } = this.options
    const { width, height } = rect
    
    this.$el.class = ghostClass
    this.$el.style.width = width + 'px'
    this.$el.style.height = height + 'px'
    this.$el.style.transform = ''
    this.$el.style.transition = ''
    this.$el.style.position = 'fixed'
    this.$el.style.left = 0
    this.$el.style.top = 0
    this.$el.style.zIndex = 100000
    this.$el.style.opacity = 0.8
    this.$el.style.pointerEvents = 'none'

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

class Sortable {
  constructor(el, options) {
    this.$el = el // 列表容器元素
    this.options = options = Object.assign({}, options)

    this.dragEl = null // 拖拽元素
    this.dropEl = null // 释放元素
    this.diff = null // 记录拖拽前后差异
    this.ghost = null // 拖拽时蒙版元素
    this.calcXY = { x: 0, y: 0 } // 记录拖拽移动时坐标

    utils.debounce(this.init(), 50) // 避免重复执行多次
  }
  init() {
    if (!this.$el) {
      console.error('Error: container element is required')
      return
    }

    const defaults = {
      animation: 150, // 动画延时

      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      draggable: '', // String: class, Function: (e) => return true
      dragging: null, // 必须为函数且必须返回一个 HTMLElement (e) => return e.target
      dragEnd: null, // 拖拽完成时的回调函数，返回两个值(olddom, newdom) => {}

      supportPointer: ('PointerEvent' in window) && !Safari,
      ownerDocument: this.$el.ownerDocument,
    }
    // Set default options
    for (const name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name])
    }

    this.diff = new Diff()
    this.ghost = new Ghost(this.options)

    this._bindEventListener()
  }
  destroy() {
    this._unbindEventListener()
    this._resetState()
  }

  _bindEventListener() {
    this._onStart = this._onStart.bind(this)
    this._onMove = this._onMove.bind(this)
    this._onDrop = this._onDrop.bind(this)

    const { supportPointer } = this.options
    if (supportPointer) {
      utils.on(this.$el, 'pointerdown', this._onStart)
    } else {
      utils.on(this.$el, 'mousedown', this._onStart)
      utils.on(this.$el, 'touchstart', this._onStart)
    }
  }

  _unbindEventListener() {
    utils.off(this.$el, 'pointerdown', this._onStart)
    utils.off(this.$el, 'touchstart', this._onStart)
    utils.off(this.$el, 'mousedown', this._onStart)
  }

  _onStart(evt) {
    const { dragging, draggable } = this.options
    const touch = (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt)
    const target = (touch || evt).target

    if (typeof draggable === 'function') {
      if (!draggable(touch || evt)) return true
    } else if (draggable) {
      if (!utils.matches(target, draggable)) return true
    }

    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return // only left button and enabled
    if (target === this.$el) return true

    try {
			if (document.selection) {
				// Timeout neccessary for IE9
				utils._nextTick(() => { document.selection.empty() })
			} else {
				window.getSelection().removeAllRanges()
			}

      // 获取拖拽元素
      const element = dragging && typeof dragging === 'function' ? dragging(touch || evt) : target
      // 不存在拖拽元素时不允许拖拽
      if (!element) return true
      if (element.animated) return

      this.dragEl = element
		} catch (err) {
      //
      return true
		}

    window.sortableDndOnDown = true

    // 获取当前元素在列表中的位置
    const { index, el, rect } = utils.getElement(this.$el, this.dragEl)

    if (!el || index < 0) return true

    // 将拖拽元素克隆一份作为蒙版
    const ghostEl = this.dragEl.cloneNode(true)
    this.ghost.init(ghostEl, rect)
    this.ghost.set('x', rect.left)
    this.ghost.set('y', rect.top)

    this.diff.old.rect = rect
    this.calcXY = { x: (touch || evt).clientX, y: (touch || evt).clientY }

    this._onMoveEvents(touch)
    this._onUpEvents(touch)
  }

  _onMove(evt) {
    evt.preventDefault()

    const touch = evt.touches && evt.touches[0]
    const e = touch || evt
    const { clientX, clientY } = e
    const target = touch ? document.elementFromPoint(clientX, clientY) : e.target

    const { chosenClass } = this.options
    utils.toggleClass(this.dragEl, chosenClass, true)
    this.ghost.move()

    if (!window.sortableDndOnDown) return
    if (clientX < 0 || clientY < 0) return

    document.body.style.cursor = 'grabbing'
    window.sortableDndOnMove = true

    this.ghost.set('x', this.ghost.x + clientX - this.calcXY.x)
    this.ghost.set('y', this.ghost.y + clientY - this.calcXY.y)
    this.calcXY = { x: clientX, y: clientY }
    this.ghost.move()

    this._checkRange(e)

    const { index, el, rect } = utils.getElement(this.$el, target)
    const { left, right, top, bottom } = rect

    if (!el || index < 0 || top < 0) return

    if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
      this.dropEl = el
      // 拖拽前后元素不一致时交换
      if (this.dropEl !== this.dragEl) {
        if (this.dropEl.animated) return

        const dragRect = utils.getRect(this.dragEl)
        const dropRect = utils.getRect(this.dropEl)

        if (utils.index(this.$el, this.dragEl) < index) {
          this.$el.insertBefore(this.dragEl, this.dropEl.nextElementSibling)
        } else {
          this.$el.insertBefore(this.dragEl, this.dropEl)
        }

        // 设置动画
        utils.animate(this.dragEl, dragRect, this.animation)
        utils.animate(this.dropEl, dropRect, this.animation)

        this.diff.old.node = this.dragEl
        this.diff.new.node = this.dropEl
      }
      this.diff.new.rect = utils.getRect(this.dropEl)
    }
  }

  _onDrop() {
    this._offMoveEvents()
    this._offUpEvents()
    document.body.style.cursor = ''

    const { dragEnd, chosenClass } = this.options

    utils.toggleClass(this.dragEl, chosenClass, false)

    if (window.sortableDndOnDown && window.sortableDndOnMove) {
      // 拖拽完成触发回调函数
      if (dragEnd && typeof dragEnd === 'function') dragEnd(this.diff.old, this.diff.new)
    }

    this.diff.destroy()
    this.ghost.destroy()
    this._removeWindowState()
  }

  _checkRange(e) {
    const { top, left, right, bottom } = utils.getRect(this.$el)

    if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) {
      document.body.style.cursor = 'not-allowed'
      return
    }
  }

  _resetState() {
    this.dragEl = null
    this.dropEl = null
    this.ghost.destroy()
    this.diff.destroy()
    this._removeWindowState()
  }

  _removeWindowState() {
    window.sortableDndOnDown = null
    window.sortableDndOnMove = null
    delete window.sortableDndOnDown
    delete window.sortableDndOnMove
  }
  
  _onMoveEvents(touch) {
    const { supportPointer, ownerDocument } = this.options
    if (supportPointer) {
      utils.on(ownerDocument, 'pointermove', this._onMove)
    } else if (touch) {
      utils.on(ownerDocument, 'touchmove', this._onMove)
    } else {
      utils.on(ownerDocument, 'mousemove', this._onMove)
    }
  }

  _onUpEvents() {
    const { ownerDocument } = this.options
    utils.on(ownerDocument, 'pointerup', this._onDrop)
    utils.on(ownerDocument, 'touchend', this._onDrop)
    utils.on(ownerDocument, 'touchcancel', this._onDrop)
    utils.on(ownerDocument, 'mouseup', this._onDrop)
  }

  _offMoveEvents() {
    const { ownerDocument } = this.options
    utils.off(ownerDocument, 'pointermove', this._onMove)
    utils.off(ownerDocument, 'touchmove', this._onMove)
    utils.off(ownerDocument, 'mousemove', this._onMove)
  }

  _offUpEvents() {
    const { ownerDocument } = this.options
    utils.off(ownerDocument, 'mouseup', this._onDrop)
    utils.off(ownerDocument, 'touchend', this._onDrop)
    utils.off(ownerDocument, 'touchcancel', this._onDrop)
    utils.off(ownerDocument, 'pointerup', this._onDrop)
  }
}

export default Sortable