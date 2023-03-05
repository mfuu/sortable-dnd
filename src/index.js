import {
  on,
  off,
  css,
  expando,
  matches,
  getRect,
  getEvent,
  lastChild,
  getOffset,
  _nextTick,
  getElement,
  toggleClass,
  setTransform,
  setTransition,
  isHTMLElement,
  offsetChanged,
  getParentAutoScrollElement,
} from './utils.js';
import { Edge, Safari, IE11OrLess } from './utils.js';
import AutoScroll from './Plugins/AutoScroll.js';
import Animation from './Plugins/Animation.js';
import Multiple from './Plugins/Multiple.js';

/**
 * Sortable states
 */
class EventState {
  constructor() {
    this.down = undefined;
    this.move = undefined;
  }
  destroy() {
    this.down = undefined;
    this.move = undefined;
  }
}

const FromTo = {
  sortable: null,
  group: null,
  node: null,
  rect: {},
  offset: {},
};

/**
 * Difference before and after dragging
 */
class Difference {
  constructor() {
    this.from = { ...FromTo };
    this.to = { ...FromTo };
  }
  destroy() {
    this.from = { ...FromTo };
    this.to = { ...FromTo };
  }
}

// -------------------------------- Sortable ----------------------------------
const sortables = [];

let rootEl,
  dragEl,
  dropEl,
  ghostEl,
  isMultiple,
  fromGroup,
  activeGroup,
  fromSortable,
  dragStartTimer, // timer for start to drag
  autoScrollAnimationFrame,
  differ = new Difference(), // Record the difference before and after
  eventState = new EventState(); // Status record during drag and move

let distance = { x: 0, y: 0 };
let lastPosition = { x: 0, y: 0 };

const _prepareGroup = function (options) {
  let group = {};
  let originalGroup = options.group;

  if (!originalGroup || typeof originalGroup != 'object') {
    originalGroup = { name: originalGroup, pull: true, put: true };
  }

  group.name = originalGroup.name;
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
      if (rootEl === fromGroup) return;
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
  return { from: { ...differ.from }, to: { ...differ.to } };
};

const _params = function (args) {
  return {
    ...args,
    rootEl,
    dragEl,
    ghostEl,
    fromSortable,
    fromGroup,
    activeGroup,
  };
};

/**
 * @class  Sortable
 * @param  {HTMLElement}  el group element
 * @param  {Object}       options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw `Sortable: \`el\` must be an HTMLElement, not ${{}.toString.call(
      el,
    )}`;
  }

  el[expando] = this;

  this.el = el;
  this.scrollEl = getParentAutoScrollElement(el, true); // scroll element
  this.options = options = Object.assign({}, options);
  this.ownerDocument = el.ownerDocument;

  const defaults = {
    group: '', // string: 'group' or object: { name: 'group', put: true | false, pull: true | false }
    animation: 150, // Define the timing of the sorting animation

    multiple: false, // Enable multi-drag

    draggable: undefined, // String: css selector, Function: (e) => return true
    onDrag: undefined, // The callback function triggered when dragging starts: () => {}
    onMove: undefined, // The callback function during drag and drop: (from, to) => {}
    onDrop: undefined, // The callback function when the drag is completed: (from, to, changed) => {}
    onChange: undefined, // The callback function when dragging an element to change its position: (from, to) => {}

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

  _prepareGroup(options);

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

  Object.assign(this, Animation());

  this.autoScroll = new AutoScroll();

  if (this.options.multiple) {
    Object.assign(this, Multiple());
  }
}

Sortable.prototype = {
  constructor: Sortable,

  // -------------------------------- public methods ----------------------------------
  /**
   * Destroy
   */
  destroy: function () {
    this._dispatchEvent('destroy', this);
    this.el[expando] = null;

    off(this.el, 'pointerdown', this._onDrag);
    off(this.el, 'touchstart', this._onDrag);
    off(this.el, 'mousedown', this._onDrag);

    // clear status
    this._clearState();
    clearTimeout(dragStartTimer);
    sortables.splice(sortables.indexOf(this.el), 1);

    this.el = null;
  },

  // -------------------------------- prepare start ----------------------------------
  _onDrag: function (/** Event|TouchEvent */ evt) {
    if (dragEl || this.options.disabled || this.options.group.pull === false)
      return;
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
        `draggable expected "function" or "string" but received "${typeof draggable}"`,
      );
    }

    // Get the dragged element
    if (!dragEl) dragEl = getElement(this.el, target, true);

    // No dragging is allowed when there is no dragging element
    if (!dragEl || dragEl.animated) return true;

    // solve the problem that the mobile cannot be dragged
    if (touch) dragEl.style['touch-action'] = 'none';

    fromGroup = this.el;
    fromSortable = this;

    isMultiple = this.options.multiple && this._allowMultiDrag(dragEl);
    // multi-drag
    if (isMultiple) this._onMultiDrag();

    // get the position of the dragged element in the list
    const { rect, offset } = getElement(this.el, dragEl);
    differ.from = {
      sortable: this,
      group: this.el,
      node: dragEl,
      rect,
      offset,
    };

    distance = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    eventState.down = e; // sortable state down is active

    // enable drag between groups
    if (this.options.supportPointer) {
      on(this.ownerDocument, 'pointermove', _nearestSortable);
      on(this.ownerDocument, 'pointerup', this._onDrop);
    } else if (touch) {
      on(this.ownerDocument, 'touchmove', _nearestSortable);
      on(this.ownerDocument, 'touchend', this._onDrop);
    } else {
      on(this.ownerDocument, 'mousemove', _nearestSortable);
      on(this.ownerDocument, 'mouseup', this._onDrop);
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
      on(this.ownerDocument, 'pointercancel', this._onDrop);
    } else if (touch) {
      on(this.ownerDocument, 'touchmove', this._onMove);
      on(this.ownerDocument, 'touchcancel', this._onDrop);
    } else {
      on(this.ownerDocument, 'mousemove', this._onMove);
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

  // -------------------------------- move ----------------------------------
  _onMove: function (/** Event|TouchEvent */ evt) {
    this._preventEvent(evt);
    if (!eventState.down || !dragEl) return;
    if (!_positionChanged(evt)) return;

    const { e, target } = getEvent(evt);
    // truly started
    this._onStarted(e, evt);

    const clientX = evt.clientX - eventState.down.clientX;
    const clientY = evt.clientY - eventState.down.clientY;
    setTransition(ghostEl, 'none');
    setTransform(ghostEl, `translate3d(${clientX}px, ${clientY}px, 0)`);

    if (isMultiple) {
      // on-multi-move
      this._onMultiMove(_params({ e, evt }));
    } else {
      // on-move
      this._dispatchEvent('onMove', {
        ..._emitDiffer(),
        ghostEl,
        event: e,
        originalEvent: evt,
      });
    }
    // check if element will exchange
    if (this._allowPut()) this._triggerChangeEvent(target, e, evt);
    // auto scroll
    cancelAnimationFrame(autoScrollAnimationFrame);
    autoScrollAnimationFrame = requestAnimationFrame(this._autoScroll);
  },

  _autoScroll: function () {
    this.autoScroll.update(this, eventState);
    cancelAnimationFrame(autoScrollAnimationFrame);
    autoScrollAnimationFrame = requestAnimationFrame(this._autoScroll);
  },

  _allowPut: function () {
    if (fromGroup === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name } = this.options.group;
      return activeGroup.name && name && activeGroup.name === name;
    }
  },

  // -------------------------------- real started ----------------------------------
  _onStarted: function (e, /** originalEvent */ evt) {
    if (!eventState.move) {
      // on-multi-drag
      if (isMultiple) {
        this._onMultiStarted(_params({ e, evt }));
      } else {
        // on-drag
        this._dispatchEvent('onDrag', {
          ..._emitDiffer(),
          event: e,
          originalEvent: evt,
        });
      }

      // Init in the move event to prevent conflict with the click event
      this._appendGhost();

      // add class for drag element
      toggleClass(dragEl, this.options.chosenClass, true);
      dragEl.style['will-change'] = 'transform';

      if (Safari) css(document.body, 'user-select', 'none');
      css(this.ownerDocument.body, 'cursor', 'move');
    }

    eventState.move = e; // sortable state move is active
  },

  // -------------------------------- ghost ----------------------------------
  _appendGhost: function () {
    if (ghostEl) return;

    const { fallbackOnBody, ghostClass, ghostStyle = {} } = this.options;
    const container = fallbackOnBody ? document.body : this.el;
    const rect = getRect(dragEl, { block: true }, container);

    if (isMultiple) {
      ghostEl = this._getMultiGhostElement();
    } else {
      ghostEl = dragEl.cloneNode(true);
    }

    toggleClass(ghostEl, ghostClass, true);
    css(ghostEl, 'cursor', 'move');
    css(ghostEl, 'box-sizing', 'border-box');
    css(ghostEl, 'margin', 0);
    css(ghostEl, 'top', rect.top);
    css(ghostEl, 'left', rect.left);
    css(ghostEl, 'width', rect.width);
    css(ghostEl, 'height', rect.height);
    css(ghostEl, 'opacity', '0.8');
    css(ghostEl, 'position', 'fixed');
    css(ghostEl, 'zIndex', '100000');
    css(ghostEl, 'pointerEvents', 'none');

    for (const key in ghostStyle) {
      css(ghostEl, key, ghostStyle[key]);
    }

    setTransition(ghostEl, 'none');
    setTransform(ghostEl, 'translate3d(0px, 0px, 0px)');

    container.appendChild(ghostEl);

    let ox = (distance.x / parseInt(ghostEl.style.width)) * 100;
    let oy = (distance.y / parseInt(ghostEl.style.height)) * 100;
    css(ghostEl, 'transform-origin', `${ox}% ${oy}%`);
    css(ghostEl, 'transform', 'translateZ(0)');

    Sortable.ghost = ghostEl;
  },

  // -------------------------------- on change ----------------------------------
  _triggerChangeEvent: function (target, e, evt) {
    if (!dragEl) return;
    // on-multi-change
    if (isMultiple) {
      this._onMultiChange(_params({ target, e, evt }));
    } else {
      // on-change
      this._onChange(target, e, evt);
    }
  },
  _onChange: function (target, e, evt) {
    if (!differ.from.group) return;
    if (
      !lastChild(rootEl) ||
      (target === rootEl && differ.from.group !== rootEl)
    ) {
      differ.from.sortable._captureAnimationState(dragEl, dragEl);

      differ.to = {
        sortable: this,
        group: rootEl,
        node: dragEl,
        rect: getRect(dragEl),
        offset: getOffset(dragEl),
      };
      // on-remove
      differ.from.sortable._dispatchEvent('onRemove', {
        ..._emitDiffer(),
        event: e,
        originalEvent: evt,
      });
      // on-add
      this._dispatchEvent('onAdd', {
        ..._emitDiffer(),
        event: e,
        originalEvent: evt,
      });

      rootEl.appendChild(dragEl);
      differ.from.sortable._animate();
    } else {
      const { el, rect, offset } = getElement(rootEl, target);
      if (!el || (el && el.animated) || el === dragEl) return;

      dropEl = el;
      differ.to = { sortable: this, group: rootEl, node: dropEl, rect, offset };

      const { clientX, clientY } = e;
      const { left, right, top, bottom } = rect;

      // swap when the elements before and after the drag are inconsistent
      if (
        clientX > left &&
        clientX < right &&
        clientY > top &&
        clientY < bottom
      ) {
        this._captureAnimationState(dragEl, dropEl);

        if (differ.from.group !== differ.to.group) {
          differ.from.sortable._captureAnimationState(dragEl, dropEl);
          // on-remove
          differ.from.sortable._dispatchEvent('onRemove', {
            ..._emitDiffer(),
            event: e,
            originalEvent: evt,
          });
          // on-add
          this._dispatchEvent('onAdd', {
            ..._emitDiffer(),
            event: e,
            originalEvent: evt,
          });

          rootEl.insertBefore(dragEl, dropEl);
          differ.from.sortable._animate();
        } else {
          // on-change
          this._dispatchEvent('onChange', {
            ..._emitDiffer(),
            event: e,
            originalEvent: evt,
          });

          // the top value is compared first, and the left is compared if the top value is the same
          const _offset = getOffset(dragEl);
          if (_offset.top < offset.top || _offset.left < offset.left) {
            rootEl.insertBefore(dragEl, dropEl.nextSibling);
          } else {
            rootEl.insertBefore(dragEl, dropEl);
          }
        }
        this._animate();
      }
    }
    differ.from.sortable = this;
    differ.from.group = rootEl;
  },

  // -------------------------------- on drop ----------------------------------
  _onDrop: function (/** Event|TouchEvent */ evt) {
    this._unbindMoveEvents();
    this._unbindDropEvents();
    this._preventEvent(evt);
    clearTimeout(dragStartTimer);
    cancelAnimationFrame(autoScrollAnimationFrame);

    // clear style, attrs and class
    if (dragEl) {
      const { touch } = getEvent(evt);
      toggleClass(dragEl, this.options.chosenClass, false);
      if (touch) dragEl.style['touch-action'] = '';
      dragEl.style['will-change'] = '';
    }
    // drag and drop done
    if (dragEl && eventState.down && eventState.move) {
      if (isMultiple) {
        this._onMultiDrop(_params({ evt }));
      } else {
        // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
        differ.to.rect = getRect(dragEl);
        differ.to.offset = getOffset(dragEl);
        if (!differ.to.group) {
          differ.to.group = this.el;
          differ.to.sortable = this;
        }

        differ.from.group = fromGroup;
        differ.from.sortable = fromSortable;

        const changed = offsetChanged(differ.from.offset, differ.to.offset);
        const params = {
          ..._emitDiffer(),
          changed,
          event: evt,
          originalEvent: evt,
        };
        // on-drop
        if (differ.to.group !== fromGroup)
          fromSortable._dispatchEvent('onDrop', params);
        this._dispatchEvent('onDrop', params);
      }

      if (Safari) css(document.body, 'user-select', '');
      css(this.ownerDocument.body, 'cursor', '');
    } else if (this.options.multiple) {
      // click event
      this._setMultiElements(evt, this.el);
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
    ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
    dragEl =
      dropEl =
      ghostEl =
      isMultiple =
      fromGroup =
      activeGroup =
      fromSortable =
      dragStartTimer =
      autoScrollAnimationFrame =
      Sortable.ghost =
        null;
    distance = lastPosition = { x: 0, y: 0 };
    eventState.destroy();
    differ.destroy();
  },
  _unbindMoveEvents: function () {
    off(this.ownerDocument, 'pointermove', this._onMove);
    off(this.ownerDocument, 'touchmove', this._onMove);
    off(this.ownerDocument, 'mousemove', this._onMove);
    off(this.ownerDocument, 'pointermove', _nearestSortable);
    off(this.ownerDocument, 'touchmove', _nearestSortable);
    off(this.ownerDocument, 'mousemove', _nearestSortable);
  },
  _unbindDropEvents: function () {
    off(this.ownerDocument, 'pointerup', this._onDrop);
    off(this.ownerDocument, 'pointercancel', this._onDrop);
    off(this.ownerDocument, 'touchend', this._onDrop);
    off(this.ownerDocument, 'touchcancel', this._onDrop);
    off(this.ownerDocument, 'mouseup', this._onDrop);
  },
};

Sortable.prototype.utils = {
  getRect,
  getOffset,
};

export default Sortable;
