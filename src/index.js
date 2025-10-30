import {
  on,
  off,
  css,
  sort,
  Edge,
  index,
  result,
  Safari,
  matches,
  expando,
  closest,
  getRect,
  getChild,
  contains,
  lastChild,
  IE11OrLess,
  toggleClass,
  dispatchEvent,
  preventDefault,
  detectDirection,
} from './utils.js';
import AutoScroll from './Plugins/Autoscroll.js';
import Animation from './Plugins/Animation.js';

let sortables = [];

let toEl,
  fromEl,
  dragEl,
  dropEl,
  nextEl,
  startEl,
  cloneEl,
  ghostEl,
  targetEl,
  parentEl,
  pullMode,
  oldIndex,
  newIndex,
  startIndex,
  dragEvent,
  moveEvent,
  lastDropEl,
  listenerEl,
  cloneEvent,
  cloneTarget,
  lastHoverArea;

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

function _mouseMoved(evt) {
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
    draggable: '>*',
    sortable: true,
    disabled: false,
    customGhost: null,
    lockAxis: '',
    direction: '',
    animation: 150,
    easing: '',
    ghostClass: '',
    ghostStyle: {},
    chosenClass: '',
    placeholderClass: '',
    autoScroll: true,
    scrollThreshold: 55,
    scrollSpeed: { x: 10, y: 10 },
    delay: 0,
    delayOnTouchOnly: false,
    swapOnDrop: true,
    removeCloneOnDrop: true,
    dropOnAnimationEnd: false,
    appendToBody: false,
    supportTouch: 'ontouchstart' in window,
    touchStartThreshold:
      (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    emptyInsertThreshold: -1,
  };

  // Set default options
  for (let name in defaults) {
    !(name in options) && (options[name] = defaults[name]);
  }

  _prepareGroup(options);

  // Bind all private methods
  for (let fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }

  on(el, options.supportTouch ? 'touchstart' : 'mousedown', this._onDrag);

  this.autoScroller = new AutoScroll(options);
  this.animator = new Animation(options);

  sortables.push(el);
}

Sortable.prototype = {
  constructor: Sortable,

  _onDrag(event) {
    let el = this.el,
      options = this.options,
      handle = options.handle,
      touch = event.touches && event.touches[0],
      target = (touch || event).target,
      ownerDocument = el.ownerDocument;

    // Don't trigger start event when an element is been dragged
    if (dragEl || options.disabled || !options.group.pull) return;

    // only left button and enabled
    if (/mousedown|pointerdown/.test(event.type) && event.button !== 0) return;

    // Safari ignores further event handling after mousedown
    if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;

    const element = closest(target, options.draggable, el);

    // No dragging is allowed when there is no dragging element
    if (!element || element.animating) return;

    dragEvent = {
      event,
      clientX: (touch || event).clientX,
      clientY: (touch || event).clientY,
    };
    dragEl = element;
    listenerEl = touch ? dragEl : document;

    on(listenerEl, 'mouseup', this._onDrop);
    on(listenerEl, 'touchend', this._onDrop);
    on(listenerEl, 'touchcancel', this._onDrop);

    // handle dragging detection
    if (
      (typeof handle === 'function' && !handle(event)) ||
      (typeof handle === 'string' && !closest(target, handle, dragEl))
    ) {
      return;
    }

    // Delay is impossible for native DnD in Edge or IE
    if (options.delay && (!options.delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
      on(ownerDocument, 'touchmove', this._delayedMoveHandler);
      on(ownerDocument, 'mousemove', this._delayedMoveHandler);
      on(ownerDocument, 'mouseup', this._cancelStart);
      on(ownerDocument, 'touchend', this._cancelStart);
      on(ownerDocument, 'touchcancel', this._cancelStart);

      this._dragStartTimer = setTimeout(() => this._onStart(touch, event), options.delay);
    } else {
      this._onStart(touch, event);
    }
  },

  _delayedMoveHandler(event) {
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
    let ownerDocument = this.el.ownerDocument;

    clearTimeout(this._dragStartTimer);
    off(ownerDocument, 'touchmove', this._delayedMoveHandler);
    off(ownerDocument, 'mousemove', this._delayedMoveHandler);
    off(ownerDocument, 'mouseup', this._cancelStart);
    off(ownerDocument, 'touchend', this._cancelStart);
    off(ownerDocument, 'touchcancel', this._cancelStart);
  },

  _onStart(touch, event) {
    preventDefault(event);

    let el = this.el,
      options = this.options,
      dragIndex = index(dragEl);

    oldIndex = dragIndex;
    newIndex = dragIndex;
    startIndex = dragIndex;

    toEl = el;
    fromEl = el;
    startEl = el;
    targetEl = dragEl;
    parentEl = dragEl.parentNode;
    pullMode = options.group.pull;

    cloneTarget = dragEl;
    cloneEvent = {
      to: el,
      target: dragEl,
      newIndex: dragIndex,
      relative: 0,
    };
    cloneEl = dragEl.cloneNode(true);

    Sortable.dragged = dragEl;
    Sortable.clone = cloneEl;
    Sortable.active = this;

    dispatchEvent({
      sortable: this,
      name: 'onChoose',
      evt: this._getEventProperties(event),
    });

    toggleClass(dragEl, options.chosenClass, true);

    on(listenerEl, touch ? 'touchmove' : 'mousemove', this._nearestSortable);

    // clear selection
    try {
      if (document.selection) {
        // Timeout neccessary for IE9
        setTimeout(() => document.selection.empty(), 0);
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (error) {}

    // Do not allow text to be selected when draggable
    on(document, 'selectstart', preventDefault);
    Safari && css(document.body, 'user-select', 'none');
  },

  _onStarted() {
    let options = this.options;

    this.animator.collect(parentEl);

    this._appendGhost();

    toggleClass(cloneEl, options.chosenClass, true);
    toggleClass(cloneEl, options.placeholderClass, true);

    dragEl.parentNode.insertBefore(cloneEl, dragEl);
    css(dragEl, 'display', 'none');

    dispatchEvent({
      sortable: this,
      name: 'onDrag',
      evt: this._getEventProperties(dragEvent.event),
    });

    this.animator.animate();
    this.autoScroller.onStarted();
  },

  _appendGhost() {
    if (ghostEl) return;

    let options = this.options;

    const container = options.appendToBody ? document.body : this.el;
    const element = result(options.customGhost, cloneEl) || cloneEl;

    ghostEl = element.cloneNode(true);
    toggleClass(ghostEl, options.ghostClass, true);

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
      options.ghostStyle
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

    if (!dragEl || !_mouseMoved(evt)) return;

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

    this.autoScroller.onMove(target, moveEvent, nearest, this.options);
  },

  _allowPut() {
    let group = this.options.group,
      startGroup = startEl[expando].options.group;

    if (this.el === startEl) return true;

    if (!group.put) return false;

    return (
      (group.put.join && group.put.indexOf(startGroup.name) > -1) ||
      (startGroup.name && group.name && startGroup.name === group.name)
    );
  },

  _getDirection() {
    let draggable = this.options.draggable,
      direction = this.options.direction;

    return direction
      ? result(direction, moveEvent.event, cloneEl, this)
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

    if (dropEl === parentEl || contains(parentEl, dropEl)) {
      // The dragged element is the first child of its parent
      if (cloneEl === childf && mouseAxis < childfRect[front]) {
        nextEl = dropEl;
        return true;
      }

      // The dragged element is the last child of its parent
      if (cloneEl === childl && mouseAxis > childlRect[behind]) {
        nextEl = dropEl.nextSibling;
        return true;
      }

      return false;
    }

    const order = sort(cloneEl, dropEl);
    nextEl = order < 0 ? dropEl.nextSibling : dropEl;

    // swap if new drop element
    if (lastDropEl !== dropEl) {
      lastHoverArea = hoverArea;
      return true;
    }

    // swap if changed hover area
    if (lastHoverArea !== hoverArea) {
      lastHoverArea = hoverArea;
      return hoverArea < 0 ? order > 0 : order < 0;
    }
    return false;
  },

  _onMove(event, target) {
    let el = this.el,
      options = this.options;

    if (options.disabled || !this._allowPut()) return;

    dropEl = closest(target, options.draggable, el);

    dispatchEvent({
      sortable: this,
      name: 'onMove',
      evt: this._getEventProperties(event, { target: dropEl }),
    });

    // dragEl is allowed to return to the original list in `sortable: false`
    if (!options.sortable && el === startEl) {
      if (fromEl !== startEl) {
        dropEl = lastDropEl = dragEl;
        lastHoverArea = 0;
        this._onInsert(event);
      }
      return;
    }

    // insert to last
    if (el !== fromEl && (target === el || !lastChild(el))) {
      dropEl = lastDropEl = null;
      this._onInsert(event);
      return;
    }

    if (!dropEl || dropEl.animating || contains(dropEl, cloneEl) || !this._allowSwap()) return;

    if (dropEl === cloneEl || nextEl === cloneEl) {
      lastDropEl = dropEl;
      return;
    }

    if (el !== fromEl) {
      this._onInsert(event);
    } else if (dropEl !== dragEl) {
      this._onChange(event);
    }
    lastDropEl = dropEl;
  },

  _onInsert(event) {
    let el = this.el,
      target = dropEl || cloneEl,
      cloneToOther = pullMode === 'clone' && el !== startEl && fromEl === startEl,
      cloneToStart = pullMode === 'clone' && el === startEl && fromEl !== startEl,
      dropElExist = contains(dropEl, document),
      hideCloneEl = dropEl === dragEl && !dropElExist,
      fromSortable = fromEl[expando],
      startSortable = startEl[expando];

    toEl = el;
    oldIndex = index(cloneEl);
    targetEl = target;
    parentEl = dropElExist ? dropEl.parentNode : el;

    fromSortable.animator.collect(cloneEl.parentNode);
    this.animator.collect(parentEl);

    if (cloneToOther) {
      cloneEvent.target = cloneTarget;
      cloneEvent.newIndex = oldIndex;
      cloneEvent.relative = cloneTarget === dragEl ? 0 : sort(cloneEl, cloneTarget);

      // show dragEl before clone to another list
      css(dragEl, 'display', '');
      if (!startSortable.options.group.revertDrag) {
        cloneEl.parentNode.insertBefore(dragEl, cloneEl);
      }
    }

    if (cloneToStart) {
      oldIndex = index(dragEl);

      // hide dragEl when returning to the original list
      css(dragEl, 'display', 'none');
    }

    css(cloneEl, 'display', hideCloneEl ? 'none' : '');

    if (dropEl && dropElExist) {
      parentEl.insertBefore(cloneEl, lastHoverArea < 0 ? dropEl : dropEl.nextSibling);
    } else {
      parentEl.appendChild(cloneEl);
    }

    newIndex = hideCloneEl ? startIndex : index(cloneEl);

    if (cloneToOther && startSortable.options.group.revertDrag) {
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

    if (!cloneToOther) {
      dispatchEvent({
        sortable: fromSortable,
        name: 'onRemove',
        evt: this._getEventProperties(event, { newIndex: -1 }),
      });
    }

    if (cloneToStart && target !== dragEl) {
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

    if (!cloneToStart) {
      dispatchEvent({
        sortable: this,
        name: 'onAdd',
        evt: this._getEventProperties(event, { oldIndex: -1 }),
      });
    }

    fromSortable.animator.animate();
    this.animator.animate();

    fromEl = el;
  },

  _onChange(event) {
    let el = this.el;

    this.animator.collect(parentEl);

    oldIndex = index(cloneEl);
    parentEl = dropEl.parentNode;
    targetEl = dropEl;

    if (el === startEl) {
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

    fromEl = el;
  },

  _onDrop(event) {
    let options = this.options;

    this._cancelStart();

    off(listenerEl, 'touchmove', this._nearestSortable);
    off(listenerEl, 'mousemove', this._nearestSortable);
    off(listenerEl, 'mouseup', this._onDrop);
    off(listenerEl, 'touchend', this._onDrop);
    off(listenerEl, 'touchcancel', this._onDrop);

    off(document, 'selectstart', preventDefault);
    Safari && css(document.body, 'user-select', '');

    ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);

    if (startEl) {
      fromEl = startEl;
      oldIndex = startIndex;

      if (targetEl === cloneEl) {
        targetEl = dragEl;
      }

      toggleClass(dragEl, options.chosenClass, false);

      dispatchEvent({
        sortable: this,
        name: 'onUnchoose',
        evt: this._getEventProperties(event),
      });

      if (moveEvent) {
        this.animator.collect(parentEl);

        toggleClass(cloneEl, options.chosenClass, false);
        toggleClass(cloneEl, options.placeholderClass, false);

        const evt = this._getEventProperties(event);

        !options.dropOnAnimationEnd && this._onEnd(evt);

        this.animator.animate(() => {
          options.dropOnAnimationEnd && this._onEnd(evt);
        });
      } else {
        this._nulling();
      }
    } else {
      this._nulling();
    }
  },

  _onEnd(evt) {
    let options = this.options,
      isClone = pullMode === 'clone',
      isSameEl = fromEl === toEl;

    // swap real drag element to the current drop position
    if ((!isClone || isSameEl) && result(options.swapOnDrop, evt)) {
      parentEl.insertBefore(dragEl, cloneEl);
    }

    if ((!isClone || isSameEl) && result(options.removeCloneOnDrop, evt)) {
      cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
    }

    css(dragEl, 'display', '');

    if (fromEl !== toEl) {
      dispatchEvent({
        sortable: fromEl[expando],
        name: 'onDrop',
        evt: Object.assign({}, evt, isClone ? cloneEvent : { newIndex: -1 }),
      });
    }
    dispatchEvent({
      sortable: toEl[expando],
      name: 'onDrop',
      evt: Object.assign({}, evt, isSameEl ? {} : { oldIndex: -1 }),
    });

    this._nulling();
  },

  _getEventProperties(originalEvent, extra = {}) {
    let evt = {};

    evt.event = originalEvent;
    evt.to = toEl;
    evt.from = fromEl;
    evt.node = dragEl;
    evt.clone = cloneEl;
    evt.target = targetEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.pullMode = pullMode;

    Object.assign(evt, extra);

    evt.relative = targetEl === dragEl ? 0 : sort(cloneEl, targetEl);

    return evt;
  },

  _nulling() {
    toEl =
      fromEl =
      dragEl =
      dropEl =
      nextEl =
      startEl =
      cloneEl =
      ghostEl =
      targetEl =
      parentEl =
      pullMode =
      oldIndex =
      newIndex =
      startIndex =
      dragEvent =
      moveEvent =
      lastDropEl =
      listenerEl =
      cloneEvent =
      cloneTarget =
      lastHoverArea =
      Sortable.clone =
      Sortable.ghost =
      Sortable.active =
      Sortable.dragged =
        null;

    this.autoScroller.nulling();
  },

  destroy() {
    this._cancelStart();
    this._nulling();

    off(this.el, 'touchstart', this._onDrag);
    off(this.el, 'mousedown', this._onDrag);

    const index = sortables.indexOf(this.el);
    index > -1 && sortables.splice(index, 1);

    this.el[expando] = this.animator = this.autoScroller = null;
  },

  option(key, value) {
    if (value === void 0) {
      return this.options[key];
    }

    // set option
    this.options[key] = value;
    this.animator.options[key] = value;
    this.autoScroller.options[key] = value;

    if (key === 'group') {
      _prepareGroup(this.options);
    }
  },
};

Sortable.utils = {
  on,
  off,
  css,
  index,
  matches,
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
