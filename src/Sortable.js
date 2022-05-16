import {
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
import { IOS, Edge, Safari, IE11OrLess, ChromeForAndroid } from './Brower.js'
import { Ghost, Differ } from './Plugins.js'
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
  this.scrollEl = getParentAutoScrollElement(this.$el, true) // 获取页面滚动元素

  this.dragEl = null // 拖拽元素
  this.dropEl = null // 释放元素
  this.differ = null // 记录拖拽前后差异
  this.ghost = null // 拖拽时蒙版元素
  this.calcXY = { x: 0, y: 0 } // 记录拖拽移动时坐标

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
  this._handleDestroy()
}

Sortable.prototype = {
  constructor: Sortable,

  destroy() {
    this._unbindEventListener()
    this._resetState()
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
      throw new Error(error)
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

    window.sortableDndOnDownState = true

    this.ghost.set('x', rect.left)
    this.ghost.set('y', rect.top)
    this.differ.from = { node: this.dragEl, rect, offset}
    this.calcXY = { x: e.clientX, y: e.clientY }

    this._onMoveEvents(touch)
    this._onUpEvents(touch)
  },
  _onMove: function(/** Event|TouchEvent */evt) {
    if (evt.preventDefault !== void 0) evt.preventDefault() // prevent scrolling

    const { chosenClass, stopPropagation, onMove, onDrag } = this.options

    if (stopPropagation) evt.stopPropagation()

    const touch = evt.touches && evt.touches[0]
    const e = touch || evt
    const { clientX, clientY } = e
    const target = touch ? document.elementFromPoint(clientX, clientY) : e.target

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

    if (!window.sortableDndOnDownState) return
    if (clientX < 0 || clientY < 0) return

    window.sortableDndOnMoveState = true

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
    
    this.dropEl = el

    if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
      // 拖拽前后元素不一致时交换
      if (el !== this.dragEl) {
        this.differ.to = { node: this.dropEl, rect, offset }

        if (el.animated) return

        this.captureAnimationState()

        const { onChange } = this.options
        const _offset = getOffset(this.dragEl) // 获取拖拽元素的 offset 值

        // 元素发生位置交换时触发的回调
        if (onChange !== undefined) {
          if (typeof onChange === 'function') onChange(this.differ.from, this.differ.to, e, evt)
          else throw new Error(`onChange expected "function" but received "${typeof onChange}"`)
        }
        
        // 优先比较 top 值，top 值相同再比较 left
        if (_offset.top < offset.top || _offset.left < offset.left) {
          this.$el.insertBefore(this.dragEl, el.nextElementSibling)
        } else {
          this.$el.insertBefore(this.dragEl, el)
        }

        this.animateRange()
      }
    }
  },
  _onDrop: function(/** Event|TouchEvent */evt) {
    this._offMoveEvents()
    this._offUpEvents()
    clearTimeout(this.dragStartTimer)

    const { onDrop, chosenClass, stopPropagation } = this.options

    if (stopPropagation) evt.stopPropagation() // 阻止事件冒泡

    toggleClass(this.dragEl, chosenClass, false)

    if (window.sortableDndOnDownState && window.sortableDndOnMoveState) {

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
    window.sortableDndOnDownState = null
    window.sortableDndOnMoveState = null
    window.sortableDndAnimationEnd = null
    delete window.sortableDndOnDownState
    delete window.sortableDndOnMoveState
    delete window.sortableDndAnimationEnd
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
