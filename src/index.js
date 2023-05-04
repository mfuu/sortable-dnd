import {
  on,
  off,
  css,
  events,
  expando,
  matches,
  closest,
  getRect,
  getEvent,
  containes,
  lastChild,
  getOffset,
  _nextTick,
  randomCode,
  toggleClass,
  isHTMLElement,
  offsetChanged,
  getParentAutoScrollElement,
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

let sortables = [];

let rootEl,
  dragEl,
  dropEl,
  downEvent,
  moveEvent,
  touchEvent,
  isMultiple,
  lastDropEl,
  dragStartTimer,
  helper = new Helper(),
  autoScroller = new AutoScroll();

let from = { ...FromTo };
let to = { ...FromTo };

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
    const e = evt.touches ? evt.touches[0] : evt;
    const nearest = _detectNearestSortable(e.clientX, e.clientY);

    if (nearest) {
      rootEl = nearest;
      if (rootEl === downEvent.sortable.el) return;
      nearest[expando]._onMove(evt);
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

const _emits = function () {
  let result = { from: { ...from }, to: { ...to } };
  if (isMultiple) {
    let ft = getMultiDiffer();
    result.from = { ...ft.from, ...result.from };
    result.to = { ...ft.to, ...result.to };
  }
  return result;
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
  this.options = options = Object.assign({}, options);

  const defaults = {
    group: '',
    animation: 150,

    multiple: false,

    draggable: null,
    handle: null,

    onDrag: null,
    onMove: null,
    onDrop: null,
    onChange: null,

    autoScroll: true,
    scrollThreshold: 25,

    delay: 0,
    delayOnTouchOnly: false,
    disabled: false,

    ghostClass: '',
    ghostStyle: {},
    chosenClass: '',
    selectedClass: '',

    fallbackOnBody: false,
    stopPropagation: false,

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
    // Fixed some mobile terminals could not be dragged
    on(el, 'touchstart', this._preventEvent);
  } else if (supportTouch) {
    on(el, 'touchstart', this._onDrag);
  } else {
    on(el, 'mousedown', this._onDrag);
  }

  sortables.push(el);

  this.multiplayer = new Multiple(this.options);
  this.animator = new Animation(this.options);
}

Sortable.prototype = {
  constructor: Sortable,

  /**
   * Manually clear all the state of the component, using this method the component will not be draggable
   */
  destroy: function () {
    this._dispatchEvent('destroy', this);
    this.el[expando] = null;

    for (let i = 0; i < events.start.length; i++) {
      off(this.el, events.start[i], this._onDrag);
    }

    this._clearState();

    sortables.splice(sortables.indexOf(this.el), 1);
    this.el = null;
  },

  _onDrag: function (/** Event|TouchEvent */ evt) {
    if (this.options.disabled || !this.options.group.pull) return;
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return; // only left button and enabled

    const { touch, event, target } = getEvent(evt);

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;
    if (target === this.el) return;

    const { draggable, handle } = this.options;

    if (typeof handle === 'function' && !handle(evt)) return;
    if (typeof handle === 'string' && !matches(target, handle)) return;

    if (typeof draggable === 'function') {
      // The function type must return an HTMLElement if used to specifies the drag el
      const element = draggable(evt);
      if (!element) return;
      // set drag element
      if (isHTMLElement(element)) dragEl = element;
    } else {
      // String use as 'TagName' or '.class' or '#id'
      dragEl = closest(target, draggable, this.el, false);
    }

    // No dragging is allowed when there is no dragging element
    if (!dragEl || dragEl.animated) return;

    // solve the problem that the mobile cannot be dragged
    if (touch) css(dragEl, 'touch-action', 'none');

    let parentEl = dragEl.parentNode;

    touchEvent = touch;

    downEvent = event;
    downEvent.sortable = this;
    downEvent.group = parentEl;

    isMultiple = this.options.multiple && this.multiplayer.allowDrag(dragEl);

    isMultiple && this.multiplayer.onDrag(this);

    // get the position of the dragEl
    const rect = getRect(dragEl);
    const offset = getOffset(dragEl, this.el);
    from = {
      sortable: this,
      group: parentEl,
      node: dragEl,
      rect,
      offset,
    };
    to.group = parentEl;
    to.sortable = this;

    helper.distance = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

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
      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointerup', this._onDrop);
      } else if (touchEvent) {
        on(this.ownerDocument, 'touchend', this._onDrop);
      } else {
        on(this.ownerDocument, 'mouseup', this._onDrop);
      }

      clearTimeout(dragStartTimer);
      dragStartTimer = setTimeout(() => this._onStart(), delay);
    } else {
      this._onStart();
    }
  },

  _onStart: function () {
    rootEl = this.el;

    if (this.options.supportPointer) {
      on(this.ownerDocument, 'pointermove', this._onMove);
      on(this.ownerDocument, 'pointerup', this._onDrop);
      on(this.ownerDocument, 'pointercancel', this._onDrop);
    } else if (touchEvent) {
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

  _onTrulyStarted: function () {
    if (!moveEvent) {
      this._dispatchEvent('onDrag', { ..._emits(), event: downEvent });
      isMultiple && this.multiplayer.onTrulyStarted(dragEl, this);

      // Init in the move event to prevent conflict with the click event
      const element = isMultiple ? this.multiplayer.getHelper() : dragEl;
      helper.init(from.rect, element, this.el, this.options);
      Sortable.helper = helper.node;

      // add class for drag element
      toggleClass(dragEl, this.options.chosenClass, true);
      css(dragEl, 'will-change', 'transform');

      Safari && css(document.body, 'user-select', 'none');
    }
  },

  _allowPut: function () {
    if (downEvent.group === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name } = this.options.group;
      const fromGroup = downEvent.sortable.options.group;
      return fromGroup.name && name && fromGroup.name === name;
    }
  },

  _onMove: function (/** Event|TouchEvent */ evt) {
    this._preventEvent(evt);
    if (!downEvent || !dragEl) return;
    if (!_positionChanged(evt)) return;

    const { event, target } = getEvent(evt);
    // truly started
    this._onTrulyStarted();

    moveEvent = event;

    const x = evt.clientX - downEvent.clientX;
    const y = evt.clientY - downEvent.clientY;
    helper.move(x, y);

    this._dispatchEvent('onMove', { ..._emits(), event });

    if (!this.scrollEl) {
      // get the scroll element, fix display 'none' to 'block'
      this.scrollEl = getParentAutoScrollElement(this.el, true);
    }

    const { autoScroll, scrollThreshold } = this.options;
    if (autoScroll) {
      autoScroller.update(this.scrollEl, scrollThreshold, downEvent, moveEvent);
    }

    if (!this._allowPut()) return;

    dropEl = closest(target, this.options.draggable, rootEl, false);

    if (dropEl) {
      if (dropEl === lastDropEl) return;
      lastDropEl = dropEl;

      if (dropEl.animated || containes(dropEl, dragEl)) return;
    }
    if (dropEl === dragEl) return;

    if (rootEl !== from.sortable.el) {
      if (target === rootEl || !lastChild(rootEl, helper.node)) {
        this._onInsert(event, true);
      } else if (dropEl) {
        this._onInsert(event, false);
      }
    } else if (dropEl) {
      this._onChange(event);
    }
  },

  _onInsert: function (/** Event|TouchEvent */ event, insert) {
    let target = insert ? dragEl : dropEl;
    let parentEl = insert ? rootEl : dropEl.parentNode;

    from.sortable.animator.collect(dragEl, null, dragEl.parentNode, dragEl);
    this.animator.collect(null, target, parentEl, dragEl);

    isMultiple && this.multiplayer.onChange(dragEl, this);
    to = {
      sortable: this,
      group: parentEl,
      node: target,
      rect: getRect(dragEl),
      offset: getOffset(dragEl, rootEl),
    };

    from.sortable._dispatchEvent('onRemove', { ..._emits(), event });

    if (insert) {
      parentEl.appendChild(dragEl);
    } else {
      parentEl.insertBefore(dragEl, target);
    }

    this._dispatchEvent('onAdd', { ..._emits(), event });

    from.sortable.animator.animate();
    this.animator.animate();
    from.group = parentEl;
    from.sortable = this;
  },

  _onChange: function (/** Event|TouchEvent */ event) {
    let parentEl = dropEl.parentNode;

    this.animator.collect(dragEl, dropEl, parentEl);

    isMultiple && this.multiplayer.onChange(dragEl, this);
    to = {
      sortable: this,
      group: parentEl,
      node: dropEl,
      rect: getRect(dropEl),
      offset: getOffset(dropEl, rootEl),
    };

    this._dispatchEvent('onChange', { ..._emits(), event });

    // the top value is compared first, and the left is compared if the top value is the same
    const offset = getOffset(dragEl, rootEl);
    let nextEl = null;
    if (offset.top === to.offset.top) {
      nextEl = offset.left < to.offset.left ? dropEl.nextSibling : dropEl;
    } else {
      nextEl = offset.top < to.offset.top ? dropEl.nextSibling : dropEl;
    }
    parentEl.insertBefore(dragEl, nextEl);
    this.animator.animate();

    from.group = parentEl;
    from.sortable = this;
  },

  _onDrop: function (/** Event|TouchEvent */ evt) {
    this._unbindMoveEvents();
    this._unbindDropEvents();
    this._preventEvent(evt);
    autoScroller.clear();
    clearTimeout(dragStartTimer);

    // clear style, attrs and class
    if (dragEl) {
      toggleClass(dragEl, this.options.chosenClass, false);
      touchEvent && css(dragEl, 'touch-action', '');
      css(dragEl, 'will-change', '');
    }

    if (dragEl && downEvent && moveEvent) {
      this._onEnd(evt);
    } else if (this.options.multiple) {
      // click event
      this.multiplayer.select(evt, dragEl, { ...from });
    }

    this._clearState();
  },

  _onEnd(/** Event|TouchEvent */ evt) {
    from.group = downEvent.group;
    from.sortable = downEvent.sortable;
    if (isMultiple) {
      this.multiplayer.onDrop(evt, dragEl, downEvent, _emits);
    } else {
      // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
      to.rect = getRect(dragEl);
      to.offset = getOffset(dragEl, rootEl);

      const changed =
        to.sortable.el !== from.sortable.el ||
        offsetChanged(from.offset, to.offset);
      const params = { ..._emits(), changed, event: evt };

      if (to.sortable.el !== from.sortable.el) {
        from.sortable._dispatchEvent('onDrop', params);
      }
      to.sortable._dispatchEvent('onDrop', params);
    }

    Safari && css(document.body, 'user-select', '');
  },

  _preventEvent: function (evt) {
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
    if (this.options.stopPropagation) {
      if (evt && evt.stopPropagation) {
        evt.stopPropagation();
      } else {
        window.event.cancelBubble = true;
      }
    }
  },

  _dispatchEvent: function (event, params) {
    const callback = this.options[event];
    if (typeof callback === 'function') callback(params);
  },

  _clearState: function () {
    dragEl =
      dropEl =
      downEvent =
      moveEvent =
      touchEvent =
      isMultiple =
      lastDropEl =
      dragStartTimer =
      Sortable.helper =
        null;
    lastPosition = { x: 0, y: 0 };
    from = to = { ...FromTo };
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
