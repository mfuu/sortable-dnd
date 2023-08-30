import {
  on,
  off,
  css,
  within,
  events,
  visible,
  expando,
  matches,
  closest,
  getRect,
  getEvent,
  containes,
  lastChild,
  getOffset,
  _nextTick,
  toggleClass,
  isHTMLElement,
  offsetChanged,
  sortableChanged,
  getParentAutoScrollElement,
} from './utils.js';
import { Edge, Safari, IE11OrLess } from './utils.js';
import Multiple, { getMultiDiffer } from './Plugins/Multiple.js';
import AutoScroll from './Plugins/AutoScroll.js';
import Animation from './Plugins/Animation.js';
import Virtual from './Plugins/Virtual.js';
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
  cloneEl,
  parentEl,
  downEvent,
  moveEvent,
  isMultiple,
  lastDropEl,
  dragStartTimer,
  helper = new Helper();

let from = { ...FromTo };
let to = { ...FromTo };

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
 * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
 * @return {HTMLElement} Element of the first found nearest Sortable
 */
const _detectNearestSortable = function (x, y) {
  let result;
  sortables.some((sortable) => {
    const threshold = sortable[expando].options.emptyInsertThreshold;
    if (!threshold) return;

    const rect = getRect(sortable, { parent: true }),
      insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
      insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

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
 * @class Sortable
 * @param {HTMLElement} el container
 * @param {Object} options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw `Sortable: \`el\` must be an HTMLElement, not ${{}.toString.call(el)}`;
  }

  el[expando] = this;

  this.el = el;
  this.options = options = Object.assign({}, options);

  const defaults = {
    disabled: false,

    virtual: false,
    scroller: null,

    dataKeys: [],
    keeps: 30,
    size: null,
    headerSize: 0,
    direction: 'vertical',

    group: '',
    animation: 150,

    multiple: false,

    draggable: null,
    handle: null,

    autoScroll: true,
    scrollThreshold: 55,
    scrollSpeed: { x: 10, y: 10 },

    delay: 0,
    delayOnTouchOnly: false,
    touchStartThreshold:
      (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,

    ghostClass: '',
    ghostStyle: {},
    chosenClass: '',
    selectedClass: '',

    swapOnDrop: true,
    fallbackOnBody: false,
    stopPropagation: false,

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

  const { supportTouch } = this.options;
  if (supportTouch) {
    on(el, 'touchstart', this._onDrag);
  } else {
    on(el, 'mousedown', this._onDrag);
  }

  sortables.push(el);

  this.autoScroller = new AutoScroll(this.options);
  this.multiplayer = new Multiple(this.options);
  this.animator = new Animation(this.options);
  this.virtual = new Virtual(this);
}

Sortable.prototype = {
  constructor: Sortable,

  /** Destroy */
  destroy: function () {
    this._dispatchEvent('onDestroy', this);

    this.el[expando] = null;

    for (let i = 0; i < events.start.length; i++) {
      off(this.el, events.start[i], this._onDrag);
    }

    sortables.splice(sortables.indexOf(this.el), 1);

    this.virtual.destroy();
    this._clearState();

    this.el = this.virtual = this.animator = this.multiplayer = null;
  },

  /** Get/Set option */
  option: function (key, value) {
    let options = this.options;
    if (value === void 0) {
      return options[key];
    } else {
      options[key] = value;
      if (key === 'group') {
        _prepareGroup(options);
      }
      this.virtual.updateOption(key, value);
    }
  },

  /** Get the selected elements in the list */
  getSelectedElements: function () {
    return this.multiplayer.getSelectedElements();
  },

  _onDrag: function (/** Event|TouchEvent */ evt) {
    if (this.options.disabled || !this.options.group.pull) return;

    // only left button and enabled
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return;

    const { touch, event, target } = getEvent(evt);

    if (target === this.el) return;

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;

    const { draggable, handle } = this.options;

    if (typeof handle === 'function' && !handle(evt)) return;
    if (typeof handle === 'string' && !matches(target, handle)) return;

    if (typeof draggable === 'function') {
      // The function type must return an HTMLElement if used to specifies the drag element
      const element = draggable(evt);

      if (!element) return;

      if (isHTMLElement(element)) {
        dragEl = element;
      }
    } else {
      // String use as 'TagName' or '.class' or '#id'
      dragEl = closest(target, draggable, this.el, false);
    }

    // No dragging is allowed when there is no dragging element
    if (!dragEl || dragEl.animated) return;

    Sortable.dragged = dragEl;
    cloneEl = dragEl.cloneNode(true);
    this._prepareStart(touch, event);
  },

  _prepareStart: function (touch, event) {
    parentEl = dragEl.parentNode;

    downEvent = event;
    downEvent.sortable = this;
    downEvent.group = parentEl;

    isMultiple = this.options.multiple && this.multiplayer.allowDrag(dragEl);

    isMultiple && this.multiplayer.onDrag(this.el, this);

    // get the position of the dragEl
    const rect = getRect(dragEl);
    const offset = getOffset(dragEl, this.el);
    from = { sortable: this, group: parentEl, node: dragEl, rect, offset };
    to.group = parentEl;
    to.sortable = this;

    helper.distance = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    on(document, 'touchend', this._onDrop);
    on(document, 'touchcancel', this._onDrop);
    on(document, 'mouseup', this._onDrop);

    const { delay, delayOnTouchOnly } = this.options;
    if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
      for (let i = 0; i < events.end.length; i++) {
        on(this.el.ownerDocument, events.end[i], this._cancelStart);
      }
      for (let i = 0; i < events.move.length; i++) {
        on(this.el.ownerDocument, events.move[i], this._delayMoveHandler);
      }

      dragStartTimer = setTimeout(() => this._onStart(touch), delay);
    } else {
      this._onStart(touch);
    }
  },

  _delayMoveHandler: function (evt) {
    let touch = evt.touches ? evt.touches[0] : evt;
    if (
      Math.max(
        Math.abs(touch.clientX - downEvent.clientX),
        Math.abs(touch.clientY - downEvent.clientY)
      ) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))
    ) {
      this._cancelStart();
    }
  },

  _cancelStart: function () {
    clearTimeout(dragStartTimer);

    for (let i = 0; i < events.end.length; i++) {
      off(this.el.ownerDocument, events.end[i], this._cancelStart);
    }
    for (let i = 0; i < events.move.length; i++) {
      off(this.el.ownerDocument, events.move[i], this._delayMoveHandler);
    }
  },

  _onStart: function (/** TouchEvent */ touch) {
    rootEl = this.el;

    if (touch) {
      on(document, 'touchmove', this._nearestSortable);
    } else {
      on(document, 'mousemove', this._nearestSortable);
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
      Sortable.ghost = helper.node;

      // Hide the drag element and show the cloned dom element
      visible(dragEl, false);
      dragEl.parentNode.insertBefore(cloneEl, dragEl);
      toggleClass(cloneEl, this.options.chosenClass, true);

      Safari && css(document.body, 'user-select', 'none');
    }
  },

  _nearestSortable: function (/** Event|TouchEvent */ evt) {
    this._preventEvent(evt);
    if (!downEvent || !dragEl || !_positionChanged(evt)) return;

    const { event, target } = getEvent(evt);
    const nearest = _detectNearestSortable(event.clientX, event.clientY);

    this._onTrulyStarted();
    moveEvent = event;

    helper.move(event.clientX - downEvent.clientX, event.clientY - downEvent.clientY);
    this._autoScroll(target);

    if (nearest) {
      nearest[expando]._onMove(event, target);
    }
  },

  _autoScroll: function (target) {
    const scrollEl = getParentAutoScrollElement(target, true);
    const { autoScroll } = this.options;
    if (autoScroll) {
      this.autoScroller.update(scrollEl, downEvent, moveEvent);
    }
  },

  _allowPut: function () {
    if (downEvent.sortable.el === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name } = this.options.group;
      const fromGroup = downEvent.sortable.options.group;
      return fromGroup.name && name && fromGroup.name === name;
    }
  },

  _onMove: function (/** Event|TouchEvent */ event, target) {
    if (!this._allowPut()) return;

    this._dispatchEvent('onMove', { ..._emits(), event });

    if (within(event, parentEl) && target === parentEl) return;

    rootEl = this.el;
    dropEl = closest(target, this.options.draggable, rootEl, false);

    if (dropEl) {
      if (dropEl === lastDropEl) return;
      lastDropEl = dropEl;
      if (dropEl === cloneEl || dropEl === dragEl) return;
      if (dropEl.animated || containes(dropEl, cloneEl)) return;
    }

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

  _onInsert: function (/** Event|TouchEvent */ event, insertToLast) {
    const target = insertToLast ? cloneEl : dropEl;
    parentEl = insertToLast ? rootEl : dropEl.parentNode;

    from.sortable.animator.collect(cloneEl, null, from.group, cloneEl);
    this.animator.collect(null, target, parentEl, cloneEl);

    isMultiple && this.multiplayer.onChange(cloneEl, this);

    to = {
      sortable: this,
      group: parentEl,
      node: target,
      rect: getRect(target),
      offset: getOffset(target, rootEl),
    };

    from.sortable._dispatchEvent('onRemove', { ..._emits(), event });

    if (insertToLast) {
      parentEl.appendChild(cloneEl);
    } else {
      parentEl.insertBefore(cloneEl, dropEl);
    }

    this._dispatchEvent('onAdd', { ..._emits(), event });

    from.sortable.animator.animate();
    this.animator.animate();

    from.group = parentEl;
    from.sortable = this;
  },

  _onChange: function (/** Event|TouchEvent */ event) {
    parentEl = dropEl.parentNode;

    this.animator.collect(cloneEl, dropEl, parentEl);

    isMultiple && this.multiplayer.onChange(cloneEl, this);
    to = {
      sortable: this,
      group: parentEl,
      node: dropEl,
      rect: getRect(dropEl),
      offset: getOffset(dropEl, rootEl),
    };

    this._dispatchEvent('onChange', { ..._emits(), event });

    // the top value is compared first, and the left is compared if the top value is the same
    const fromOffset = getOffset(cloneEl, rootEl);
    let nextEl = null;
    if (fromOffset.top === to.offset.top) {
      nextEl = fromOffset.left < to.offset.left ? dropEl.nextSibling : dropEl;
    } else {
      nextEl = fromOffset.top < to.offset.top ? dropEl.nextSibling : dropEl;
    }

    parentEl.insertBefore(cloneEl, nextEl);
    this.animator.animate();

    from.group = parentEl;
    from.sortable = this;
  },

  _onDrop: function (/** Event|TouchEvent */ evt) {
    this._unbindMoveEvents();
    this._unbindDropEvents();
    this._preventEvent(evt);
    this._cancelStart();
    this.autoScroller.clear();

    if (dragEl && downEvent && moveEvent) {
      this._onEnd(evt);
    } else if (this.options.multiple) {
      this.multiplayer.select(evt, dragEl, rootEl, { ...from });
    }

    this._clearState();
  },

  _onEnd: function (/** Event|TouchEvent */ evt) {
    if (this.options.swapOnDrop) {
      parentEl.insertBefore(dragEl, cloneEl);
    }

    from.group = downEvent.group;
    from.sortable = downEvent.sortable;

    // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
    to.rect = getRect(cloneEl);
    to.offset = getOffset(cloneEl, rootEl);

    if (isMultiple) {
      this.multiplayer.onDrop(evt, dragEl, rootEl, downEvent, _emits);
    } else {
      if (to.node === cloneEl) to.node = dragEl;

      const ctxChanged = sortableChanged(from, to);
      const changed = ctxChanged || offsetChanged(from.offset, to.offset);
      const params = { ..._emits(), changed, event: evt };

      if (ctxChanged) {
        from.sortable._dispatchEvent('onDrop', params);
      }
      to.sortable._dispatchEvent('onDrop', params);
    }

    visible(dragEl, true);
    parentEl.removeChild(cloneEl);
    Safari && css(document.body, 'user-select', '');
  },

  _preventEvent: function (/** Event|TouchEvent */ evt) {
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
    if (this.options.stopPropagation) {
      if (evt && evt.stopPropagation) {
        evt.stopPropagation();
      } else {
        window.event.cancelBubble = true;
      }
    }
  },

  _dispatchEvent: function (emit, params) {
    const callback = this.options[emit];
    if (typeof callback === 'function') callback(params);
  },

  _clearState: function () {
    dragEl =
      dropEl =
      cloneEl =
      parentEl =
      downEvent =
      moveEvent =
      isMultiple =
      lastDropEl =
      dragStartTimer =
      Sortable.ghost =
      Sortable.dragged =
        null;
    lastPosition = { x: 0, y: 0 };
    from = to = { ...FromTo };
    helper.destroy();
  },

  _unbindMoveEvents: function () {
    for (let i = 0; i < events.move.length; i++) {
      off(document, events.move[i], this._nearestSortable);
    }
  },

  _unbindDropEvents: function () {
    for (let i = 0; i < events.end.length; i++) {
      off(document, events.end[i], this._onDrop);
    }
  },
};

Sortable.utils = {
  on: on,
  off: off,
  css: css,
  closest: closest,
  toggleClass: toggleClass,
};

/**
 * Get the Sortable instance of an element
 * @param  {HTMLElement} element The element
 * @return {Sortable|undefined} The instance of Sortable
 */
Sortable.get = function (element) {
  return element[expando];
};

/**
 * Create sortable instance
 * @param {HTMLElement} el
 * @param {Object} options
 */
Sortable.create = function (el, options) {
  return new Sortable(el, options);
};

export default Sortable;
