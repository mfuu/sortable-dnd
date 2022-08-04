import {
  on,
  off,
  css,
  expando,
  matches,
  getRect,
  getEvent,
  throttle,
  debounce,
  lastChild,
  getOffset,
  isChildOf,
  _nextTick,
  getElement,
  toggleClass,
  isHTMLElement,
  offsetChanged,
  getParentAutoScrollElement
} from './utils.js'
import { IOS, Edge, Safari, IE11OrLess, ChromeForAndroid } from './Brower.js'
import { Ghost, Differ, State } from './Plugins.js'
import AutoScroll from './Autoscroll.js'
import Animation from './Animation.js'

// -------------------------------- Sortable ----------------------------------
const documentExists = typeof document !== 'undefined'
const supportDraggable = documentExists && !ChromeForAndroid && !IOS && ('draggable' in document.createElement('div'))

const sortables = []

let rootEl,
    dragEl,
    dropEl,
    ghostEl,
    fromGroup,
    activeGroup,
    state = new State, // Status record during drag and drop
    differ = new Differ() // Record the difference before and after dragging

const _prepareGroup = function (options) {
  let group = {}
  let originalGroup = options.group

  if (!originalGroup || typeof originalGroup != 'object') {
    originalGroup = { name: originalGroup }
  }

  group.name = originalGroup.name
  group.pull = originalGroup.pull
  group.put = originalGroup.put

  options.group = group
}

/**
 * get nearest Sortable
 */
const _nearestSortable = function(evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt
    const { clientX, clientY } = evt
    const nearest = _detectNearestSortable(clientX, clientY)

    if (nearest) {
      // Create imitation event
      let event = {}
      for (let i in evt) {
        event[i] = evt[i]
      }
      event.target = document.elementFromPoint(clientX, clientY)
      event.rootEl = nearest
      event.preventDefault = void 0
      event.stopPropagation = void 0
      
      nearest[expando]._triggerEvent(event)
    }
  }
}
/**
 * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
 * @param  {Number} x      X position
 * @param  {Number} y      Y position
 * @return {HTMLElement}   Element of the first found nearest Sortable
 */
const _detectNearestSortable = function(x, y) {
  let result
  sortables.some((sortable) => {
    const threshold = sortable[expando].options.emptyInsertThreshold
    if (!threshold) return

    const rect = getRect(sortable),
      insideHorizontally = x >= (rect.left - threshold) && x <= (rect.right + threshold),
      insideVertically = y >= (rect.top - threshold) && y <= (rect.bottom + threshold)

    if (insideHorizontally && insideVertically) {
      return (result = sortable)
    }
  })
  return result
}

let lastPosition = { x: 0, y: 0 }
const _positionChanged = function(evt) {
  const { clientX, clientY } = evt
  const distanceX = clientX - lastPosition.x
  const distanceY = clientY - lastPosition.y

  lastPosition.x = clientX
  lastPosition.y = clientY

  if ((clientX !== void 0 && Math.abs(distanceX) <= 0) && (clientY !== void 0 && Math.abs(distanceY) <= 0)) {
    return false
  }

  return true
}

/**
 * @class  Sortable
 * @param  {HTMLElement}  el group element
 * @param  {Object}       options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
		throw `Sortable: \`el\` must be an HTMLElement, not ${ {}.toString.call(el) }`;
	}

  el[expando] = this

  this.el = el
  this.scrollEl = getParentAutoScrollElement(el, true) // scroll element
  this.options = options = Object.assign({}, options)
  this.ownerDocument = el.ownerDocument

  const defaults = {
    group: '', // string: 'group' or object: { name: 'group', put: true | false, pull: true | false }
    animation: 150, // Define the timing of the sorting animation

    draggable: undefined, // String: css selector, Function: (e) => return true
    onDrag: undefined, // The callback function triggered when dragging starts: () => {}
    onMove: undefined, // The callback function during drag and drop: (from, to) => {}
    onDrop: undefined, // The callback function when the drag is completed: (from, to, changed) => {}
    onChange: undefined, // The callback function when dragging an element to change its position: (from, to) => {}

    autoScroll: true, // Auto scrolling when dragging to the edge of the container
    scrollStep: 5, // The distance to scroll each frame
    scrollThreshold: 15, // Autoscroll threshold
    
    delay: 0, // Defines the delay time after which the mouse-selected list cell can start dragging
    delayOnTouchOnly: false, // only delay if user is using touch
    disabled: false, // Defines whether the sortable object is available or not. When it is true, the sortable object cannot drag and drop sorting and other functions. When it is false, it can be sorted, which is equivalent to a switch.

    ghostAnimation: 0, // Animation when the ghost element is destroyed
    ghostClass: '', // Ghost element class name
    ghostStyle: {}, // Ghost element style
    chosenClass: '', // Chosen element style

    fallbackOnBody: false,
    forceFallback: false, // Ignore HTML5 drag and drop behavior, force callback to proceed
    stopPropagation: false, // Prevents further propagation of the current event in the capture and bubbling phases

    supportPointer: ('PointerEvent' in window) && !Safari,
    supportTouch: 'ontouchstart' in window,
    emptyInsertThreshold: 5
  }

  // Set default options
  for (const name in defaults) {
    !(name in this.options) && (this.options[name] = defaults[name])
  }

  this.container = this.options.fallbackOnBody ? document.body : el
  this.nativeDraggable = this.options.forceFallback ? false : supportDraggable

  this.ghost = new Ghost(this) // Mask element while dragging
  this.dragStartTimer = null // setTimeout timer
  this.autoScrollTimer = null

  _prepareGroup(options)

  // Bind all private methods
	for (let fn in this) {
		if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
			this[fn] = this[fn].bind(this)
		}
	}

  const { supportPointer, supportTouch } = this.options
  if (supportPointer) {
    on(el, 'pointerdown', this._onDrag)
  } else if (supportTouch) {
    on(el, 'touchstart', this._onDrag)
  } else {
    on(el, 'mousedown', this._onDrag)
  }

  sortables.push(el)

  Object.assign(this, Animation(), AutoScroll())
}

Sortable.prototype = {
  constructor: Sortable,

  // -------------------------------- public methods ----------------------------------
  /**
   * Destroy
   */
  destroy: function() {
    this.el[expando] = null

    off(this.el, 'pointerdown', this._onDrag)
    off(this.el, 'touchstart', this._onDrag)
    off(this.el, 'mousedown', this._onDrag)

    this._clearState()
    // Remove draggable attributes
		Array.prototype.forEach.call(this.el.querySelectorAll('[draggable]'), function (el) {
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
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || this.options.disabled || this.options.group.pull === false) return true // only left button and enabled

    const { touch, e, target } = getEvent(evt)

    // Safari ignores further event handling after mousedown
		if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') return true
    if (target === this.el) return true

    if (this.options.stopPropagation) evt.stopPropagation && evt.stopPropagation() // prevent events from bubbling

    const { draggable } = this.options
    if (typeof draggable === 'function') {
      // Function type must return a HTMLElement if used to specifies the drag el
      const value = draggable(e)
      if (!value) return true
      if (isHTMLElement(value)) dragEl = value // set drag element
    } else if (typeof draggable === 'string') {
      // String use as 'tag' or '.class' or '#id'
      if (!matches(target, draggable)) return true
    } else if (draggable) {
      throw new Error(`draggable expected "function" or "string" but received "${typeof draggable}"`)
    }

    // Get the dragged element               
    if (!dragEl) dragEl = getElement(this.el, target, true)

    // No dragging is allowed when there is no dragging element
    if (!dragEl || dragEl.animated) return true

    // solve the problem that the mobile cannot be dragged
    if (touch) dragEl.style['touch-action'] = 'none'
    
    fromGroup = this.el
    // get the position of the dragged element in the list
    const { rect, offset } = getElement(this.el, dragEl)
    differ.from = { sortable: this, group: this.el, node: dragEl, rect, offset}

    this.ghost.distance = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    this.ghost.initPos = { x: e.clientX, y: e.clientY }

    state.sortableDown = e // sortable state down is active

    on(this.ownerDocument, 'dragover', _nearestSortable)
    on(this.ownerDocument, 'mousemove', _nearestSortable)
    on(this.ownerDocument, 'touchmove', _nearestSortable)
    on(this.ownerDocument, 'pointermove', _nearestSortable)
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

    rootEl = this.el
    activeGroup = this.options.group

    if (!this.nativeDraggable || touch) {
      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', this._onMove)
      } else if (touch) {
        on(this.ownerDocument, 'touchmove', this._onMove)
      } else {
        on(this.ownerDocument, 'mousemove', this._onMove)
      }
      
      on(this.ownerDocument, 'pointercancel', this._onDrop)
      on(this.ownerDocument, 'touchcancel', this._onDrop)
    } else {
      // allow HTML5 drag event
      dragEl.draggable = true

      on(dragEl, 'dragend', this)
      on(rootEl, 'dragstart', this._onDragStart)
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

  // -------------------------------- trigger ----------------------------------
  _triggerEvent(evt) {
    if (activeGroup.name !== this.options.group.name) return

    rootEl = evt.rootEl

    if (this.nativeDraggable) {
      on(this.el, 'dragend', this._onDrop)
      this._onDragOver(evt)
    } else {
      this._onMove(evt)
    }
  },

  // -------------------------------- drag event ----------------------------------
  _onDragStart: function(evt) {
    // elements can only be dragged after firefox sets setData
    if (evt.dataTransfer) {
      evt.dataTransfer.setData('DRAGGABLE_EFFECT', evt.target.innerText)
      evt.dataTransfer.effectAllowed = 'move'
    }
    
    on(this.el, 'dragover', this._onDragOver)
    on(this.el, 'dragend', this._onDrop)
  },

  _onDragOver: function(evt) {
    if (!state.sortableDown || !dragEl) return
    this._preventEvent(evt)

    // truly started
    this._onStarted(evt, evt)

    if (!evt.rootEl) return

    if (_positionChanged(evt)) {
      // onMove callback
      this._dispatchEvent('onMove', { ...differ, ghostEl, event: evt, originalEvent: evt })

      if (this.options.group.put || fromGroup === this.el) this._onChange(evt.target, evt, evt)
    }
  },

  // -------------------------------- real started ----------------------------------
  _onStarted: function(e, /** originalEvent */evt) {
    state.sortableMove = e // sortable state move is active
    if (!ghostEl) {
      // onDrag callback
      this._dispatchEvent('onDrag', { dragEl, event: e, originalEvent: evt })

      // Init in the move event to prevent conflict with the click event
      const { rect } = differ.from
      ghostEl = dragEl.cloneNode(true)
      this.ghost.init(ghostEl, rect, !this.nativeDraggable)
      Sortable.ghost = ghostEl

      // add class for drag element
      toggleClass(dragEl, this.options.chosenClass, true)
      dragEl.style['will-change'] = 'transform'

      if (this.nativeDraggable) {
        this._unbindDropEvents()
        on(document, 'drop', this)
      }

      if (evt.dataTransfer) evt.dataTransfer.dropEffect = 'move'
      if (Safari) css(document.body, 'user-select', 'none')
    }
  },

  // -------------------------------- on move ----------------------------------
  _onMove: function(/** Event|TouchEvent */evt) {
    if (!state.sortableDown || !dragEl) return

    this._preventEvent(evt)

    const { e, target } = getEvent(evt)

    this._onStarted(e, evt)
    this.ghost.move(e.clientX, e.clientY)

    if (!evt.rootEl) return

    // onMove callback
    this._dispatchEvent('onMove', { ...differ, ghostEl, event: e, originalEvent: evt })

    // check if element will exchange
    if (this.options.group.put || fromGroup === this.el) this._onChange(target, e, evt)

    // auto scroll
    clearTimeout(this.autoScrollTimer)
    if (this.options.autoScroll) {
      this.autoScrollTimer = setTimeout(() => this._autoScroll(this, state), 0)
    }
  },

  // -------------------------------- on change ----------------------------------
  _onChange: debounce(function(target, e, evt) {
    if (!dragEl) return
    if (!lastChild(this.el)) {
      differ.to = { sortable: this, group: this.el, node: dragEl, rect: getRect(dragEl), offset: getOffset(dragEl) }
      // onRemove callback
      differ.from.sortable._dispatchEvent('onRemove', { ...differ, event: e, originalEvent: evt })
      // onAdd callback
      this._dispatchEvent('onAdd', { ...differ, event: e, originalEvent: evt })

      this.el.appendChild(dragEl)

      differ.from.sortable = this
      differ.from.group = this.el
    } else {
      const { el, rect, offset } = getElement(rootEl, target)
      if (!el || (el && el.animated) || el === dragEl) return

      dropEl = el
      differ.to = { sortable: this, group: this.el, node: dropEl, rect, offset }

      const { clientX, clientY } = e
      const { left, right, top, bottom } = rect

      // swap when the elements before and after the drag are inconsistent
      if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
        this._captureAnimationState(dragEl, dropEl)

        if (isChildOf(dragEl, rootEl) === false) {
          // onRemove callback
          differ.from.sortable._dispatchEvent('onRemove', { ...differ, event: e, originalEvent: evt })
          // onAdd callback
          this._dispatchEvent('onAdd', { ...differ, event: e, originalEvent: evt })

          this.el.insertBefore(dragEl, el)

          differ.from.sortable = this
          differ.from.group = this.el
        } else {
          // onChange callback
          this._dispatchEvent('onChange', { ...differ, event: e, originalEvent: evt })

          // the top value is compared first, and the left is compared if the top value is the same
          const _offset = getOffset(dragEl)
          if (_offset.top < offset.top || _offset.left < offset.left) {
            this.el.insertBefore(dragEl, el.nextElementSibling)
          } else {
            this.el.insertBefore(dragEl, el)
          }

          differ.from.sortable = this
          differ.from.group = this.el
        }

        this._rangeAnimate()
      }
    }
    
  }, 5),

  // -------------------------------- on drop ----------------------------------
  _onDrop: function(/** Event|TouchEvent */evt) {
    this._unbindDragEvents()
    this._unbindMoveEvents()
    this._unbindDropEvents()

    this._preventEvent(evt)
    
    this.dragStartTimer && clearTimeout(this.dragStartTimer)

    if (dragEl) {
      if (this.nativeDraggable) off(dragEl, 'dragend', this)

      const { touch } = getEvent(evt)
      // clear style, attrs and class
      toggleClass(dragEl, this.options.chosenClass, false)
      if (this.nativeDraggable) dragEl.draggable = false
      if (touch) dragEl.style['touch-action'] = ''
      dragEl.style['will-change'] = ''

      if (state.sortableDown && state.sortableMove) {
        // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
        differ.to.offset = getOffset(dragEl)
        differ.to.rect = getRect(dragEl)
  
        const changed = offsetChanged(differ.from.offset, differ.to.offset)
        this._dispatchEvent('onDrop', { changed, event: evt, originalEvent: evt })
      }
    }

    if (Safari) css(document.body, 'user-select', '')
    this.ghost.destroy(differ.to.rect)
    this._clearState()
  },
  
  // -------------------------------- event ----------------------------------
  _preventEvent: function(evt) {
    if (this.options.stopPropagation) evt.stopPropagation && evt.stopPropagation() // prevent events from bubbling
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault()
  },

  _dispatchEvent: function(event, params) {
    const callback = this.options[event]
    if (typeof callback === 'function') callback(params)
  },

  // -------------------------------- clear ----------------------------------
  _clearState: function() {
    state = new State
    differ.destroy()
    dragEl = 
    dropEl = 
    ghostEl = 
    fromGroup = 
    activeGroup = null
    lastPosition = { x: 0, y: 0 }
  },

  _unbindDragEvents: function() {
    if (this.nativeDraggable) {
      off(this.el, 'dragstart', this._onDragStart)
      off(this.el, 'dragover', this._onDragOver)
      off(this.el, 'dragend', this._onDrop)

      off(document, 'drop', this)
    }
  },

  _unbindMoveEvents: function() {
    off(this.ownerDocument, 'pointermove', this._onMove)
    off(this.ownerDocument, 'touchmove', this._onMove)
    off(this.ownerDocument, 'mousemove', this._onMove)
    off(this.ownerDocument, 'pointermove', _nearestSortable)
    off(this.ownerDocument, 'touchmove', _nearestSortable)
    off(this.ownerDocument, 'mousemove', _nearestSortable)
    off(this.ownerDocument, 'dragover', _nearestSortable)
  },

  _unbindDropEvents: function() {
    off(this.ownerDocument, 'pointerup', this._onDrop)
    off(this.ownerDocument, 'pointercancel', this._onDrop)
    off(this.ownerDocument, 'touchend', this._onDrop)
    off(this.ownerDocument, 'touchcancel', this._onDrop)
    off(this.ownerDocument, 'mouseup', this._onDrop)
  }
}

Sortable.prototype.utils = {
  getRect,
  getOffset,
  debounce,
  throttle,
}

export default Sortable
