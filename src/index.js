import {
  on,
  off,
  css,
  sort,
  Edge,
  index,
  Safari,
  expando,
  matches,
  closest,
  getRect,
  getChild,
  containes,
  lastChild,
  IE11OrLess,
  toggleClass,
  dispatchEvent,
  preventDefault,
  detectDirection,
  getAutoScrollElement,
} from './utils.js';
import AutoScroll from './Plugins/Autoscroll.js';
import Animation from './Plugins/Animation.js';
import Multiple from './Plugins/Multiple.js';

let sortables = [];

let to,
  from,
  dragEl,
  dropEl,
  nextEl,
  cloneEl,
  ghostEl,
  startEl,
  targetEl,
  parentEl,
  pullMode,
  oldIndex,
  newIndex,
  startIndex,
  dragEvent,
  moveEvent,
  lastDropEl,
  cloneEvent,
  cloneTarget,
  listenerNode,
  lastHoverArea,
  dragStartTimer;

function _prepareGroup(options) {
  let group = {};
  let originalGroup = options.group;

  if (!originalGroup || typeof originalGroup !== 'object') {
    originalGroup = { name: originalGroup, pull: true, put: true, revertDrag: true };
  }

  group.name = originalGroup.name;
  group.pull = originalGroup.pull ?? true;
  group.put = originalGroup.put ?? true;
  group.revertDrag = originalGroup.revertDrag ?? true;

  options.group = group;
}

/**
 * Detects nearest empty sortable to X and Y position using emptyInsertThreshold.
 */
function _detectNearestSortable(x, y) {
  let nearestRect;
  return sortables.reduce((result, element) => {
    const threshold = element[expando].options.emptyInsertThreshold;
    if (threshold == void 0) return;

    const rect = getRect(element),
      insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
      insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

    if (
      insideHorizontally &&
      insideVertically &&
      (!nearestRect ||
        (nearestRect &&
          rect.left >= nearestRect.left &&
          rect.right <= nearestRect.right &&
          rect.top >= nearestRect.top &&
          rect.bottom <= nearestRect.bottom))
    ) {
      result = element;
      nearestRect = rect;
    }

    return result;
  }, null);
}

function _positionChanged(evt) {
  const lastEvent = moveEvent || dragEvent;

  return !(
    evt.clientX !== void 0 &&
    evt.clientY !== void 0 &&
    Math.abs(evt.clientX - lastEvent.clientX) <= 0 &&
    Math.abs(evt.clientY - lastEvent.clientY) <= 0
  );
}

/**
 * @class Sortable
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
    group: '',
    handle: null,
    sortable: true,
    disabled: false,
    multiple: false,
    lockAxis: '',
    direction: '',
    animation: 150,
    easing: '',
    draggable: '>*',
    selectHandle: null,
    customGhost: null,
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
    placeholderClass: '',
    swapOnDrop: true,
    removeCloneOnDrop: true,
    fallbackOnBody: false,
    supportTouch: 'ontouchstart' in window,
    emptyInsertThreshold: -1,
  };

  // Set default options
  for (let name in defaults) {
    !(name in this.options) && (this.options[name] = defaults[name]);
  }

  _prepareGroup(options);

  // Bind all private methods
  for (let fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }

  on(el, this.options.supportTouch ? 'touchstart' : 'mousedown', this._onDrag);

  this.autoScroller = new AutoScroll(this.options);
  this.multiplayer = new Multiple(this.options);
  this.animator = new Animation(this.options);

  sortables.push(el);
}

Sortable.prototype = {
  constructor: Sortable,

  _onDrag(event) {
    // Don't trigger start event when an element is been dragged
    if (dragEl || this.options.disabled || !this.options.group.pull) return;

    // only left button and enabled
    if (/mousedown|pointerdown/.test(event.type) && event.button !== 0) return;

    let touch = event.touches && event.touches[0],
      target = (touch || event).target;

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;

    const element = closest(target, this.options.draggable, this.el);

    // No dragging is allowed when there is no dragging element
    if (!element || element.animated) return;

    dragEvent = {
      event,
      clientX: (touch || event).clientX,
      clientY: (touch || event).clientY,
    };
    dragEl = element;
    listenerNode = touch ? dragEl : document;

    on(listenerNode, 'mouseup', this._onDrop);
    on(listenerNode, 'touchend', this._onDrop);
    on(listenerNode, 'touchcancel', this._onDrop);

    // use multi-select-handle
    if (this.multiplayer.useSelectHandle(event, target)) return;

    const { handle } = this.options;
    if (typeof handle === 'function' && !handle(event)) return;
    if (typeof handle === 'string' && !closest(target, handle, dragEl)) return;

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

    // Do not allow text to be selected when draggable
    on(document, 'selectstart', preventDefault);
    Safari && css(document.body, 'user-select', 'none');
  },

  _delayMoveHandler(event) {
    const evt = event.touches ? event.touches[0] : event;
    if (
      Math.max(
        Math.abs(evt.clientX - dragEvent.clientX),
        Math.abs(evt.clientY - dragEvent.clientY)
      ) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))
    ) {
      this._cancelStart();
    }
  },

  _cancelStart() {
    clearTimeout(dragStartTimer);
    off(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
    off(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
    off(this.el.ownerDocument, 'mouseup', this._cancelStart);
    off(this.el.ownerDocument, 'touchend', this._cancelStart);
    off(this.el.ownerDocument, 'touchcancel', this._cancelStart);

    off(document, 'selectstart', preventDefault);
    Safari && css(document.body, 'user-select', '');
  },

  _onStart(touch, event) {
    preventDefault(event);

    const i = index(dragEl);

    to = this.el;
    from = this.el;
    targetEl = dragEl;
    oldIndex = i;
    newIndex = i;
    startIndex = i;
    cloneEvent = { to: this.el, target: dragEl, newIndex: i, relative: 0 };
    cloneTarget = dragEl;

    startEl = this.el;
    cloneEl = dragEl.cloneNode(true);
    parentEl = dragEl.parentNode;
    pullMode = this.options.group.pull;

    Sortable.clone = cloneEl;
    Sortable.active = this;
    Sortable.dragged = dragEl;

    this.multiplayer.onChoose();
    toggleClass(dragEl, this.options.chosenClass, true);

    dispatchEvent({
      sortable: this,
      name: 'onChoose',
      evt: this._getEventProperties(event),
    });

    on(listenerNode, touch ? 'touchmove' : 'mousemove', this._nearestSortable);

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

  _onStarted() {
    this.animator.collect(parentEl);

    toggleClass(cloneEl, this.options.chosenClass, true);
    toggleClass(cloneEl, this.options.placeholderClass, true);

    this._appendGhost();
    this.multiplayer.toggleVisible(false);

    css(dragEl, 'display', 'none');
    dragEl.parentNode.insertBefore(cloneEl, dragEl);

    dispatchEvent({
      sortable: this,
      name: 'onDrag',
      evt: this._getEventProperties(dragEvent.event),
    });

    this.animator.animate();
    this.autoScroller.onStarted();
  },

  _getGhostElement() {
    const { customGhost } = this.options;
    if (typeof customGhost === 'function') {
      const selects = this.multiplayer.selects;
      return customGhost(this.multiplayer.isActive() ? selects : [dragEl]);
    }

    return dragEl;
  },

  _appendGhost() {
    if (ghostEl) return;

    const container = this.options.fallbackOnBody ? document.body : this.el;
    const element = this._getGhostElement();

    ghostEl = element.cloneNode(true);
    toggleClass(ghostEl, this.options.ghostClass, true);

    const rect = getRect(dragEl);
    const style = Object.assign(
      {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 100000,
        opacity: '0.8',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: '',
        transition: '',
        pointerEvents: 'none',
      },
      this.options.ghostStyle
    );

    for (let key in style) {
      css(ghostEl, key, style[key]);
    }

    Sortable.ghost = ghostEl;
    container.appendChild(ghostEl);

    const ox = ((dragEvent.clientX - rect.left) / parseInt(ghostEl.style.width)) * 100;
    const oy = ((dragEvent.clientY - rect.top) / parseInt(ghostEl.style.height)) * 100;
    css(ghostEl, 'transform-origin', `${ox}% ${oy}%`);
    css(ghostEl, 'will-change', 'transform');
  },

  _nearestSortable(event) {
    preventDefault(event);

    let touch = event.touches && event.touches[0],
      evt = touch || event;

    if (!dragEl || !_positionChanged(evt)) return;

    // init in the move event to prevent conflict with the click event
    !moveEvent && this._onStarted();

    let lockAxis = this.options.lockAxis,
      clientX = lockAxis === 'x' ? dragEvent.clientX : evt.clientX,
      clientY = lockAxis === 'y' ? dragEvent.clientY : evt.clientY,
      target = document.elementFromPoint(clientX, clientY),
      dx = clientX - dragEvent.clientX,
      dy = clientY - dragEvent.clientY;

    moveEvent = { event, clientX, clientY };

    css(ghostEl, 'transform', `translate3d(${dx}px, ${dy}px, 0)`);

    const nearest = _detectNearestSortable(clientX, clientY);
    nearest && nearest[expando]._onMove(event, target);

    let options = nearest ? nearest[expando].options : null;
    let scrollEl = null;
    if ((!nearest || options.autoScroll) && dragEvent && moveEvent) {
      scrollEl = getAutoScrollElement(target, true);
    }
    this.autoScroller.onMove(scrollEl, moveEvent, options || this.options);
  },

  _allowPut() {
    if (startEl === this.el) {
      return true;
    }

    if (!this.options.group.put) {
      return false;
    }

    const { name, put } = this.options.group;
    const fromGroup = startEl[expando].options.group;
    return (
      (put.join && put.indexOf(fromGroup.name) > -1) ||
      (fromGroup.name && name && fromGroup.name === name)
    );
  },

  _getDirection() {
    const { draggable, direction } = this.options;
    return direction
      ? typeof direction === 'function'
        ? direction.call(moveEvent.event, cloneEl, this)
        : direction
      : detectDirection(parentEl, draggable);
  },

  _allowSwap() {
    let rect = getRect(dropEl),
      vertical = this._getDirection() === 'vertical',
      front = vertical ? 'top' : 'left',
      behind = vertical ? 'bottom' : 'right',
      dropElSize = dropEl[vertical ? 'offsetHeight' : 'offsetWidth'],
      mouseAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
      hoverArea = mouseAxis >= rect[front] && mouseAxis < rect[behind] - dropElSize / 2 ? -1 : 1,
      childf = getChild(parentEl, 0, this.options.draggable),
      childl = lastChild(parentEl),
      childfRect = getRect(childf),
      childlRect = getRect(childl);

    if (dropEl === parentEl || containes(parentEl, dropEl)) {
      // The dragged element is the first child of its parent
      if (cloneEl === childf && mouseAxis < childfRect[front]) {
        nextEl = dropEl;
        return true;
      }
      // Dragged element is the last child of its parent
      if (cloneEl === childl && mouseAxis > childlRect[behind]) {
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

  _onMove(event, target) {
    if (this.options.disabled || !this._allowPut()) return;

    dropEl = closest(target, this.options.draggable, this.el);

    dispatchEvent({
      sortable: this,
      name: 'onMove',
      evt: this._getEventProperties(event, { target: dropEl }),
    });

    // dragEl is allowed to return to the original list in `sortable: false`
    if (!this.options.sortable && this.el === startEl) {
      if (from !== startEl) {
        dropEl = lastDropEl = dragEl;
        lastHoverArea = 0;
        this._onInsert(event);
      }
      return;
    }

    // insert to last
    if (this.el !== from && (target === this.el || !lastChild(this.el))) {
      dropEl = lastDropEl = null;
      this._onInsert(event);
      return;
    }

    if (!dropEl || dropEl.animated || containes(dropEl, cloneEl) || !this._allowSwap()) return;
    if (dropEl === cloneEl || nextEl === cloneEl) {
      lastDropEl = dropEl;
      return;
    }

    if (this.el !== from) {
      this._onInsert(event);
    } else if (dropEl !== dragEl) {
      this._onChange(event);
    }
    lastDropEl = dropEl;
  },

  _onInsert(event) {
    let target = dropEl || cloneEl,
      cloneTo = pullMode === 'clone' && this.el !== startEl && from === startEl,
      cloneBack = pullMode === 'clone' && this.el === startEl && from !== startEl,
      dropExist = containes(dropEl, document),
      dragRemoved = dropEl === dragEl && !dropExist,
      fromSortable = from[expando],
      startSortable = startEl[expando];

    to = this.el;
    oldIndex = index(cloneEl);
    targetEl = target;
    parentEl = dropExist ? dropEl.parentNode : this.el;

    fromSortable.animator.collect(cloneEl.parentNode);
    this.animator.collect(parentEl);

    // show dragEl before clone to another list
    if (cloneTo) {
      cloneEvent.target = cloneTarget;
      cloneEvent.newIndex = oldIndex;
      cloneEvent.relative = cloneTarget === dragEl ? 0 : sort(cloneEl, cloneTarget);

      css(dragEl, 'display', '');
      startSortable.multiplayer.toggleVisible(true);
      if (!startSortable.options.group.revertDrag) {
        cloneEl.parentNode.insertBefore(dragEl, cloneEl);
      }
    }

    // hide dragEl when returning to the original list
    if (cloneBack) {
      oldIndex = index(dragEl);
      css(dragEl, 'display', 'none');
      this.multiplayer.toggleVisible(false);
    }

    css(cloneEl, 'display', dragRemoved ? 'none' : '');

    if (dropEl && dropExist) {
      parentEl.insertBefore(cloneEl, lastHoverArea < 0 ? dropEl : dropEl.nextSibling);
    } else {
      parentEl.appendChild(cloneEl);
    }

    newIndex = dragRemoved ? startIndex : index(cloneEl);

    if (cloneTo && startSortable.options.group.revertDrag) {
      cloneEvent.target = dragEl;
      cloneEvent.newIndex = startIndex;
      cloneEvent.relative = 0;

      dispatchEvent({
        sortable: startSortable,
        name: 'onChange',
        evt: this._getEventProperties(event, {
          to: startEl,
          target: dragEl,
          newIndex: startIndex,
          revertDrag: true,
        }),
      });
    }

    if (!cloneTo) {
      dispatchEvent({
        sortable: fromSortable,
        name: 'onRemove',
        evt: this._getEventProperties(event, { newIndex: -1 }),
      });
    }

    if (cloneBack && target !== dragEl) {
      cloneTarget = target;
      dispatchEvent({
        sortable: this,
        name: 'onChange',
        evt: this._getEventProperties(event, {
          from: startEl,
          backToOrigin: true,
        }),
      });
    }

    if (!cloneBack) {
      dispatchEvent({
        sortable: this,
        name: 'onAdd',
        evt: this._getEventProperties(event, { oldIndex: -1 }),
      });
    }

    fromSortable.animator.animate();
    this.animator.animate();

    from = this.el;
  },

  _onChange(event) {
    this.animator.collect(parentEl);

    oldIndex = index(cloneEl);
    parentEl = dropEl.parentNode;
    targetEl = dropEl;

    if (this.el === startEl) {
      cloneTarget = dropEl;
    }

    parentEl.insertBefore(cloneEl, nextEl);

    newIndex = index(cloneEl);

    dispatchEvent({
      sortable: this,
      name: 'onChange',
      evt: this._getEventProperties(event),
    });

    this.animator.animate();

    from = this.el;
  },

  _onDrop(event) {
    this._cancelStart();

    off(listenerNode, 'touchmove', this._nearestSortable);
    off(listenerNode, 'mousemove', this._nearestSortable);
    off(listenerNode, 'mouseup', this._onDrop);
    off(listenerNode, 'touchend', this._onDrop);
    off(listenerNode, 'touchcancel', this._onDrop);

    if (startEl) {
      from = startEl;
      oldIndex = startIndex;

      if (targetEl === cloneEl) {
        targetEl = dragEl;
      }

      this.animator.collect(parentEl);
      this.multiplayer.toggleChosenClass(false);
      toggleClass(dragEl, this.options.chosenClass, false);

      dispatchEvent({
        sortable: this,
        name: 'onUnchoose',
        evt: this._getEventProperties(event),
      });

      moveEvent && this._onEnd(event);
      !moveEvent && this.animator.animate();
    }

    // check whether the event is a click event
    const evt = event.changedTouches ? event.changedTouches[0] : event;
    !_positionChanged(evt) && this.multiplayer.onSelect(event, dragEl, startEl, this);

    if (ghostEl && ghostEl.parentNode) {
      ghostEl.parentNode.removeChild(ghostEl);
    }

    this._nulling();
  },

  _onEnd(event) {
    toggleClass(cloneEl, this.options.chosenClass, false);
    toggleClass(cloneEl, this.options.placeholderClass, false);

    const isClone = pullMode === 'clone';
    this.multiplayer.onDrop(from, to, isClone);

    const evt = this._getEventProperties(event);

    // swap real drag element to the current drop position
    const { swapOnDrop, removeCloneOnDrop } = this.options;
    if (
      (!isClone || from === to) &&
      (typeof swapOnDrop === 'function' ? swapOnDrop(evt) : swapOnDrop)
    ) {
      parentEl.insertBefore(dragEl, cloneEl);
    }

    if (
      (!isClone || from === to || this.multiplayer.isActive()) &&
      (typeof removeCloneOnDrop === 'function' ? removeCloneOnDrop(evt) : removeCloneOnDrop)
    ) {
      cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
    }

    css(dragEl, 'display', '');
    this.animator.animate();

    if (from !== to) {
      dispatchEvent({
        sortable: from[expando],
        name: 'onDrop',
        evt: Object.assign({}, evt, isClone ? cloneEvent : { newIndex: -1 }),
      });
    }
    dispatchEvent({
      sortable: to[expando],
      name: 'onDrop',
      evt: Object.assign({}, evt, from === to ? {} : { oldIndex: -1 }),
    });
  },

  _getEventProperties(originalEvent, extra = {}) {
    let evt = {};

    evt.event = originalEvent;
    evt.to = to;
    evt.from = from;
    evt.node = dragEl;
    evt.clone = cloneEl;
    evt.target = targetEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.pullMode = pullMode;

    Object.assign(evt, this.multiplayer.eventProperties(), extra);

    evt.relative = targetEl === dragEl ? 0 : sort(cloneEl, targetEl);

    return evt;
  },

  _nulling() {
    to =
      from =
      dragEl =
      dropEl =
      nextEl =
      cloneEl =
      ghostEl =
      startEl =
      targetEl =
      parentEl =
      pullMode =
      oldIndex =
      newIndex =
      startIndex =
      dragEvent =
      moveEvent =
      lastDropEl =
      cloneEvent =
      cloneTarget =
      listenerNode =
      lastHoverArea =
      dragStartTimer =
      Sortable.clone =
      Sortable.ghost =
      Sortable.active =
      Sortable.dragged =
        null;

    this.multiplayer.nulling();
    this.autoScroller.nulling();
  },

  destroy() {
    this._cancelStart();
    this._nulling();

    off(this.el, 'touchstart', this._onDrag);
    off(this.el, 'mousedown', this._onDrag);

    const index = sortables.indexOf(this.el);
    index > -1 && sortables.splice(index, 1);

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
    return this.multiplayer.selects;
  },
};

Sortable.utils = {
  on,
  off,
  css,
  index,
  closest,
  getRect,
  toggleClass,
  detectDirection,
};

Sortable.get = function (element) {
  return element[expando];
};

Sortable.create = function (el, options) {
  return new Sortable(el, options);
};

export default Sortable;
