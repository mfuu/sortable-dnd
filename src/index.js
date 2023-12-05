import {
  on,
  off,
  css,
  sort,
  Edge,
  index,
  Safari,
  within,
  events,
  matches,
  closest,
  getRect,
  getEvent,
  containes,
  lastChild,
  getOffset,
  _nextTick,
  IE11OrLess,
  toggleClass,
  offsetChanged,
  isHTMLElement,
  preventDefault,
  detectDirection,
  getParentAutoScrollElement,
} from './utils.js';
import AutoScroll from './Plugins/AutoScroll.js';
import Animation from './Plugins/Animation.js';
import Multiple from './Plugins/Multiple.js';
import Helper from './helper.js';

const expando = 'Sortable' + Date.now();
const FromTo = { sortable: null, group: null, node: null, rect: {}, offset: {} };

let rootEl,
  dragEl,
  dropEl,
  nextEl,
  cloneEl,
  parentEl,
  dragEvent,
  moveEvent,
  isMultiple,
  lastDropEl,
  listenerNode,
  lastHoverArea,
  dragStartTimer,
  sortables = [],
  helper = new Helper(),
  from = { ...FromTo },
  to = { ...FromTo },
  lastPosition = { x: 0, y: 0 };

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

/**
 * @class Sortable
 * @param {HTMLElement} el container
 * @param {Object} options
 */
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw `Sortable-dnd: \`el\` must be an HTMLElement, not ${{}.toString.call(el)}`;
  }

  el[expando] = this;

  this.el = el;
  this.options = options = Object.assign({}, options);

  const defaults = {
    disabled: false,
    group: '',
    animation: 150,
    draggable: null,
    handle: null,
    multiple: false,
    selectHandle: null,
    direction: function () {
      return detectDirection(el, options.draggable);
    },
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
}

Sortable.prototype = {
  constructor: Sortable,

  // ========================================= Public Methods =========================================
  destroy() {
    this._dispatchEvent('onDestroy', { sortable: this }, false);

    events.start.forEach((event) => off(this.el, event, this._onDrag));
    sortables.splice(sortables.indexOf(this.el), 1);
    this._clearState();

    this.el[expando] = this.animator = this.multiplayer = null;
  },

  option(key, value) {
    if (value === void 0) {
      return this.options[key];
    }

    // set option
    this.options[key] = value;
    this.animator.options[key] = value;
    this.multiplayer.options[key] = value;
    this.autoScroller.options[key] = value;

    if (key === 'group') {
      _prepareGroup(this.options);
    }
  },

  getSelectedElements() {
    return this.multiplayer.getSelectedElements();
  },

  // ========================================= Properties =========================================
  _onDrag: function (/** Event|TouchEvent */ evt) {
    if (this.options.disabled || !this.options.group.pull) return;

    // only left button and enabled
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return;

    const { touch, event, target } = getEvent(evt);

    if (target === this.el) return;

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;

    const { draggable, handle } = this.options;

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

    listenerNode = touch ? dragEl : document;

    cloneEl = dragEl.cloneNode(true);
    parentEl = dragEl.parentNode;

    Sortable.dragged = dragEl;

    dragEvent = event;
    dragEvent.sortable = this;

    this.multiplayer.onDrag(this.el, this);

    // get the position of the dragEl
    const rect = getRect(dragEl);
    const offset = getOffset(dragEl, this.el);

    from = { sortable: this, node: dragEl, rect, offset };
    to.node = dragEl;
    to.sortable = this;

    lastPosition = { x: event.clientX, y: event.clientY };
    helper.distance = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    on(listenerNode, 'touchend', this._onDrop);
    on(listenerNode, 'touchcancel', this._onDrop);
    on(listenerNode, 'mouseup', this._onDrop);

    if (typeof handle === 'function' && !handle(evt)) return;
    if (typeof handle === 'string' && !matches(target, handle)) return;

    const { delay, delayOnTouchOnly } = this.options;
    // Delay is impossible for native DnD in Edge or IE
    if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
      events.move.forEach((event) => on(this.el.ownerDocument, event, this._delayMoveHandler));
      events.end.forEach((event) => on(this.el.ownerDocument, event, this._cancelStart));

      dragStartTimer = setTimeout(() => this._prepareStart(touch), delay);
    } else {
      this._prepareStart(touch);
    }
  },

  _delayMoveHandler: function (evt) {
    let e = evt.touches ? evt.touches[0] : evt;
    if (
      Math.max(Math.abs(e.clientX - dragEvent.clientX), Math.abs(e.clientY - dragEvent.clientY)) >=
      Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))
    ) {
      this._cancelStart();
    }
  },

  _cancelStart: function () {
    clearTimeout(dragStartTimer);

    events.move.forEach((event) => off(this.el.ownerDocument, event, this._delayMoveHandler));
    events.end.forEach((event) => off(this.el.ownerDocument, event, this._cancelStart));
  },

  _prepareStart: function (/** TouchEvent */ touch) {
    rootEl = this.el;

    if (touch) {
      on(listenerNode, 'touchmove', this._nearestSortable);
    } else {
      on(listenerNode, 'mousemove', this._nearestSortable);
    }

    // clear selection
    try {
      if (document.selection) {
        // Timeout neccessary for IE9
        _nextTick(() => document.selection.empty());
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (error) {}
  },

  _onStarted: function () {
    Sortable.active = this;

    this._dispatchEvent('onDrag', { event: dragEvent });

    this.multiplayer.onStarted(this);

    const element = this.multiplayer.getHelper() || dragEl;
    helper.init(from.rect, element, this.el, this.options);

    Sortable.ghost = helper.node;

    // Hide the drag element and show the cloned dom element
    css(dragEl, 'display', 'none');
    dragEl.parentNode.insertBefore(cloneEl, dragEl);
    toggleClass(cloneEl, this.options.chosenClass, true);

    Safari && css(document.body, 'user-select', 'none');
  },

  _nearestSortable: function (/** Event|TouchEvent */ evt) {
    preventDefault(evt);
    if (!dragEvent || !dragEl || !_positionChanged(evt)) return;

    // Init in the move event to prevent conflict with the click event
    !moveEvent && this._onStarted();

    const { event, target } = getEvent(evt);

    moveEvent = event;

    helper.move(event.clientX - dragEvent.clientX, event.clientY - dragEvent.clientY);
    this._autoScroll(target);

    const nearest = _detectNearestSortable(event.clientX, event.clientY);
    nearest && nearest[expando]._onMove(event, target);
  },

  _autoScroll: function (target) {
    if (this.options.autoScroll) {
      const scrollEl = getParentAutoScrollElement(target, true);
      this.autoScroller.update(scrollEl, dragEvent, moveEvent);
    }
  },

  _allowPut: function () {
    if (dragEvent.sortable.el === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name } = this.options.group;
      const fromGroup = dragEvent.sortable.options.group;
      return fromGroup.name && name && fromGroup.name === name;
    }
  },

  _allowSwap: function () {
    const order = sort(cloneEl, dropEl);

    nextEl = order < 0 ? dropEl.nextSibling : dropEl;

    if (lastDropEl !== dropEl) {
      lastHoverArea = 0;
      return true;
    }

    let rect = getRect(dropEl),
      direction =
        typeof this.options.direction === 'function'
          ? this.options.direction.call(this, dragEl, moveEvent)
          : this.options.direction,
      vertical = direction === 'vertical',
      mouseOnAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
      dropElSize = dropEl[direction === 'vertical' ? 'offsetHeight' : 'offsetWidth'],
      hoverArea =
        mouseOnAxis >= (vertical ? rect.top : rect.left) &&
        mouseOnAxis < (vertical ? rect.bottom : rect.right) - dropElSize / 2
          ? -1
          : 1;

    if (lastHoverArea !== hoverArea) {
      lastHoverArea = hoverArea;
      return hoverArea < 0 ? order > 0 : order < 0;
    }
    return false;
  },

  _onMove: function (/** Event|TouchEvent */ event, target) {
    if (!this._allowPut()) return;

    this._dispatchEvent('onMove', { event });

    rootEl = this.el;
    dropEl = closest(target, this.options.draggable, rootEl, false);

    // insert to last
    if (rootEl !== from.sortable.el && (target === rootEl || !lastChild(rootEl))) {
      lastDropEl = null;
      this._onInsert(event, true);
      return;
    }

    if (!dropEl || dropEl.animated || !this._allowSwap()) return;
    if (dropEl === cloneEl || dropEl === dragEl || containes(dropEl, cloneEl)) {
      return;
    }

    if (rootEl !== from.sortable.el) {
      this._onInsert(event, false);
    } else if (!(within(event, parentEl) && target === parentEl)) {
      this._onChange(event);
    }
    lastDropEl = dropEl;
  },

  _onInsert: function (/** Event|TouchEvent */ event, insertToLast) {
    const target = insertToLast ? cloneEl : dropEl;
    parentEl = insertToLast ? rootEl : dropEl.parentNode;

    from.sortable.animator.collect(cloneEl, null, cloneEl.parentNode, cloneEl);
    this.animator.collect(null, target, parentEl, cloneEl);

    this.multiplayer.onChange(cloneEl, this);

    to = { sortable: this, node: target, rect: getRect(target), offset: getOffset(target, rootEl) };

    from.sortable._dispatchEvent('onRemove', { event });

    if (insertToLast) {
      parentEl.appendChild(cloneEl);
    } else {
      parentEl.insertBefore(cloneEl, dropEl);
    }

    this._dispatchEvent('onAdd', { event });

    from.sortable.animator.animate();
    this.animator.animate();

    from.sortable = this;
  },

  _onChange: function (/** Event|TouchEvent */ event) {
    parentEl = dropEl.parentNode;

    this.animator.collect(cloneEl, dropEl, parentEl);

    this.multiplayer.onChange(cloneEl, this);

    to = { sortable: this, node: dropEl, rect: getRect(dropEl), offset: getOffset(dropEl, rootEl) };

    this._dispatchEvent('onChange', { event });

    parentEl.insertBefore(cloneEl, nextEl);
    this.animator.animate();

    from.sortable = this;
  },

  _onDrop: function (/** Event|TouchEvent */ event) {
    preventDefault(event);
    this._cancelStart();
    this._unbindEvents();
    this.autoScroller.clear();

    if (dragEl && dragEvent && moveEvent) {
      this._onEnd(event);
    } else if (this.options.multiple) {
      this.multiplayer.onDrop(dragEvent, event, { ...from });
    }

    this._clearState();
  },

  _onEnd: function (/** Event|TouchEvent */ event) {
    // swap real drag element to the current drop position
    if (this.options.swapOnDrop) {
      parentEl.insertBefore(dragEl, cloneEl);
    }

    from.sortable = dragEvent.sortable;

    // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
    to.rect = getRect(cloneEl);
    to.offset = getOffset(cloneEl, rootEl);
    if (to.node === cloneEl) to.node = dragEl;

    this.multiplayer.onEnd(rootEl, dragEvent);

    const multiParams = this.multiplayer.getOnEndParams();
    const sortableChanged = from.sortable.el !== to.sortable.el;
    const changed = sortableChanged || offsetChanged(from.offset, to.offset);
    const params = { changed, event, ...multiParams };

    if (sortableChanged) {
      from.sortable._dispatchEvent('onDrop', params);
    }
    to.sortable._dispatchEvent('onDrop', params);

    css(dragEl, 'display', '');
    parentEl.removeChild(cloneEl);
    Safari && css(document.body, 'user-select', '');
  },

  _dispatchEvent: function (event, params = {}, needDefaultEmits = true) {
    const callback = this.options[event];
    if (typeof callback !== 'function') return;

    let emit = {};
    if (needDefaultEmits) {
      const multiEmit = this.multiplayer.getEmits();
      emit = {
        from: { ...multiEmit.from, ...from },
        to: { ...multiEmit.to, ...to },
      };
    }
    callback({ ...emit, ...params });
  },

  _clearState: function () {
    dragEl =
      dropEl =
      nextEl =
      cloneEl =
      parentEl =
      dragEvent =
      moveEvent =
      isMultiple =
      lastDropEl =
      listenerNode =
      lastHoverArea =
      dragStartTimer =
      Sortable.ghost =
      Sortable.active =
      Sortable.dragged =
        null;
    lastPosition = { x: 0, y: 0 };
    from = to = { ...FromTo };
    helper.destroy();
  },

  _unbindEvents: function () {
    events.move.forEach((event) => off(listenerNode, event, this._nearestSortable));
    events.end.forEach((event) => off(listenerNode, event, this._onDrop));
  },
};

Sortable.utils = {
  on: on,
  off: off,
  css: css,
  index: index,
  closest: closest,
  getOffset: getOffset,
  toggleClass: toggleClass,
  detectDirection: detectDirection,
};

/**
 * Get the Sortable instance of an element
 */
Sortable.get = function (element) {
  return element[expando];
};

/**
 * Create sortable instance
 */
Sortable.create = function (el, options) {
  return new Sortable(el, options);
};

export default Sortable;
