import utils from './utils.js'
import { Safari } from './brower.js'
import { Ghost, Diff } from './constructors.js'

/**
 * @interface Options {
 * 
 * group: HTMLElement,
 * 
 * draggable?: Function, return element node selected when dragging, or null
 * 
 * dragEnd?: Function, The callback function when the drag is completed
 * 
 * ghostStyle?: Object,
 * 
 * ghostClass?: String,
 * 
 * }
 */

class Sortable {
  constructor(options) {
    this.group = options.group // 父级元素

    this.dragging = options.dragging // 必须为函数且必须返回一个 HTMLElement (e) => return e.target
    this.dragEnd = options.dragEnd // 拖拽完成时的回调函数，返回两个值(olddom, newdom) => {}

    this.ghostStyle = options.ghostStyle // 克隆元素包含的属性
    this.ghostClass = options.ghostClass // 克隆元素的类名

    this.animation = options.animation || 300 // 动画延迟

    this.isMousedown = false // 记录鼠标按下
    this.isMousemove = false // 记录鼠标移动

    this.dragEl = null // 拖拽元素
    this.dropEl = null // 释放元素
    this.diff = new Diff() // 记录拖拽前后差异

    this.ghost = new Ghost({
      ghostClass: this.ghostClass,
      ghostStyle: this.ghostStyle
    })

    this.supportPointer = ('PointerEvent' in window) && !Safari

    this.calcXY = { x: 0, y: 0 } 

    utils.debounce(this.init(), 50) // 避免重复执行多次
  }
  init() {
    if (!this.group) {
      console.error('Error: group is required')
      return
    }
    this._bindEventListener()
  }
  destroy() {
    this._unbindEventListener()
    this._resetState()
  }

  _onStart(e) {
    if (e.button !== 0) return true
    if (e.target === this.group) return true
    try {
      // 获取拖拽元素
      const element = this.dragging ? this.dragging(e) : e.target
      // 不存在拖拽元素时不允许拖拽
      if (!element) return true
      if (element.animated) return
      this.dragEl = element
    } catch(e) {
      //
      return true
    }
    this.isMousedown = true

    // 获取当前元素在列表中的位置
    const { index, el, rect } = utils.getElement(this.group, this.dragEl)

    if (!el || index < 0) return true

    // 将拖拽元素克隆一份作为蒙版
    const ghostEl = this.dragEl.cloneNode(true)
    const groupEl = this.group.cloneNode(false)
    groupEl.appendChild(ghostEl)

    this.ghost.init(groupEl)

    this.diff.old.rect = rect
    this.ghost.set('x', rect.left)
    this.ghost.set('y', rect.top)

    // 记录拖拽移动时坐标
    this.calcXY = { x: e.clientX, y: e.clientY }

    this._onMoveEvents()
    this._onUpEvents()
  }

  _onMove(e) {
    this.ghost.move()

    e.preventDefault()
    if (!this.isMousedown) return

    document.body.style.cursor = 'grabbing'
    
    this.isMousemove = true

    this.ghost.set('x', this.ghost.x + e.clientX - this.calcXY.x)
    this.ghost.set('y', this.ghost.y + e.clientY - this.calcXY.y)
    
    this.calcXY = { x: e.clientX, y: e.clientY }

    this.ghost.move()

    this._checkRange(e)

    const { index, el, rect } = utils.getElement(this.group, e.target)

    if (!el || index < 0) return

    const { left, right, top, bottom } = rect

    if (e.clientX > left && e.clientX < right && e.clientY > top && e.clientY < bottom) {
      this.dropEl = el
      // 拖拽前后元素不一致时交换
      if (this.dropEl !== this.dragEl) {

        const dragRect = this.dragEl.getBoundingClientRect()
        const dropRect = this.dropEl.getBoundingClientRect()

        // if (this.dragEl.animated) return
        if (this.dropEl.animated) return

        if (utils.index(this.group, this.dragEl) < index) {
          this.group.insertBefore(this.dragEl, this.dropEl.nextElementSibling)
        } else {
          this.group.insertBefore(this.dragEl, this.dropEl)
        }

        // 设置动画
        utils.animate(this.dragEl, dragRect, this.animation)
        utils.animate(this.dropEl, dropRect, this.animation)

        this.diff.old.node = this.dragEl
        this.diff.new.node = this.dropEl
      }
      this.diff.new.rect = this.dropEl.getBoundingClientRect()
    }
  }

  _onDrop() {
    this._offMoveEvents()
    this._offUpEvents()
    document.body.style.cursor = ''
    if (this.isMousedown && this.isMousemove) {
      // 拖拽完成触发回调函数
      if (this.dragEnd && typeof this.dragEnd === 'function')
        this.dragEnd(this.diff.old, this.diff.new)
    }
    this.isMousedown = false
    this.isMousemove = false
    this.diff.destroy()
    this.ghost.destroy()
  }

  _checkRange(e) {
    const { top, left, right, bottom } = this.group.getBoundingClientRect()

    if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) {
      document.body.style.cursor = 'not-allowed'
    }
  }

  _resetState() {
    this.isMousedown = false
    this.isMousemove = false
    this.dragEl = null
    this.dropEl = null
    this.ghost.destroy()
    this.diff = new Diff()
  }

  _bindEventListener() {
    this._onStart = this._onStart.bind(this)
    this._onMove = this._onMove.bind(this)
    this._onDrop = this._onDrop.bind(this)

    if (this.supportPointer) {
      utils.on(this.group, 'pointerdown', this._onStart)
    } else {
      utils.on(this.group, 'mousedown', this._onStart)
    }
  }
  
  _onMoveEvents() {
    if (this.supportPointer) {
      utils.on(document, 'pointermove', this._onMove)
    } else {
      utils.on(document, 'mousemove', this._onMove)
    }
  }

  _onUpEvents() {
    if (this.supportPointer) {
      utils.on(document, 'pointerup', this._onDrop)
    } else {
      utils.on(document, 'mouseup', this._onDrop)
    }
  }

  _unbindEventListener() {
    utils.off(this.group, 'mousedown', this._onStart)
    utils.off(this.group, 'pointerdown', this._onStart)
  }

  _offMoveEvents() {
    utils.off(document, 'mousemove', this._onMove)
    utils.off(document, 'pointermove', this._onMove)
  }

  _offUpEvents() {
    utils.off(document, 'mouseup', this._onDrop)
    utils.off(document, 'pointerup', this._onDrop)
  }
}

export default Sortable