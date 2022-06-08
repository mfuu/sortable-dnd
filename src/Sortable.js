import {
  on,
  off,
  css,
  matches,
  getRect,
  getEvent,
  throttle,
  debounce,
  getOffset,
  _nextTick,
  getElement,
  toggleClass,
  getParentAutoScrollElement
} from './utils.js'
import { IOS, Edge, Safari, IE11OrLess, ChromeForAndroid } from './Brower.js'
import { Ghost, Differ, State } from './Plugins.js'
import AutoScroll from './Autoscroll.js'
import Animation from './Animation.js'
import Events from './Events.js'

// -------------------------------- Sortable ----------------------------------
const documentExists = typeof document !== 'undefined'
const supportDraggable = documentExists && !ChromeForAndroid && !IOS && ('draggable' in document.createElement('div'))

/**
 * @class  Sortable
 * @param  {HTMLElement}  el group element
 * @param  {Object}       options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
		throw `Sortable: \`el\` must be an HTMLElement, not ${ {}.toString.call(el) }`;
	}

  this.rootEl = el // root element
  this.scrollEl = getParentAutoScrollElement(el, true) // scroll element
  this.options = options = Object.assign({}, options)
  this.ownerDocument = el.ownerDocument

  const defaults = {
    autoScroll: true, // Auto scrolling when dragging to the edge of the container
    scrollStep: 5, // The distance to scroll each frame
    scrollThreshold: 15, // Autoscroll threshold
    
    delay: 0, // Defines the delay time after which the mouse-selected list cell can start dragging
    delayOnTouchOnly: false, // only delay if user is using touch
    disabled: false, // Defines whether the sortable object is available or not. When it is true, the sortable object cannot drag and drop sorting and other functions. When it is false, it can be sorted, which is equivalent to a switch.
    animation: 150, // Define the timing of the sorting animation

    ghostAnimation: 0, // Animation when the ghost element is destroyed
    ghostClass: '', // Ghost element class name
    ghostStyle: {}, // Ghost element style
    chosenClass: '', // Chosen element style
    
    draggable: undefined, // String: css selector, Function: (e) => return true
    dragging: undefined, // Set the drag element, must be a function and must return an HTMLElement: (e) => return e.target
    onDrag: undefined, // The callback function triggered when dragging starts: () => {}
    onMove: undefined, // The callback function during drag and drop: (from, to) => {}
    onDrop: undefined, // The callback function when the drag is completed: (from, to, changed) => {}
    onChange: undefined, // The callback function when dragging an element to change its position: (from, to) => {}

    fallbackOnBody: false,
    forceFallback: false, // Ignore HTML5 drag and drop behavior, force callback to proceed
    stopPropagation: false, // Prevents further propagation of the current event in the capture and bubbling phases

    supportPointer: ('PointerEvent' in window) && !Safari,
    supportTouch: 'ontouchstart' in window,
  }

  // Set default options
  for (const name in defaults) {
    !(name in this.options) && (this.options[name] = defaults[name])
  }

  this.container = this.options.fallbackOnBody ? document.body : this.rootEl
  this.nativeDraggable = this.options.forceFallback ? false : supportDraggable

  this.move = { x: 0, y: 0 }
  this.state = new State // Status record during drag and drop
  this.differ = new Differ() // Record the difference before and after dragging
  this.ghost = new Ghost(this) // Mask element while dragging
  this.dragEl = null // Drag element
  this.dropEl = null // Drop element
  this.dragStartTimer = null // setTimeout timer
  this.autoScrollTimer = null

  Object.assign(
    this,
    Events(),
    Animation(),
    AutoScroll(),
  )
  this._bindEventListener()
}

Sortable.prototype = {
  constructor: Sortable,

  /**
   * Destroy
   */
  destroy: function() {
    this._clearState()
    this._clearEvent()
    // Remove draggable attributes
		Array.prototype.forEach.call(this.rootEl.querySelectorAll('[draggable]'), function (el) {
			el.removeAttribute('draggable')
		})
  },

  /**
   * set value for options by key
   */
  set (key, value) {
    this.options[key] = value
  },

  /**
   * get value from options by key
   */
  get (key) {
    return this.options[key]
  },

  // -------------------------------- prepare start ----------------------------------
  _onDrag: function(/** Event|TouchEvent */evt) {
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || this.options.disabled) return // only left button and enabled

    const { touch, e, target } = getEvent(evt)

    // Safari ignores further event handling after mousedown
		if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') return
    if (target === this.rootEl) return true

    if (this.options.stopPropagation) evt.stopPropagation()

    const { draggable, dragging } = this.options

    if (typeof draggable === 'function') {
      if (!draggable(e)) return true

    } else if (typeof draggable === 'string') {
      if (!matches(target, draggable)) return true

    } else if (draggable !== undefined) {
      throw new Error(`draggable expected "function" or "string" but received "${typeof draggable}"`)
    }

    // Get the dragged element               
    if (dragging) {
      if (typeof dragging === 'function') this.dragEl = dragging(e)
      else throw new Error(`dragging expected "function" or "string" but received "${typeof dragging}"`)
    } else {
      this.dragEl = getElement(this.rootEl, target, true)
    }

    // No dragging is allowed when there is no dragging element
    if (!this.dragEl || this.dragEl.animated) return true

    // solve the problem that the mobile cannot be dragged
    if (touch) this.dragEl.style['touch-action'] = 'none'
    
    // get the position of the dragged element in the list
    const { rect, offset } = getElement(this.rootEl, this.dragEl)
    this.move = { x: e.clientX, y: e.clientY }
    this.differ.from = { node: this.dragEl, rect, offset}
    this.ghost.distance = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    this.state.sortableDown = e // sortable state down is active

    // Solve the problem that `dragend` does not take effect when the `dragover` event is not triggered
    on(this.ownerDocument, 'pointerup', this._onDrop)
    on(this.ownerDocument, 'touchend', this._onDrop)
    on(this.ownerDocument, 'mouseup', this._onDrop)

    const { delay, delayOnTouchOnly } = this.options
    if (delay && (!delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
      clearTimeout(this.dragStartTimer)
      // delay to start
      this.dragStartTimer = setTimeout(() => this._onStart(e, touch), delay)
    } else {
      this._onStart(e, touch)
    }
  },
  _onStart: function(/** Event|TouchEvent */e, touch) {
    if (!this.nativeDraggable || touch) {
      this._bindMoveEvents(touch)
      on(this.ownerDocument, 'pointercancel', this._onDrop)
      on(this.ownerDocument, 'touchcancel', this._onDrop)
    } else {
      // allow HTML5 drag event
      this.dragEl.draggable = true

      this._onDragStart = this._onDragStart.bind(this)
      this._onDragOver = this._onDragOver.bind(this)
      on(this.rootEl, 'dragstart', this._onDragStart)
    }

    // clear selection
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
  },

  // -------------------------------- drag event ----------------------------------
  _onDragStart: function(evt) {
    // elements can only be dragged after firefox sets setData
    evt.dataTransfer.setData('te', evt.target.innerText)
    
    on(this.rootEl, 'dragover', this._onDragOver)
    on(this.rootEl, 'dragend', this._onDrop)
  },

  _onDragOver: function(evt) {
    if (!this.state.sortableDown) return
    const { stopPropagation } = this.options
    stopPropagation && evt.stopPropagation && evt.stopPropagation() // prevent events from bubbling
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault() // prevent scrolling

    const { clientX, clientY } = evt
    const distanceX = clientX - this.move.x
    const distanceY = clientY - this.move.y

    if ((clientX !== void 0 && Math.abs(distanceX) <= 0) && (clientY !== void 0 && Math.abs(distanceY) <= 0)) {
      return
    }
    // truly started
    this._onStarted(evt, evt)

    if (evt.target === this.rootEl) return
    this._onChange(this, evt.target, evt, evt)
  },

  // -------------------------------- on move ----------------------------------
  _onMove: function(/** Event|TouchEvent */evt) {
    if (!this.state.sortableDown) return
    const { touch, e, target } = getEvent(evt)
    const { clientX, clientY } = e
    const distanceX = clientX - this.move.x
    const distanceY = clientY - this.move.y

    if ((clientX !== void 0 && Math.abs(distanceX) <= 0) && (clientY !== void 0 && Math.abs(distanceY) <= 0)) {
      return
    }

    const { stopPropagation } = this.options
    stopPropagation && evt.stopPropagation && evt.stopPropagation() // prevent events from bubbling
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault() // prevent scrolling

    this._onStarted(e, evt)
    this.ghost.move(distanceX, distanceY)

    // onMove callback
    const { onMove } = this.options
    if (onMove && typeof onMove === 'function') onMove(this.differ.from, this.ghost.$el, e, evt)

    // boundary value judgment
    if (clientX < 0 || clientY < 0) return
    const { top, right, bottom, left } = getRect(this.rootEl)
    if (clientX < left || clientX > right || clientY < top || clientY > bottom) return

    // check if element will exchange
    this._onChange(this, target, e, evt)

    // auto scroll
    this.autoScrollTimer && clearTimeout(this.autoScrollTimer)
    if (this.options.autoScroll) {
      this.autoScrollTimer = setTimeout(() => this._autoScroll(this), 0)
    }
  },
  _onStarted: function(e, /** originalEvent */evt) {
    this.state.sortableMove = e // sortable state move is active
    if (!this.ghost.$el) {
      // onDrag callback
      const { onDrag } = this.options
      if (onDrag && typeof onDrag === 'function') onDrag(this.dragEl, e, evt)

      // Init in the move event to prevent conflict with the click event
      const { rect } = this.differ.from
      const ghostEl = this.dragEl.cloneNode(true)
      this.ghost.init(ghostEl, rect, !this.nativeDraggable)

      // add class for drag element
      toggleClass(this.dragEl, this.options.chosenClass, true)
      this.dragEl.style['will-change'] = 'transform'

      if (Safari) css(document.body, 'user-select', 'none')
      if (this.nativeDraggable) this._unbindDropEvents()
    }
  },
  _onChange: debounce(function(_this, target, e, evt) {
    const { el, rect, offset } = getElement(_this.rootEl, target)
    if (!el || (el && el.animated)) return
    
    _this.dropEl = el
    const { clientX, clientY } = e
    const { left, right, top, bottom } = rect

    if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
      // swap when the elements before and after the drag are inconsistent
      if (el !== _this.dragEl) {
        _this.differ.to = { node: _this.dropEl, rect, offset }

        _this.captureAnimationState()

        const { onChange } = _this.options
        const _offset = getOffset(_this.dragEl)

        // onChange callback
        if (onChange && typeof onChange === 'function') onChange(_this.differ.from, _this.differ.to, e, evt)
        
        // the top value is compared first, and the left is compared if the top value is the same
        if (_offset.top < offset.top || _offset.left < offset.left) {
          _this.rootEl.insertBefore(_this.dragEl, el.nextElementSibling)
        } else {
          _this.rootEl.insertBefore(_this.dragEl, el)
        }

        _this.animateRange()
      }
    }
  }, 5),

  // -------------------------------- on drop ----------------------------------
  _onDrop: function(/** Event|TouchEvent */evt) {
    this._unbindDragEvents()
    this._unbindMoveEvents()
    this._unbindDropEvents()
    this.dragStartTimer && clearTimeout(this.dragStartTimer)

    const { stopPropagation } = this.options
    stopPropagation && evt.stopPropagation()
    evt.preventDefault && evt.preventDefault()

    const { touch } = getEvent(evt)
    // clear style and class
    toggleClass(this.dragEl, this.options.chosenClass, false)
    if (this.nativeDraggable) this.dragEl.draggable = false
    if (touch) this.dragEl.style['touch-action'] = ''
    this.dragEl.style['will-change'] = ''

    if (this.state.sortableDown && this.state.sortableMove) {
      // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
      this.differ.to.offset = getOffset(this.dragEl)
      this.differ.to.rect = getRect(this.dragEl)

      const { from, to } = this.differ
      // compare whether the element is swapped by offset
      const changed = from.offset.top !== to.offset.top || from.offset.left !== to.offset.left
      // onDrop callback
      const { onDrop } = this.options
      if (onDrop && typeof onDrop === 'function') onDrop(changed, evt)
    }
    if (Safari) css(document.body, 'user-select', '')
    this.ghost.destroy(this.differ.to.rect)
    this.state = new State
  },

  // -------------------------------- clear ----------------------------------
  _clearState: function() {
    this.state = new State
    this.differ.destroy()
    this.dragEl = null
    this.dropEl = null
  }
}

Sortable.prototype.utils = {
  getRect,
  getOffset,
  debounce,
  throttle,
  getParentAutoScrollElement
}

export default Sortable
