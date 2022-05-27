import {
  matches,
  getRect,
  throttle,
  debounce,
  getOffset,
  _nextTick,
  getElement,
  toggleClass,
  supportPassive,
  getParentAutoScrollElement
} from './utils.js'
import { IOS, Edge, Safari, IE11OrLess, ChromeForAndroid } from './Brower.js'
import { Ghost, Differ, State } from './Plugins.js'
import Animation from './Animation.js'
import Events from './events.js'


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

  this.state = new State // 拖拽过程中状态记录
  this.dragEl = null // 拖拽元素
  this.dropEl = null // 释放元素
  this.differ = null // 记录拖拽前后差异
  this.ghost = null // 拖拽时蒙版元素

  const defaults = {
    delay: 0, // 定义鼠标选中列表单元可以开始拖动的延迟时间
    delayOnTouchOnly: false, // only delay if user is using touch
    disabled: false, // 定义是否此sortable对象是否可用，为true时sortable对象不能拖放排序等功能，为false时为可以进行排序，相当于一个开关
    animation: 150, // 定义排序动画的时间

    ghostAnimation: 0, // 拖拽元素销毁时动画效果
    ghostClass: '', // 拖拽元素Class类名
    ghostStyle: {}, // 拖拽元素样式
    chosenClass: '', // 选中元素样式
    
    draggable: undefined, // String: css选择器, Function: (e) => return true
    dragging: undefined, // 设置拖拽元素，必须为函数且必须返回一个 HTMLElement: (e) => return e.target
    onDrag: undefined, // 拖拽开始时触发的回调函数: () => {}
    onMove: undefined, // 拖拽过程中的回调函数: (from, to) => {}
    onDrop: undefined, // 拖拽完成时的回调函数: (from, to, changed) => {}
    onChange: undefined, // 拖拽元素改变位置的时候: (from, to) => {}

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

  this.nativeDraggable = this.options.forceFallback ? false : supportDraggable

  this.differ = new Differ()
  this.ghost = new Ghost(this.options)

  Object.assign(this, Animation(), Events())

  this._bindEventListener()
}

Sortable.prototype = {
  constructor: Sortable,

  /**
   * Destroy
   */
  destroy: function() {
    this._unbindEventListener()
    this._clearState()
  },

  // -------------------------------- drag and drop ----------------------------------
  _onStart: function(/** Event|TouchEvent */evt) {
    const { delay, disabled, stopPropagation, delayOnTouchOnly } = this.options
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || disabled) return // only left button and enabled

    const touch = (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt)
    const e = touch || evt

    // Safari ignores further event handling after mousedown
		if (!this.nativeDraggable && Safari && e.target && e.target.tagName.toUpperCase() === 'SELECT') return
    if (e.target === this.$el) return true

    if (stopPropagation) evt.stopPropagation()

    if (delay && (!delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
      this.dragStartTimer = setTimeout(this._onDrag(e, touch), delay)
    } else {
      this._onDrag(e, touch)
    }
  },
  _onDrag: function(/** Event|TouchEvent */e, touch) {
    const { draggable, dragging } = this.options

    if (typeof draggable === 'function') {
      if (!draggable(e)) return true

    } else if (typeof draggable === 'string') {
      if (!matches(e.target, draggable)) return true

    } else if (draggable !== undefined) {
      throw new Error(`draggable expected "function" or "string" but received "${typeof draggable}"`)
    }

    try {
			if (document.selection) {
				// Timeout neccessary for IE9
				_nextTick(() => { document.selection.empty() })
			} else {
				window.getSelection().removeAllRanges()
			}
		} catch (error) {
      //
		}

    // 获取拖拽元素                 
    if (dragging) {
      if (typeof dragging === 'function') this.dragEl = dragging(e)
      else throw new Error(`dragging expected "function" or "string" but received "${typeof dragging}"`)
    } else {
      this.dragEl = getElement(this.$el, e.target, true)
    }

    // 不存在拖拽元素时不允许拖拽
    if (!this.dragEl || this.dragEl.animated) return true

    // 获取拖拽元素在列表中的位置
    const { rect, offset } = getElement(this.$el, this.dragEl)

    this.state.sortableDown = true

    this.ghost.setPosition(rect.left, rect.top)
    this.ghost.diff = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    this.differ.from = { node: this.dragEl, rect, offset}

    this._bindMoveEvents(touch)
    this._bindUpEvents(touch)
  },
  _onMove: function(/** Event|TouchEvent */evt) {
    const touch = evt.touches && evt.touches[0]
    const e = touch || evt
    const { clientX, clientY } = e
    const target = touch ? document.elementFromPoint(clientX, clientY) : e.target
    const { chosenClass, stopPropagation, onMove, onDrag } = this.options

    stopPropagation && evt.stopPropagation && evt.stopPropagation() // 阻止事件冒泡
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault() // prevent scrolling

    // 将初始化放到move事件中，防止与click事件冲突
    // 将拖拽元素克隆一份作为蒙版
    if (!this.ghost.$el) {
      this.ghost.init(this.dragEl.cloneNode(true), this.differ.from.rect)
      if (onDrag !== undefined) {
        if (typeof onDrag === 'function') onDrag(this.dragEl, e, /** originalEvent */evt)
        else throw new Error(`onDrag expected "function" but received "${typeof onDrag}"`)
      }
    }

    // 拖拽过程中触发的回调
    if (onMove !== undefined) {
      if (typeof onMove === 'function') onMove(this.differ.from, this.ghost.$el, e, /** originalEvent */evt)
      else throw new Error(`onMove expected "function" but received "${typeof onMove}"`)
    }

    toggleClass(this.dragEl, chosenClass, true)
    this.ghost.move()

    if (!this.state.sortableDown) return
    if (clientX < 0 || clientY < 0) return

    this.state.sortableMove = true

    this.ghost.setPosition(clientX, clientY)
    this.ghost.move()

    // 判断边界值
    const rc = getRect(this.$el)

    if (clientX < rc.left || clientX > rc.right || clientY < rc.top || clientY > rc.bottom) {
      this.ghost.setStyle({ cursor: 'not-allowed' })
      return
    }

    this._onChange(this, target, e, evt)
  },
  _onChange: throttle(function(_this, target, e, evt) {
    const { el, rect, offset } = getElement(_this.$el, target)
    
    if (!el || (el && el.animated)) return
    
    _this.dropEl = el

    const { clientX, clientY } = e
    const { left, right, top, bottom } = rect

    if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
      // 拖拽前后元素不一致时交换
      if (el !== _this.dragEl) {
        _this.differ.to = { node: _this.dropEl, rect, offset }

        _this.captureAnimationState()

        const { onChange } = _this.options
        const _offset = getOffset(_this.dragEl) // 获取拖拽元素的 offset 值

        // 元素发生位置交换时触发的回调
        if (onChange !== undefined) {
          if (typeof onChange === 'function') onChange(_this.differ.from, _this.differ.to, e, evt)
          else throw new Error(`onChange expected "function" but received "${typeof onChange}"`)
        }
        
        // 优先比较 top 值，top 值相同再比较 left
        if (_offset.top < offset.top || _offset.left < offset.left) {
          _this.$el.insertBefore(_this.dragEl, el.nextElementSibling)
        } else {
          _this.$el.insertBefore(_this.dragEl, el)
        }

        _this.animateRange()
      }
    }
  }, 5),
  _onDrop: function(/** Event|TouchEvent */evt) {
    this._unbindMoveEvents()
    this._unbindUpEvents()
    clearTimeout(this.dragStartTimer)

    const { onDrop, chosenClass, stopPropagation } = this.options

    stopPropagation && evt.stopPropagation() // 阻止事件冒泡
    evt.cancelable && evt.preventDefault()

    toggleClass(this.dragEl, chosenClass, false)

    if (this.state.sortableDown && this.state.sortableMove) {

      // 重新获取一次拖拽元素的 offset 和 rect 值作为拖拽完成后的值
      this.differ.to.offset = getOffset(this.dragEl)
      this.differ.to.rect = getRect(this.dragEl)

      const { from, to } = this.differ

      // 通过 offset 比较是否进行了元素交换
      const changed = from.offset.top !== to.offset.top || from.offset.left !== to.offset.left
      
      // 拖拽完成触发回调函数
      if (onDrop !== undefined) {
        if (typeof onDrop === 'function') onDrop(changed, evt)
        else throw new Error(`onDrop expected "function" but received "${typeof onDrop}"`)
      }

      this.ghost.destroy(getRect(this.dragEl))
    }
    this.differ.destroy()
    this.state = new State
  },

  // -------------------------------- reset state ----------------------------------
  _clearState: function() {
    this.dragEl = null
    this.dropEl = null
    this.state = new State
    this.ghost.destroy()
    this.differ.destroy()
  }
}

export default Sortable
