import {
  on,
  off,
  css,
  sort,
  Edge,
  index,
  Safari,
  within,
  matches,
  closest,
  getRect,
  getEvent,
  containes,
  lastChild,
  IE11OrLess,
  toggleClass,
  setTransform,
  setTransition,
  dispatchEvent,
  preventDefault,
  detectDirection,
  getParentAutoScrollElement,
} from './utils.js';
import AutoScroll from './Plugins/AutoScroll.js';
import Animation from './Plugins/Animation.js';
import Multiple from './Plugins/Multiple.js';

const expando = 'Sortable' + Date.now();

let dragEl,
  dropEl,
  nextEl,
  cloneEl,
  ghostEl,
  parentEl,
  dragEvent,
  moveEvent,
  lastDropEl,
  listenerNode,
  lastHoverArea,
  dragStartTimer,
  sortables = [];

let to, from, pullMode, oldIndex, newIndex, dragIndex, targetNode;

const _prepareGroup = function (options) {
  let group = {};
  let originalGroup = options.group;

  if (!originalGroup || typeof originalGroup != 'object') {
    originalGroup = { name: originalGroup, pull: true, put: true, revertDrag: true };
  }

  group.name = originalGroup.name;
  group.pull = originalGroup.pull;
  group.put = originalGroup.put;
  group.revertDrag = originalGroup.revertDrag;

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
    if (threshold == void 0) return;

    const rect = getRect(sortable),
      insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
      insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

    if (insideHorizontally && insideVertically) {
      return (result = sortable);
    }
  });
  return result;
};

const _positionChanged = function (evt) {
  const lastEvent = moveEvent || dragEvent;

  const { clientX, clientY } = evt;
  const distanceX = clientX - lastEvent.clientX;
  const distanceY = clientY - lastEvent.clientY;

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
    store: null,
    disabled: false,
    group: '',
    animation: 150,
    draggable: null,
    handle: null,
    multiple: false,
    selectHandle: null,
    customGhost: null,
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
    emptyInsertThreshold: -5,
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

  _onDrag: function (/** TouchEvent|MouseEvent */ evt) {
    // Don't trigger start event when an element is been dragged
    if (dragEl || this.options.disabled || !this.options.group.pull) return;

    // only left button and enabled
    if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return;

    const { touch, event, target } = getEvent(evt);

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;

    const { handle, draggable } = this.options;

    dragEl = closest(target, draggable, this.el);

    // No dragging is allowed when there is no dragging element
    if (!dragEl || dragEl.animated) return;

    dragEvent = event;
    dragEvent.sortable = this;
    listenerNode = touch ? dragEl : document;

    on(listenerNode, 'mouseup', this._onDrop);
    on(listenerNode, 'touchend', this._onDrop);
    on(listenerNode, 'touchcancel', this._onDrop);

    if (typeof handle === 'function' && !handle(event)) return;
    if (typeof handle === 'string' && !matches(target, handle)) return;

    const { delay, delayOnTouchOnly } = this.options;

    // Delay is impossible for native DnD in Edge or IE
    if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
      on(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
      on(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
      on(this.el.ownerDocument, 'mouseup', this._cancelStart);
      on(this.el.ownerDocument, 'touchend', this._cancelStart);
      on(this.el.ownerDocument, 'touchcancel', this._cancelStart);

      dragStartTimer = setTimeout(() => this._onStart(touch), delay);
    } else {
      this._onStart(touch);
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

    off(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
    off(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
    off(this.el.ownerDocument, 'mouseup', this._cancelStart);
    off(this.el.ownerDocument, 'touchend', this._cancelStart);
    off(this.el.ownerDocument, 'touchcancel', this._cancelStart);
  },

  _onStart: function (touch) {
    if (touch) {
      on(listenerNode, 'touchmove', this._nearestSortable);
    } else {
      on(listenerNode, 'mousemove', this._nearestSortable);
    }

    // clear selection
    try {
      if (document.selection) {
        // Timeout neccessary for IE9
        setTimeout(() => document.selection.empty(), 0);
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (error) {}
  },

  _onStarted: function () {
    const i = index(dragEl);

    to = this.el;
    from = this.el;
    oldIndex = i;
    newIndex = i;
    dragIndex = i;
    targetNode = dragEl;

    parentEl = dragEl.parentNode;
    pullMode = this.options.group.pull;

    cloneEl = dragEl.cloneNode(true);
    toggleClass(cloneEl, this.options.chosenClass, true);

    Sortable.clone = cloneEl;
    Sortable.active = this;
    Sortable.dragged = dragEl;

    this._appendGhost();
    this.multiplayer.onDrag(this);

    dispatchEvent({
      sortable: this,
      name: 'onDrag',
      params: this._getParams(dragEvent),
    });

    css(dragEl, 'display', 'none');
    dragEl.parentNode.insertBefore(cloneEl, dragEl);
    Safari && css(document.body, 'user-select', 'none');
  },

  _getGhostElement: function () {
    const { customGhost } = this.options;
    if (typeof customGhost === 'function') {
      const selectedElements = this.multiplayer.getSelectedElements();
      return customGhost(selectedElements.length ? selectedElements : [dragEl]);
    }
    return this.multiplayer.getGhostElement() || dragEl;
  },

  _appendGhost() {
    if (ghostEl) return;

    const { fallbackOnBody, ghostClass, ghostStyle } = this.options;
    const container = fallbackOnBody ? document.body : this.el;
    const element = this._getGhostElement();

    ghostEl = element.cloneNode(true);
    toggleClass(ghostEl, ghostClass, true);

    const rect = getRect(dragEl);
    const style = Object.assign(
      {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        minWidth: rect.width,
        minHeight: rect.height,
        opacity: '0.8',
        overflow: 'hidden',
        'z-index': '100000',
        'box-sizing': 'border-box',
        'pointer-events': 'none',
      },
      ghostStyle
    );

    for (const key in style) {
      css(ghostEl, key, style[key]);
    }

    setTransition(ghostEl, 'none');
    setTransform(ghostEl, 'translate3d(0px, 0px, 0px)');

    Sortable.ghost = ghostEl;
    container.appendChild(ghostEl);

    const ox = ((dragEvent.clientX - rect.left) / parseInt(ghostEl.style.width)) * 100;
    const oy = ((dragEvent.clientY - rect.top) / parseInt(ghostEl.style.height)) * 100;
    css(ghostEl, 'transform-origin', `${ox}% ${oy}%`);
    css(ghostEl, 'transform', 'translateZ(0)');
    css(ghostEl, 'will-change', 'transform');
  },

  _nearestSortable: function (/** TouchEvent|MouseEvent */ evt) {
    preventDefault(evt);
    if (!dragEvent || !dragEl || !_positionChanged(evt)) return;

    // Init in the move event to prevent conflict with the click event
    !moveEvent && this._onStarted();

    const { event, target } = getEvent(evt);

    moveEvent = event;

    const dx = event.clientX - dragEvent.clientX;
    const dy = event.clientY - dragEvent.clientY;
    setTransform(ghostEl, `translate3d(${dx}px, ${dy}px, 0)`);

    if (this.options.autoScroll) {
      const scrollEl = getParentAutoScrollElement(target, true);
      this.autoScroller.update(scrollEl, dragEvent, moveEvent);
    }

    const nearest = _detectNearestSortable(event.clientX, event.clientY);
    nearest && nearest[expando]._onMove(event, target);
  },

  _allowPut: function () {
    if (dragEvent.sortable.el === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name, put } = this.options.group;
      const fromGroup = dragEvent.sortable.options.group;
      return (
        (put.join && put.indexOf(fromGroup.name) > -1) ||
        (fromGroup.name && name && fromGroup.name === name)
      );
    }
  },

  _allowSwap: function () {
    const order = sort(cloneEl, dropEl);

    nextEl = order < 0 ? dropEl.nextSibling : dropEl;

    let rect = getRect(dropEl),
      direction =
        typeof this.options.direction === 'function'
          ? this.options.direction.call(moveEvent, dragEl, this)
          : this.options.direction,
      vertical = direction === 'vertical',
      mouseOnAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
      dropElSize = dropEl[direction === 'vertical' ? 'offsetHeight' : 'offsetWidth'],
      hoverArea =
        mouseOnAxis >= (vertical ? rect.top : rect.left) &&
        mouseOnAxis < (vertical ? rect.bottom : rect.right) - dropElSize / 2
          ? -1
          : 1;

    if (lastDropEl !== dropEl) {
      lastHoverArea = hoverArea;
      return true;
    }

    if (lastHoverArea !== hoverArea) {
      lastHoverArea = hoverArea;
      return hoverArea < 0 ? order > 0 : order < 0;
    }
    return false;
  },

  _onMove: function (/** TouchEvent|MouseEvent */ event, target) {
    if (!this._allowPut()) return;

    dispatchEvent({
      sortable: this,
      name: 'onMove',
      params: this._getParams(event),
    });

    // insert to last
    if (this.el !== from && (target === this.el || !lastChild(this.el))) {
      dropEl = lastDropEl = null;
      this._onInsert(event);
      return;
    }

    dropEl = closest(target, this.options.draggable, this.el);

    if (!dropEl || dropEl.animated || !this._allowSwap()) return;
    if (dropEl === cloneEl || containes(dropEl, cloneEl)) {
      lastDropEl = dropEl;
      return;
    }

    if (this.el !== from) {
      this._onInsert(event);
    } else if (!(within(event, parentEl) && target === parentEl)) {
      this._onChange(event);
    }
    lastDropEl = dropEl;
  },

  _onInsert: function (event) {
    const target = dropEl || cloneEl;
    parentEl = dropEl ? dropEl.parentNode : this.el;

    from[expando].animator.collect(cloneEl, null, cloneEl.parentNode, cloneEl);
    this.animator.collect(null, target, parentEl, cloneEl);
    this.multiplayer.onChange(this);

    to = this.el;
    oldIndex = index(cloneEl);
    newIndex = index(target);
    targetNode = target;

    // show dragEl before clone to another list
    // no need to trigger 'onRemove' when clone to another list
    if (
      pullMode === 'clone' &&
      this.el !== dragEvent.sortable.el &&
      from === dragEvent.sortable.el
    ) {
      this.animator.collect(dragEl, cloneEl, dragEl.parentNode);

      css(dragEl, 'display', '');
      if (!dragEvent.sortable.options.group.revertDrag) {
        dragEl.parentNode.insertBefore(dragEl, cloneEl);
      }
      dragEvent.sortable.multiplayer.toggleVisible(true);

      this.animator.animate();
    } else {
      dispatchEvent({
        sortable: from[expando],
        name: 'onRemove',
        params: this._getParams(event),
      });
    }

    if (dropEl) {
      parentEl.insertBefore(cloneEl, dropEl);
    } else {
      parentEl.appendChild(cloneEl);
    }

    // hide dragEl when returning to the original list
    // no need to trigger 'onAdd' when clone back to the original list
    if (pullMode === 'clone' && this.el === dragEvent.sortable.el) {
      css(dragEl, 'display', 'none');
      dragEvent.sortable.multiplayer.toggleVisible(false);
    } else {
      dispatchEvent({
        sortable: this,
        name: 'onAdd',
        params: this._getParams(event),
      });
    }

    from[expando].animator.animate();
    this.animator.animate();

    from = this.el;
  },

  _onChange: function (event) {
    if (dropEl === dragEl) return;

    parentEl = dropEl.parentNode;

    this.animator.collect(cloneEl, dropEl, parentEl);
    this.multiplayer.onChange(this);

    oldIndex = index(cloneEl);
    newIndex = index(dropEl);
    targetNode = dropEl;

    parentEl.insertBefore(cloneEl, nextEl);

    dispatchEvent({
      sortable: this,
      name: 'onChange',
      params: this._getParams(event),
    });

    this.animator.animate();

    from = this.el;
  },

  _onDrop: function (/** TouchEvent|MouseEvent */ event) {
    preventDefault(event);
    this._cancelStart();

    off(listenerNode, 'touchmove', this._nearestSortable);
    off(listenerNode, 'mousemove', this._nearestSortable);
    off(listenerNode, 'mouseup', this._onDrop);
    off(listenerNode, 'touchend', this._onDrop);
    off(listenerNode, 'touchcancel', this._onDrop);

    if (dragEl && dragEvent && moveEvent) {
      this._onEnd(event);
    } else if (this.options.multiple) {
      this.multiplayer.onSelect(dragEvent, event, dragEl, this);
    }

    if (ghostEl && ghostEl.parentNode) {
      ghostEl.parentNode.removeChild(ghostEl);
    }

    this.multiplayer.destroy();
    this.autoScroller.destroy();

    _nulling();
  },

  _onEnd: function (event) {
    from = dragEvent.sortable.el;
    oldIndex = dragIndex;

    const listChanged = from !== to;

    // swap real drag element to the current drop position
    if (this.options.swapOnDrop && (pullMode !== 'clone' || !listChanged)) {
      parentEl.insertBefore(dragEl, cloneEl);
    }

    if (targetNode === cloneEl) targetNode = dragEl;

    this.multiplayer.onDrop(from[expando], listChanged, pullMode);

    const params = this._getParams(event);
    if (listChanged) {
      dispatchEvent({
        sortable: from[expando],
        name: 'onDrop',
        params: params,
      });
    }
    dispatchEvent({
      sortable: to[expando],
      name: 'onDrop',
      params: params,
    });

    if (pullMode !== 'clone' || !listChanged || this.multiplayer.active()) {
      parentEl.removeChild(cloneEl);
    } else {
      toggleClass(cloneEl, this.options.chosenClass, false);
    }

    css(dragEl, 'display', '');
    Safari && css(document.body, 'user-select', '');
  },

  _getParams: function (event) {
    let evt = Object.create(null);

    evt.event = event;

    evt.to = to;
    evt.from = from;
    evt.node = dragEl;
    evt.clone = cloneEl;
    evt.target = targetNode;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;

    evt.pullMode = pullMode;
    evt.relative = targetNode === dragEl ? 0 : sort(targetNode, cloneEl);

    let multiParams = this.multiplayer.getParams();
    if (multiParams.nodes) {
      evt.nodes = multiParams.nodes;
    }
    if (multiParams.clones) {
      evt.clones = multiParams.clones;
    }

    return evt;
  },

  // ========================================= Public Methods =========================================
  destroy() {
    _nulling();
    this._cancelStart();

    off(this.el, 'touchstart', this._onDrag);
    off(this.el, 'mousedown', this._onDrag);

    sortables.splice(sortables.indexOf(this.el), 1);
    this.el[expando] = this.animator = this.multiplayer = this.autoScroller = null;
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

  select(element) {
    this.multiplayer.select(element);
  },

  deselect(element) {
    this.multiplayer.deselect(element);
  },

  getSelectedElements() {
    return this.multiplayer.getSelectedElements();
  },
};

const _nulling = function () {
  to =
    from =
    dragEl =
    dropEl =
    nextEl =
    cloneEl =
    ghostEl =
    parentEl =
    pullMode =
    oldIndex =
    newIndex =
    dragIndex =
    dragEvent =
    moveEvent =
    targetNode =
    lastDropEl =
    listenerNode =
    lastHoverArea =
    dragStartTimer =
    Sortable.clone =
    Sortable.ghost =
    Sortable.active =
    Sortable.dragged =
      null;
};

Sortable.utils = {
  on: on,
  off: off,
  css: css,
  index: index,
  closest: closest,
  getRect: getRect,
  toggleClass: toggleClass,
  detectDirection: detectDirection,
};

Sortable.get = function (element) {
  return element[expando];
};

Sortable.create = function (el, options) {
  return new Sortable(el, options);
};

export default Sortable;
