import {
  on,
  off,
  css,
  sort,
  Edge,
  index,
  Safari,
  within,
  expando,
  matches,
  closest,
  getRect,
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
  getChild,
} from './utils.js';
import AutoScroll from './Plugins/Autoscroll.js';
import Animation from './Plugins/Animation.js';
import Multiple from './Plugins/Multiple.js';

let sortables = [];

let fromEl,
  dragEl,
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
  dragStartTimer;

let to, from, pullMode, oldIndex, newIndex, fromIndex, targetNode;

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
function _detectNearestSortable(x, y) {
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
}

function _positionChanged(evt) {
  let lastEvent = moveEvent || dragEvent;

  if (
    evt.clientX !== void 0 &&
    evt.clientY !== void 0 &&
    Math.abs(evt.clientX - lastEvent.clientX) <= 0 &&
    Math.abs(evt.clientY - lastEvent.clientY) <= 0
  ) {
    return false;
  }

  return true;
}

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
    direction: '',
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

  _onDrag: function (/** TouchEvent|MouseEvent */ event) {
    // Don't trigger start event when an element is been dragged
    if (dragEl || this.options.disabled || !this.options.group.pull) return;

    // only left button and enabled
    if (/mousedown|pointerdown/.test(event.type) && event.button !== 0) return;

    let touch = event.touches && event.touches[0],
      target = (touch || event).target;

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;

    let element = closest(target, this.options.draggable, this.el);

    // No dragging is allowed when there is no dragging element
    if (!element || element.animated) return;

    dragEvent = {
      original: event,
      clientX: (touch || event).clientX,
      clientY: (touch || event).clientY,
    };
    dragEl = element;
    listenerNode = touch ? dragEl : document;

    on(listenerNode, 'mouseup', this._onDrop);
    on(listenerNode, 'touchend', this._onDrop);
    on(listenerNode, 'touchcancel', this._onDrop);

    const { handle, selectHandle } = this.options;

    // allow multi-drag
    if (typeof selectHandle === 'function' && selectHandle(event)) return;
    if (typeof selectHandle === 'string' && matches(target, selectHandle)) return;

    // check handle
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

      dragStartTimer = setTimeout(() => this._onStart(touch, event), delay);
    } else {
      this._onStart(touch, event);
    }
  },

  _delayMoveHandler: function (event) {
    let evt = event.touches ? event.touches[0] : event;
    if (
      Math.max(
        Math.abs(evt.clientX - dragEvent.clientX),
        Math.abs(evt.clientY - dragEvent.clientY)
      ) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))
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

  _onStart: function (touch, event) {
    const i = index(dragEl);

    to = this.el;
    from = this.el;
    oldIndex = i;
    newIndex = i;
    fromIndex = i;
    targetNode = dragEl;

    fromEl = this.el;
    cloneEl = dragEl.cloneNode(true);
    parentEl = dragEl.parentNode;
    pullMode = this.options.group.pull;

    Sortable.clone = cloneEl;
    Sortable.active = this;
    Sortable.dragged = dragEl;

    toggleClass(dragEl, this.options.chosenClass, true);
    this.multiplayer.onChoose();

    dispatchEvent({
      sortable: this,
      name: 'onChoose',
      params: this._getParams(event),
    });

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
    toggleClass(cloneEl, this.options.chosenClass, true);

    this._appendGhost();
    this.multiplayer.onDrag(this);

    dispatchEvent({
      sortable: this,
      name: 'onDrag',
      params: this._getParams(dragEvent.original),
    });

    css(dragEl, 'display', 'none');
    toggleClass(dragEl, this.options.chosenClass, false);
    dragEl.parentNode.insertBefore(cloneEl, dragEl);

    if (Safari) {
      css(document.body, 'user-select', 'none');
    }
  },

  _getGhostElement: function () {
    const { customGhost } = this.options;
    if (typeof customGhost === 'function') {
      const selectedElements = this.multiplayer.selectedElements;
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

  _nearestSortable: function (/** TouchEvent|MouseEvent */ event) {
    preventDefault(event);

    let touch = event.touches && event.touches[0],
      evt = touch || event;

    if (!dragEvent || !dragEl || !_positionChanged(evt)) return;

    // Init in the move event to prevent conflict with the click event
    !moveEvent && this._onStarted();

    moveEvent = {
      original: event,
      clientX: evt.clientX,
      clientY: evt.clientY,
    };

    let target = touch ? document.elementFromPoint(evt.clientX, evt.clientY) : evt.target,
      dx = evt.clientX - dragEvent.clientX,
      dy = evt.clientY - dragEvent.clientY;

    setTransform(ghostEl, `translate3d(${dx}px, ${dy}px, 0)`);

    if (this.options.autoScroll) {
      const scrollEl = getParentAutoScrollElement(target, true);
      this.autoScroller.update(scrollEl, dragEvent, moveEvent);
    }

    const nearest = _detectNearestSortable(evt.clientX, evt.clientY);
    nearest && nearest[expando]._onMove(event, target);
  },

  _allowPut: function () {
    if (fromEl === this.el) {
      return true;
    } else if (!this.options.group.put) {
      return false;
    } else {
      const { name, put } = this.options.group;
      const fromGroup = fromEl[expando].options.group;
      return (
        (put.join && put.indexOf(fromGroup.name) > -1) ||
        (fromGroup.name && name && fromGroup.name === name)
      );
    }
  },

  _getDirection: function () {
    const { draggable, direction } = this.options;
    return direction
      ? typeof direction === 'function'
        ? direction.call(moveEvent.original, dragEl, this)
        : direction
      : detectDirection(parentEl, draggable);
  },

  _allowSwap: function () {
    let rect = getRect(dropEl),
      direction = this._getDirection(),
      vertical = direction === 'vertical',
      front = vertical ? 'top' : 'left',
      behind = vertical ? 'bottom' : 'right',
      dropElSize = dropEl[vertical ? 'offsetHeight' : 'offsetWidth'],
      mouseAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
      hoverArea = mouseAxis >= rect[front] && mouseAxis < rect[behind] - dropElSize / 2 ? -1 : 1,
      child1 = getChild(parentEl, 0, this.options.draggable),
      child2 = lastChild(parentEl),
      child1Rect = getRect(child1),
      child2Rect = getRect(child2);

    if (dropEl === parentEl || containes(parentEl, dropEl)) {
      if (cloneEl === child1 && mouseAxis < child1Rect[front]) {
        nextEl = dropEl;
        return true;
      }
      if (cloneEl === child2 && mouseAxis > child2Rect[behind]) {
        nextEl = dropEl.nextSibling;
        return true;
      }
      return false;
    }

    const order = sort(cloneEl, dropEl);
    nextEl = order < 0 ? dropEl.nextSibling : dropEl;

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
    if (dropEl === cloneEl || nextEl === cloneEl) {
      lastDropEl = dropEl;
      return;
    }

    if (this.el !== from) {
      this._onInsert(event);
    } else {
      this._onChange(event);
    }
    lastDropEl = dropEl;
  },

  _onInsert: function (event) {
    let target = dropEl || cloneEl,
      cloneTo = pullMode === 'clone' && this.el !== fromEl && from === fromEl,
      cloneBack = pullMode === 'clone' && this.el === fromEl && from !== fromEl;

    to = this.el;
    oldIndex = index(cloneEl);
    targetNode = target;
    parentEl = dropEl ? dropEl.parentNode : this.el;

    from[expando].animator.collect(cloneEl.parentNode);
    this.animator.collect(parentEl);

    // show dragEl before clone to another list
    if (cloneTo) {
      css(dragEl, 'display', '');
      fromEl[expando].multiplayer.toggleVisible(true);
      if (!fromEl[expando].options.group.revertDrag) {
        from.insertBefore(dragEl, cloneEl);
      }
    }

    // hide dragEl when returning to the original list
    if (cloneBack) {
      oldIndex = index(dragEl);
      css(dragEl, 'display', 'none');
      this.multiplayer.toggleVisible(false);
    }

    if (dropEl) {
      parentEl.insertBefore(cloneEl, lastHoverArea < 0 ? dropEl : dropEl.nextSibling);
    } else {
      parentEl.appendChild(cloneEl);
    }

    newIndex = index(cloneEl);

    if (cloneTo && fromEl[expando].options.group.revertDrag) {
      dispatchEvent({
        sortable: fromEl[expando],
        name: 'onChange',
        params: this._getParams(event, {
          to: fromEl,
          target: dragEl,
          newIndex: fromIndex,
          revertDrag: true,
        }),
      });
    }

    if (!cloneTo) {
      dispatchEvent({
        sortable: from[expando],
        name: 'onRemove',
        params: this._getParams(event),
      });
    }

    if (cloneBack && dropEl !== dragEl) {
      dispatchEvent({
        sortable: this,
        name: 'onChange',
        params: this._getParams(event, {
          from: fromEl,
          backToOrigin: true,
        }),
      });
    }

    if (!cloneBack) {
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
    oldIndex = index(cloneEl);
    targetNode = dropEl;

    this.animator.collect(parentEl);
    parentEl.insertBefore(cloneEl, nextEl);

    newIndex = index(cloneEl);

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

    toggleClass(dragEl, this.options.chosenClass, false);

    if (fromEl) {
      from = fromEl;
      oldIndex = fromIndex;

      if (targetNode === cloneEl) targetNode = dragEl;

      this.multiplayer.toggleClass(false);

      dispatchEvent({
        sortable: this,
        name: 'onUnchoose',
        params: this._getParams(event),
      });

      moveEvent && this._onEnd(event);
    }

    if (!fromEl && !moveEvent && this.options.multiple) {
      let evt = event.changedTouches ? event.changedTouches[0] : event,
        dx = evt.clientX - dragEvent.clientX,
        dy = evt.clientY - dragEvent.clientY,
        dd = Math.sqrt(dx * dx + dy * dy);

      // check whether the event is a click event
      dd >= 0 && dd <= 1 && this.multiplayer.onSelect(event, dragEl, this);
    }

    if (ghostEl && ghostEl.parentNode) {
      ghostEl.parentNode.removeChild(ghostEl);
    }

    this.multiplayer.destroy();
    this.autoScroller.destroy();

    this._nulling();
  },

  _onEnd: function (event) {
    const params = this._getParams(event);

    this.multiplayer.onDrop(from, to, pullMode);

    let swapOnDrop = this.options.swapOnDrop;
    // swap real drag element to the current drop position
    if (
      (pullMode !== 'clone' || from === to) &&
      (typeof swapOnDrop === 'function' ? swapOnDrop(params) : swapOnDrop)
    ) {
      parentEl.insertBefore(dragEl, cloneEl);
    }

    if (pullMode !== 'clone' || from === to || this.multiplayer.active()) {
      cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
    } else {
      toggleClass(cloneEl, this.options.chosenClass, false);
    }

    css(dragEl, 'display', '');
    if (Safari) {
      css(document.body, 'user-select', '');
    }

    if (from !== to) {
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
  },

  _getParams: function (event, params = {}) {
    let evt = {};

    evt.event = event;
    evt.to = to;
    evt.from = from;
    evt.node = dragEl;
    evt.clone = cloneEl;
    evt.target = targetNode;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.pullMode = pullMode;

    this.multiplayer.setParams(evt);

    Object.assign(evt, params);

    evt.relative = evt.target === dragEl ? 0 : sort(evt.target, cloneEl);

    return evt;
  },

  _nulling: function () {
    to =
      from =
      fromEl =
      dragEl =
      dropEl =
      nextEl =
      cloneEl =
      ghostEl =
      parentEl =
      pullMode =
      oldIndex =
      newIndex =
      fromIndex =
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
  },

  // ========================================= Public Methods =========================================
  destroy() {
    this._nulling();
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
    return this.multiplayer.selectedElements;
  },
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
