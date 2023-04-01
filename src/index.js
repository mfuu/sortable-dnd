import {
  on,
  off,
  css,
  events,
  expando,
  matches,
  getRect,
  getEvent,
  lastChild,
  getOffset,
  _nextTick,
  getElement,
  toggleClass,
  isHTMLElement,
  offsetChanged,
  getParentAutoScrollElement,
  randomCode,
} from './utils.js';
import { Edge, Safari, IE11OrLess } from './utils.js';
import Multiple, { getMultiDiffer } from './Plugins/Multiple.js';
import AutoScroll from './Plugins/AutoScroll.js';
import Animation from './Plugins/Animation.js';
import Helper from './helper.js';

const FromTo = {
  sortable: null,
  group: null,
  node: null,
  rect: {},
  offset: {},
};

// -------------------------------- Sortable ----------------------------------
let sortables = [];

let rootEl,
  dragEl,
  dropEl,
  downEvent,
  moveEvent,
  isMultiple,
  activeGroup,
  autoScroller,
  dragStartTimer, // timer for start to drag
  helper = new Helper();

let differFrom = { ...FromTo };
let differTo = { ...FromTo };

let distance = { x: 0, y: 0 };
let lastPosition = { x: 0, y: 0 };

const _prepareGroup = function (options, uniqueId) {
  let group = {};
  let originalGroup = options.group;

  if (!originalGroup || typeof originalGroup != 'object') {
    originalGroup = { name: originalGroup, pull: true, put: true };
  }

  group.name = originalGroup.name || uniqueId;
  group.pull = originalGroup.pull;
  group.put = originalGroup.put;

  options.group = group;
};

/**
 * get nearest Sortable
 */
const _nearestSortable = function (evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt;
    const { clientX, clientY } = evt;
    const nearest = _detectNearestSortable(clientX, clientY);

    if (nearest) {
      // Create imitation event
      let event = {};
      for (let i in evt) {
        event[i] = evt[i];
      }
      event.target = document.elementFromPoint(clientX, clientY);
      rootEl = nearest;
      event.preventDefault = void 0;
      event.stopPropagation = void 0;
      if (rootEl === downEvent.group) return;
      nearest[expando]._onMove(event);
    }
  }
};
/**
 * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
 * @param  {Number} x      X position
 * @param  {Number} y      Y position
 * @return {HTMLElement}   Element of the first found nearest Sortable
 */
const _detectNearestSortable = function (x, y) {
  let result;
  sortables.some((sortable) => {
    const threshold = sortable[expando].options.emptyInsertThreshold;
    if (!threshold) return;

    const rect = getRect(sortable, { parent: true }),
      insideHorizontally =
        x >= rect.left - threshold && x <= rect.right + threshold,
      insideVertically =
        y >= rect.top - threshold && y <= rect.bottom + threshold;

    if (insideHorizontally && insideVertically) {
      return (result = sortable);
    }
  });
  return result;
};

const _positionChanged = function (evt) {
  const { clientX, clientY } = evt;
  const distanceX = clientX - lastPosition.x;
  const distanceY = clientY - lastPosition.y;

  lastPosition.x = clientX;
  lastPosition.y = clientY;

  if (
    clientX !== void 0 &&
    clientY !== void 0 &&
    Math.abs(distanceX) <= 0 &&
    Math.abs(distanceY) <= 0
  ) {
    return false;
  }

  return true;
};

const _emitDiffer = function () {
  if (isMultiple) {
    let ft = getMultiDiffer();
    return {
      from: {
        ...ft.from,
        sortable: differFrom.sortable,
        group: differFrom.group,
      },
      to: { ...ft.to, sortable: differTo.sortable, group: differTo.group },
    };
  } else {
    return { from: { ...differFrom }, to: { ...differTo } };
  }
};

/**
 * @class  Sortable
 * @param  {HTMLElement}  el group element
 * @param  {Object}       options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw `Sortable: \`el\` must be an HTMLElement, not ${{}.toString.call(
      el
    )}`;
  }

  el[expando] = this;

  this.el = el;
  this.ownerDocument = el.ownerDocument;
  this.scrollEl = getParentAutoScrollElement(el, true); // scroll element
  this.options = options = Object.assign({}, options);

  const defaults = {
    group: '', // string: 'group' or object: { name: 'group', put: true | false, pull: true | false }
    animation: 150, // Define the timing of the sorting animation

    multiple: false, // Enable multi-drag

    draggable: undefined, // String: css selector, Function: (e) => return (true || HTMLElement)
    onDrag: undefined, // The callback function triggered when dragging starts
    onMove: undefined, // The callback function during drag and drop
    onDrop: undefined, // The callback function when the drag is completed
    onChange: undefined, // The callback function when dragging an element to change its position

    autoScroll: true,
    scrollThreshold: 25, // Autoscroll threshold

    delay: 0, // Defines the delay time after which the mouse-selected list cell can start dragging
    delayOnTouchOnly: false, // only delay if user is using touch
    disabled: false, // Defines whether the sortable object is available or not. When it is true, the sortable object cannot drag and drop sorting and other functions. When it is false, it can be sorted, which is equivalent to a switch.

    ghostClass: '', // Ghost element class name
    ghostStyle: {}, // Ghost element style
    chosenClass: '', // Chosen element style
    selectedClass: '', // The style of the element when it is selected

    fallbackOnBody: false, // Appends the cloned DOM Element into the Document's Body
    stopPropagation: false, // Prevents further propagation of the current event in the capture and bubbling phases

    supportPointer: 'onpointerdown' in window && !Safari,
    supportTouch: 'ontouchstart' in window,
    emptyInsertThreshold: 5,
  };

  // Set default options
  for (const name in defaults) {
    !(name in this.options) && (this.options[name] = defaults[name]);
  }

  _prepareGroup(options, 'group_' + randomCode());

  // Bind all private methods
  for (let fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }

  const { supportPointer, supportTouch } = this.options;
  if (supportPointer) {
    on(el, 'pointerdown', this._onDrag);
  } else if (supportTouch) {
    on(el, 'touchstart', this._onDrag);
  } else {
    on(el, 'mousedown', this._onDrag);
  }

  sortables.push(el);

  this.multiplayer = new Multiple(this.options);
  this.animator = new Animation();
  autoScroller = new AutoScroll();
}

Sortable.prototype = {
  constructor: Sortable,

  get helper() {
    return helper.node;
  },

  // -------------------------------- public methods ----------------------------------
  /**
   * Destroy
   */
  destroy: function () {
    this._dispatchEvent('destroy', this);
    this.el[expando] = null;

    for (let i = 0; i < events.start.length; i++) {
      off(this.el, events.start[i], this._onDrag);
    }

    // clear status
    this._clearState();

    sortables.splice(sortables.indexOf(this.el), 1);
    if (sortables.length == 0) autoScroller = null;
    this.el = null;
  },

  // -------------------------------- prepare start ----------------------------------
  _onDrag: function (/** Event|TouchEvent */ evt) {
    if (dragEl || this.options.disabled || !this.options.group.pull) return;
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return true; // only left button and enabled

    const { touch, e, target } = getEvent(evt);

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT')
      return true;
    if (target === this.el) return true;

    const { draggable } = this.options;
    if (typeof draggable === 'function') {
      // Function type must return a HTMLElement if used to specifies the drag el
      const element = draggable(e);
      if (!element) return true;
      // set drag element
      if (isHTMLElement(element)) dragEl = element;
    } else if (typeof draggable === 'string') {
      // String use as 'TagName' or '.class' or '#id'
      if (!matches(target, draggable)) return true;
    } else if (draggable) {
      throw new Error(
        `draggable expected "function" or "string" but received "${typeof draggable}"`
      );
    }

    // Get the dragged element
    if (!dragEl) dragEl = getElement(this.el, target, true);

    // No dragging is allowed when there is no dragging element
    if (!dragEl || dragEl.animated) return true;

    // solve the problem that the mobile cannot be dragged
    if (touch) dragEl.style['touch-action'] = 'none';

    downEvent = e;
    downEvent.sortable = this;
    downEvent.group = dragEl.parentNode;

    isMultiple = this.options.multiple && this.multiplayer.allowDrag(dragEl);
    // multi-drag
    if (isMultiple) this.multiplayer.onDrag(dragEl, this);

    // get the position of the dragged element in the list
    const { rect, offset } = getElement(this.el, dragEl);
    differFrom = {
      sortable: this,
      group: dragEl.parentNode,
      node: dragEl,
      rect,
      offset,
    };
    differTo.group = dragEl.parentNode;
    differTo.sortable = this;

    distance = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // enable drag between groups
    if (this.options.supportPointer) {
      on(this.ownerDocument, 'pointermove', _nearestSortable);
    } else if (touch) {
      on(this.ownerDocument, 'touchmove', _nearestSortable);
    } else {
      on(this.ownerDocument, 'mousemove', _nearestSortable);
    }

    const { delay, delayOnTouchOnly } = this.options;
    if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
      clearTimeout(dragStartTimer);
      // delay to start
      dragStartTimer = setTimeout(() => this._onStart(e, touch), delay);
    } else {
      this._onStart(e, touch);
    }
  },

  _onStart: function (/** Event|TouchEvent */ e, touch) {
    rootEl = this.el;
    activeGroup = this.options.group;

    if (this.options.supportPointer) {
      on(this.ownerDocument, 'pointermove', this._onMove);
      on(this.ownerDocument, 'pointerup', this._onDrop);
      on(this.ownerDocument, 'pointercancel', this._onDrop);
    } else if (touch) {
      on(this.ownerDocument, 'touchmove', this._onMove);
      on(this.ownerDocument, 'touchend', this._onDrop);
      on(this.ownerDocument, 'touchcancel', this._onDrop);
    } else {
      on(this.ownerDocument, 'mousemove', this._onMove);
      on(this.ownerDocument, 'mouseup', this._onDrop);
    }

    // clear selection
    try {
      if (document.selection) {
        // Timeout neccessary for IE9
        _nextTick(() => {
          document.selection.empty();
        });
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (error) {}
  },

  // -------------------------------- real started ----------------------------------
  _onTrulyStarted: function (e, /** originalEvent */ evt) {
    if (!moveEvent) {
      // on-drag
      this._dispatchEvent('onDrag', { ..._emitDiffer(), event: evt });
      // on-multi-drag
      if (isMultiple) this.multiplayer.onTrulyStarted(dragEl, this);

      // Init in the move event to prevent conflict with the click event
      const element = isMultiple ? this.multiplayer.getHelper() : dragEl;
      helper.init(dragEl, element, this.el, this.options, distance);

      // add class for drag element
      toggleClass(dragEl, this.options.chosenClass, true);
      dragEl.style['will-change'] = 'transform';

      if (Safari) css(document.body, 'user-select', 'none');
    }

    moveEvent = e; // sortable state move is active
  },

  // -------------------------------- move ----------------------------------
  _onMove: function (/** Event|TouchEvent */ evt) {
    this._preventEvent(evt);
    if (!downEvent || !dragEl) return;
    if (!_positionChanged(evt)) return;

    const { e, target } = getEvent(evt);
    // truly started
    this._onTrulyStarted(e, evt);

    const x = evt.clientX - downEvent.clientX;
    const y = evt.clientY - downEvent.clientY;
    helper.move(x, y);

    let allowPut = this._allowPut();
    // on-move
    this._dispatchEvent('onMove', { ..._emitDiffer(), event: evt });
    // check if element will exchange
    if (allowPut) this._onChange(target, e, evt);
    // auto scroll
    const { autoScroll, scrollThreshold } = this.options;
    if (autoScroll) {
      autoScroller.update(this.el, scrollThreshold, downEvent, moveEvent);
    }
  },

  _allowPut: function () {
    if (downEvent.group === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name } = this.options.group;
      return activeGroup.name && name && activeGroup.name === name;
    }
  },

  // -------------------------------- on change ----------------------------------
  _onChange: function (target, e, evt) {
    if (!differFrom.group) return;
    if (
      !lastChild(rootEl, helper.node) ||
      (target === rootEl && differFrom.group !== rootEl)
    ) {
      differFrom.sortable.animator.collect(dragEl, dragEl);

      if (isMultiple) this.multiplayer.onChange(dragEl, this, rootEl);
      differTo = {
        sortable: this,
        group: rootEl,
        node: dragEl,
        rect: getRect(dragEl),
        offset: getOffset(dragEl),
      };
      // on-remove
      differFrom.sortable._dispatchEvent('onRemove', {
        ..._emitDiffer(),
        event: evt,
      });

      rootEl.appendChild(dragEl);

      // on-add
      this._dispatchEvent('onAdd', { ..._emitDiffer(), event: evt });

      differFrom.sortable.animator.animate();
      differFrom.group = rootEl;
    } else {
      const { el, rect, offset } = getElement(rootEl, target);
      if (!el || (el && el.animated) || el === dragEl) return;

      dropEl = el;

      if (isMultiple) this.multiplayer.onChange(dragEl, this);
      differTo = {
        sortable: this,
        group: dropEl.parentNode,
        node: dropEl,
        rect,
        offset,
      };

      const { clientX, clientY } = e;
      const { left, right, top, bottom } = rect;

      // swap when the elements before and after the drag are inconsistent
      if (
        clientX > left &&
        clientX < right &&
        clientY > top &&
        clientY < bottom
      ) {
        this.animator.collect(dragEl, dropEl);
        if (differFrom.group !== differTo.group) {
          differFrom.sortable.animator.collect(dragEl, dropEl);
          // on-remove
          differFrom.sortable._dispatchEvent('onRemove', {
            ..._emitDiffer(),
            event: evt,
          });

          dropEl.parentNode.insertBefore(dragEl, dropEl);

          // on-add
          this._dispatchEvent('onAdd', { ..._emitDiffer(), event: evt });

          differFrom.sortable.animator.animate();
        } else {
          // on-change
          this._dispatchEvent('onChange', { ..._emitDiffer(), event: evt });

          // the top value is compared first, and the left is compared if the top value is the same
          const _offset = getOffset(dragEl);
          if (_offset.top < offset.top || _offset.left < offset.left) {
            dropEl.parentNode.insertBefore(dragEl, dropEl.nextSibling);
          } else {
            dropEl.parentNode.insertBefore(dragEl, dropEl);
          }
        }
        this.animator.animate();
      }
      differFrom.group = dropEl.parentNode;
    }
    differFrom.sortable = this;
  },

  // -------------------------------- on drop ----------------------------------
  _onDrop: function (/** Event|TouchEvent */ evt) {
    this._unbindMoveEvents();
    this._unbindDropEvents();
    this._preventEvent(evt);
    autoScroller.clear();
    clearTimeout(dragStartTimer);

    // clear style, attrs and class
    if (dragEl) {
      const { touch } = getEvent(evt);
      toggleClass(dragEl, this.options.chosenClass, false);
      if (touch) dragEl.style['touch-action'] = '';
      dragEl.style['will-change'] = '';
    }
    // drag and drop done
    if (dragEl && downEvent && moveEvent) {
      differFrom.group = downEvent.group;
      differFrom.sortable = downEvent.sortable;
      if (isMultiple) {
        this.multiplayer.onDrop(evt, dragEl, this, downEvent, _emitDiffer);
      } else {
        // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
        differTo.rect = getRect(dragEl);
        differTo.offset = getOffset(dragEl);

        const changed = offsetChanged(differFrom.offset, differTo.offset);
        const params = { ..._emitDiffer(), changed, event: evt };
        // on-drop
        if (differTo.group !== downEvent.group) {
          downEvent.sortable._dispatchEvent('onDrop', params);
        }
        this._dispatchEvent('onDrop', params);
      }

      if (Safari) css(document.body, 'user-select', '');
    } else if (this.options.multiple) {
      // click event
      this.multiplayer.select(evt, dragEl, this);
    }

    this._clearState();
  },

  // -------------------------------- event ----------------------------------
  _preventEvent: function (evt) {
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
    if (this.options.stopPropagation)
      evt.stopPropagation && evt.stopPropagation(); // prevent events from bubbling
  },
  _dispatchEvent: function (event, params) {
    const callback = this.options[event];
    if (typeof callback === 'function') callback(params);
  },

  // -------------------------------- clear ----------------------------------
  _clearState: function () {
    dragEl =
      dropEl =
      downEvent =
      moveEvent =
      isMultiple =
      activeGroup =
      dragStartTimer =
      Sortable.ghost =
        null;
    distance = lastPosition = { x: 0, y: 0 };
    differFrom = differTo = { ...FromTo };
    helper.destroy();
  },
  _unbindMoveEvents: function () {
    for (let i = 0; i < events.move.length; i++) {
      off(this.ownerDocument, events.move[i], this._onMove);
      off(this.ownerDocument, events.move[i], _nearestSortable);
    }
  },
  _unbindDropEvents: function () {
    for (let i = 0; i < events.end.length; i++) {
      off(this.ownerDocument, events.end[i], this._onDrop);
    }
  },
};

Sortable.prototype.utils = {
  getRect,
  getOffset,
};

export default Sortable;
