import {
  on,
  css,
  matches,
  getRect,
  getOffset,
  _nextTick,
  getElement,
  toggleClass,
  supportPassive,
  getParentAutoScrollElement
} from './utils.js'
import { IOS, Safari, ChromeForAndroid } from './Brower.js'
import Animation from './Animation.js'
import Events from './events.js'

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
    this.$el.style.cursor = 'move'

    this.setStyle(ghostStyle)
  }

  get (key) {
    return this[key]
  }

  set (key, value) {
    this[key] = value
    this[key] = value
  }

  setStyle(style) {
    for (const key in style) {
      css(this.$el, key, style[key])
    }
  }

  rect() {
    return this.$el.getBoundingClientRect()
  }

  move(smooth) {
    const { ghostAnimation } = this.options
    if (smooth) this.$el.style.transition = `all ${ghostAnimation}ms`
    else this.$el.style.transition = ''
    // 将初始化放在 move 事件中，避免与鼠标点击事件冲突
    if (!this.exist) {
      document.body.appendChild(this.$el)
      this.exist = true
    }
    this.$el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`
    if (this.$el.style.cursor !== 'move') this.$el.style.cursor = 'move'
  }

  destroy(rect) {
    if (rect) {
      this.x = rect.left
      this.y = rect.top
      this.move(true)
    }
    setTimeout(() => {
      if (this.$el) this.$el.remove()
      this.exist = false
    }, this.options.ghostAnimation)
  }
}

// -------------------------------- Sortable ----------------------------------

const documentExists = typeof document !== 'undefined'
const supportDraggable = documentExists && !ChromeForAndroid && !IOS && ('draggable' in document.createElement('div'))

/**
 * @class  Sortable
 * @param  {HTMLElement}  el
 * @param  {Object}       options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
		throw `Sortable: \`el\` must be an HTMLElement, not ${ {}.toString.call(el) }`;
	}

  this.$el = el // root element
  this.options = options = Object.assign({}, options)
  this.scrollEl = getParentAutoScrollElement(this.$el, true) // 获取页面滚动元素

  this.dragEl = null // 拖拽元素
  this.dropEl = null // 释放元素
  this.differ = null // 记录拖拽前后差异
  this.ghost = null // 拖拽时蒙版元素
  this.calcXY = { x: 0, y: 0 } // 记录拖拽移动时坐标

  const defaults = {
    disabled: false, // 
    animation: 150, // 动画延时

    ghostAnimation: 0, // 拖拽元素销毁时动画效果
    ghostClass: '', // 拖拽元素Class类名
    ghostStyle: {}, // 拖拽元素样式
    chosenClass: '', // 选中元素样式
    draggable: undefined, // String: css selecter, Function: (e) => return true
    dragging: undefined, // 必须为函数且必须返回一个 HTMLElement: (e) => return e.target
    dragEnd: undefined, // 拖拽完成时的回调函数: (old, new, changed) => {}

    forceFallback: false, // 忽略 HTML5拖拽行为，强制回调进行

    stopPropagation: false, // 阻止捕获和冒泡阶段中当前事件的进一步传播

    supportPassive: supportPassive(),
    supportPointer: ('PointerEvent' in window) && !Safari,
    supportTouch: 'ontouchstart' in window,
    ownerDocument: this.$el.ownerDocument,
  }

  // Set default options
  for (const name in defaults) {
    !(name in this.options) && (this.options[name] = defaults[name])
  }

  this.differ = new Differ()
  this.ghost = new Ghost(this.options)

  Object.assign(this, Animation(), Events())

  this._bindEventListener()

  this.nativeDraggable = this.options.forceFallback ? false : supportDraggable

  if (this.nativeDraggable) {
    on(this.$el, 'dragover', this)
    on(this.$el, 'dragenter', this)
  }

  this._handleDestroy()
}

Sortable.prototype = /** @lends Sortable.prototype */ {
  constructor: Sortable,

  destroy() {
    this._unbindEventListener()
    this._resetState()
  },

  // -------------------------------- drag and drop ----------------------------------
  _onStart: function(/** Event|TouchEvent */evt) {
    const { disabled, dragging, draggable, stopPropagation } = this.options

    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || disabled) return // only left button and enabled

    const touch = (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt)
    const e = touch || evt

    // Safari ignores further event handling after mousedown
		if (!this.nativeDraggable && Safari && e.target && e.target.tagName.toUpperCase() === 'SELECT') return

    if (e.target === this.$el) return true

    if (typeof draggable === 'function') {
      if (!draggable(e)) return true

    } else if (typeof draggable === 'string') {
      if (!matches(e.target, draggable)) return true

    } else if (draggable !== undefined) {
      throw new Error(`draggable expected "function" or "string" but received "${typeof draggable}"`)
    }

    if (evt.preventDefault !== void 0) evt.preventDefault()
    if (stopPropagation) evt.stopPropagation()

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
  },
  _onMove: function(/** Event|TouchEvent */evt) {
    if (evt.preventDefault !== void 0) evt.preventDefault() // prevent scrolling

    const touch = evt.touches && evt.touches[0]
    const e = touch || evt
    const { clientX, clientY } = e
    const target = touch ? document.elementFromPoint(clientX, clientY) : e.target

    const { chosenClass, stopPropagation } = this.options

    if (stopPropagation) evt.stopPropagation()

    toggleClass(this.dragEl, chosenClass, true)
    this.ghost.move()

    if (!window.sortableDndOnDown) return
    if (clientX < 0 || clientY < 0) return

    window.sortableDndOnMove = true

    this.ghost.set('x', this.ghost.x + clientX - this.calcXY.x)
    this.ghost.set('y', this.ghost.y + clientY - this.calcXY.y)
    this.calcXY = { x: clientX, y: clientY }
    this.ghost.move()

    // 判断边界值
    const rc = getRect(this.$el)

    if (clientX < rc.left || clientX > rc.right || clientY < rc.top || clientY > rc.bottom) {
      this.ghost.setStyle({ cursor: 'not-allowed' })
      return
    }

    const { index, el, rect, offset } = getElement(this.$el, target)
    const { left, right, top, bottom } = rect

    if (!el || index < 0 || top < 0) return

    // 加上当前滚动距离
    const { scrollTop, scrollLeft } = this.scrollEl
    const boundaryL = rc.left + scrollLeft
    const boundaryT = rc.top + scrollTop

    // 如果目标元素超出当前可视区，不允许拖动
    if (this.scrollEl !== this.$el && (rc.left < 0 || rc.top < 0)) {
      if ((rc.top < 0 && top < boundaryT) || (rc.left < 0 && left < boundaryL)) return

    } else if (top < rc.top || left < rc.left) return
    
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
  },
  _onDrop: function(/** Event|TouchEvent */evt) {
    this._offMoveEvents()
    this._offUpEvents()

    const { dragEnd, chosenClass, stopPropagation } = this.options

    if (stopPropagation) evt.stopPropagation() // 阻止事件冒泡

    toggleClass(this.dragEl, chosenClass, false)

    if (window.sortableDndOnDown && window.sortableDndOnMove) {

      // 重新获取一次拖拽元素的 offset 值作为拖拽完成后的 offset 值
      this.differ._new_.offset = getOffset(this.dragEl)

      // 拖拽完成触发回调函数
      const { _old_, _new_ } = this.differ

      // 通过 offset 比较是否进行了元素交换
      const changed = _old_.offset.top !== _new_.offset.top || _old_.offset.left !== _new_.offset.left

      // 如果拖拽前后没有发生交换，重新赋值一次
      if (!changed) {
        this.differ._new_.node = this.differ._old_.node
        this.differ._new_.rect = this.differ._old_.rect
      }
      
      if (typeof dragEnd === 'function') {
        dragEnd(_old_, _new_, changed)
      } else {
        throw new Error(`Sortable-dnd Error: dragEnd expected "function" but received "${typeof dragEnd}"`)
      }
    }

    this.ghost.destroy(this.differ._new_.rect)
    this.differ.destroy()
    this._removeWindowState()
  },

  // -------------------------------- reset state ----------------------------------
  _resetState: function() {
    this.dragEl = null
    this.dropEl = null
    this.ghost.destroy()
    this.differ.destroy()
    this.calcXY = { x: 0, y: 0 }
    this._removeWindowState()
  },
  _removeWindowState: function() {
    window.sortableDndOnDown = null
    window.sortableDndOnMove = null
    delete window.sortableDndOnDown
    delete window.sortableDndOnMove
  },

  // -------------------------------- auto destroy ----------------------------------
  _handleDestroy: function() {
    let observer = null
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
    if (MutationObserver) {
      const { ownerDocument } = this.options
      if (!ownerDocument) return
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
}

export default Sortable