import {
  on,
  off,
  css,
  matches,
  getRect,
  debounce,
  getOffset,
  _nextTick,
  getElement,
  toggleClass,
  getParentAutoScrollElement
} from './utils.js'
import { Safari } from './Brower.js'
import Animation from './Animation.js'

/**
 * 拖拽前后差异初始化
 */
class Differ {
  constructor() {
    this._old_ = { node: null, rect: {}, offset: {} }
    this._new_ = { node: null, rect: {}, offset: {} }
  }

  get(key) {
    return this[key]
  }

  set(key, value) {
    this[key] = value
  }

  destroy() {
    this._old_ = { node: null, rect: {}, offset: {} }
    this._new_ = { node: null, rect: {}, offset: {} }
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
    if (!el) return
    this.$el = el
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
      css(this.$el, key, ghostStyle[key])
    }
  }

  get (key) {
    return this[key]
  }

  set (key, value) {
    this[key] = value
    this[key] = value
  }

  rect() {
    return this.$el.getBoundingClientRect()
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
    if (!el) throw new Error('container element is required')

    this.$el = el // 列表容器元素
    this.options = options = Object.assign({}, options)
    this.scrollEl = getParentAutoScrollElement(this.$el, true) // 获取页面滚动元素

    this.dragEl = null // 拖拽元素
    this.dropEl = null // 释放元素
    this.differ = null // 记录拖拽前后差异
    this.ghost = null // 拖拽时蒙版元素
    this.calcXY = { x: 0, y: 0 } // 记录拖拽移动时坐标

    debounce(this.init(), 50) // 避免重复执行多次
  }

  destroy() {
    this._unbindEventListener()
    this._resetState()
  }

  init() {
    const defaults = {
      animation: 150, // 动画延时

      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      draggable: undefined, // String: class, Function: (e) => return true
      dragging: null, // 必须为函数且必须返回一个 HTMLElement (e) => return e.target
      dragEnd: null, // 拖拽完成时的回调函数，返回两个值(olddom, newdom) => {}

      supportPointer: ('PointerEvent' in window) && !Safari,
      ownerDocument: this.$el.ownerDocument,
    }
    // Set default options
    for (const name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name])
    }

    this.differ = new Differ()
    this.ghost = new Ghost(this.options)

    Object.assign(this, Animation())

    this._bindEventListener()
    this._handleDestroy()
  }

  // -------------------------------- drag and drop ----------------------------------
  _onStart(evt) {
    const { dragging, draggable } = this.options
    const touch = (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt)
    const e = touch || evt

    if (typeof draggable === 'function') {
      if (!draggable(e)) return true

    } else if (typeof draggable === 'string') {
      if (!matches(e.target, draggable)) return true

    } else if (draggable !== undefined) {
      throw new Error(`draggable expected "function" or "string" but received "${typeof draggable}"`)
    }

    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return // only left button and enabled
    if (e.target === this.$el) return true

    try {
			if (document.selection) {
				// Timeout neccessary for IE9
				_nextTick(() => { document.selection.empty() })
			} else {
				window.getSelection().removeAllRanges()
			}

      // 获取拖拽元素
      const element = typeof dragging === 'function' ? dragging(e) : getElement(this.$el, e.target).el
                        
      // 不存在拖拽元素时不允许拖拽
      if (!element) return true
      if (element.animated) return

      this.dragEl = element

		} catch (error) {
      throw new Error(error)
		}

    window.sortableDndOnDown = true

    // 获取当前元素在列表中的位置
    const { index, el, rect, offset } = getElement(this.$el, this.dragEl)

    if (!el || index < 0) return true

    // 将拖拽元素克隆一份作为蒙版
    const ghostEl = this.dragEl.cloneNode(true)
    this.ghost.init(ghostEl, rect)
    this.ghost.set('x', rect.left)
    this.ghost.set('y', rect.top)

    this.differ._old_.rect = rect
    this.differ._old_.offset = offset
    this.differ._old_.node = this.dragEl

    this.calcXY = { x: e.clientX, y: e.clientY }

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
    toggleClass(this.dragEl, chosenClass, true)
    this.ghost.move()

    if (!window.sortableDndOnDown) return
    if (clientX < 0 || clientY < 0) return

    document.body.style.cursor = 'grabbing'
    window.sortableDndOnMove = true

    this.ghost.set('x', this.ghost.x + clientX - this.calcXY.x)
    this.ghost.set('y', this.ghost.y + clientY - this.calcXY.y)
    this.calcXY = { x: clientX, y: clientY }
    this.ghost.move()

    const { index, el, rect, offset } = getElement(this.$el, target)
    const { left, right, top, bottom } = rect

    if (!el || index < 0 || top < 0) return

    // 判断边界值
    const _rect = getRect(this.$el)
    this._checkRange(e, _rect)

    const { scrollTop, scrollLeft } = this.scrollEl

    // 如果目标元素超出当前可视区，不允许拖动
    if (this.scrollEl !== this.$el && (_rect.left < 0 || _rect.top < 0)) {
      if (rect.top < (_rect.top + scrollTop) && _rect.top < 0) return
      if (rect.left < (_rect.left + scrollLeft) && _rect.left < 0) return
    } else {
      if (rect.top < _rect.top) return
      if (rect.left < _rect.left) return
    }
    

    if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
      this.dropEl = el

      // 拖拽前后元素不一致时交换
      if (this.dropEl !== this.dragEl) {
        if (this.dropEl.animated) return

        this.captureAnimationState()

        const _offset = getOffset(this.dragEl) // 获取拖拽元素的 offset 值
        
        // 优先比较 top 值，top 值相同再比较 left
        if (_offset.top < offset.top || _offset.left < offset.left) {
          this.$el.insertBefore(this.dragEl, this.dropEl.nextElementSibling)
        } else {
          this.$el.insertBefore(this.dragEl, this.dropEl)
        }

        this.animateRange()
        this.differ._new_.node = this.dropEl
        this.differ._new_.rect = getRect(this.dropEl)
      }
    }
  }

  _onDrop() {
    this._offMoveEvents()
    this._offUpEvents()
    document.body.style.cursor = ''

    const { dragEnd, chosenClass } = this.options

    toggleClass(this.dragEl, chosenClass, false)

    if (window.sortableDndOnDown && window.sortableDndOnMove) {

      // 重新获取一次拖拽元素的 offset 值作为拖拽完成后的 offset 值
      this.differ._new_.offset = getOffset(this.dragEl)

      // 拖拽完成触发回调函数
      const { _old_, _new_ } = this.differ

      // 通过 offset 比较是否进行了元素交换
      const changed = _old_.offset.top !== _new_.offset.top || _old_.offset.left !== _new_.offset.left

      // 如果拖拽前后没有发生交换，重新赋值一次
      if (!changed) this.differ._new_.node = this.differ._old_.node
      
      if (typeof dragEnd === 'function') {
        dragEnd(_old_, _new_, changed)
      } else {
        throw new Error(`Sortable-dnd Error: dragEnd expected "function" but received "${typeof dragEnd}"`)
      }
    }

    this.differ.destroy()
    this.ghost.destroy()
    this._removeWindowState()
  }

  _checkRange(e, groupRect) {
    const { top, left, right, bottom } = groupRect

    if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) {
      document.body.style.cursor = 'not-allowed'
      return
    }
  }

  // -------------------------------- auto destroy ----------------------------------
  _handleDestroy() {
    let observer = null
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver
    if (MutationObserver) {
      const { ownerDocument } = this.options
      observer = new MutationObserver(() => {
        if (!ownerDocument.body.contains(this.$el)) {
          observer.disconnect()
          observer = null
          this._unbindEventListener()
          this._resetState()
        }
      })
      observer.observe(this.$el.parentNode, {
        childList: true,  // 观察目标子节点的变化，是否有添加或者删除
        attributes: false, // 观察属性变动
        subtree: false     // 观察后代节点，默认为 false
      })
    }

    window.onbeforeunload = () => {
      if (observer) observer.disconnect()
      observer = null
      this._unbindEventListener()
      this._resetState()
    }
  }

  // -------------------------------- reset state ----------------------------------
  _resetState() {
    this.dragEl = null
    this.dropEl = null
    this.ghost.destroy()
    this.differ.destroy()
    this.calcXY = { x: 0, y: 0 }
    this._removeWindowState()
  }

  _removeWindowState() {
    window.sortableDndOnDown = null
    window.sortableDndOnMove = null
    delete window.sortableDndOnDown
    delete window.sortableDndOnMove
  }

  // -------------------------------- listener ----------------------------------
  _bindEventListener() {
    this._onStart = this._onStart.bind(this)
    this._onMove = this._onMove.bind(this)
    this._onDrop = this._onDrop.bind(this)

    const { supportPointer } = this.options
    if (supportPointer) {
      on(this.$el, 'pointerdown', this._onStart)
    } else {
      on(this.$el, 'mousedown', this._onStart)
      on(this.$el, 'touchstart', this._onStart)
    }
  }

  _unbindEventListener() {
    off(this.$el, 'pointerdown', this._onStart)
    off(this.$el, 'touchstart', this._onStart)
    off(this.$el, 'mousedown', this._onStart)
  }
  
  _onMoveEvents(touch) {
    const { supportPointer, ownerDocument } = this.options
    if (supportPointer) {
      on(ownerDocument, 'pointermove', this._onMove)
    } else if (touch) {
      on(ownerDocument, 'touchmove', this._onMove)
    } else {
      on(ownerDocument, 'mousemove', this._onMove)
    }
  }

  _onUpEvents() {
    const { ownerDocument } = this.options
    on(ownerDocument, 'pointerup', this._onDrop)
    on(ownerDocument, 'touchend', this._onDrop)
    on(ownerDocument, 'touchcancel', this._onDrop)
    on(ownerDocument, 'mouseup', this._onDrop)
  }

  _offMoveEvents() {
    const { ownerDocument } = this.options
    off(ownerDocument, 'pointermove', this._onMove)
    off(ownerDocument, 'touchmove', this._onMove)
    off(ownerDocument, 'mousemove', this._onMove)
  }

  _offUpEvents() {
    const { ownerDocument } = this.options
    off(ownerDocument, 'mouseup', this._onDrop)
    off(ownerDocument, 'touchend', this._onDrop)
    off(ownerDocument, 'touchcancel', this._onDrop)
    off(ownerDocument, 'pointerup', this._onDrop)
  }
}

export default Sortable