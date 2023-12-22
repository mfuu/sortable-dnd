/*!
 * sortable-dnd v0.6.2
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Sortable = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);

  /**
   * detect passive event support
   */
  var supportPassive = function () {
    // https://github.com/Modernizr/Modernizr/issues/1894
    var supportPassive = false;
    document.addEventListener('checkIfSupportPassive', null, {
      get passive() {
        supportPassive = true;
        return true;
      }
    });
    return supportPassive;
  }();
  var vendorPrefix = function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Server environment
      return {};
    }

    // window.getComputedStyle() returns null inside an iframe with display: none
    // in this case return an array with a fake mozilla style in it.
    var styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
    var dom = 'WebKit|Moz|MS|O'.match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1)
    };
  }();
  function setTransition(el, transition) {
    el.style["".concat(vendorPrefix.css, "transition")] = transition ? transition === 'none' ? 'none' : "".concat(transition) : '';
  }
  function setTransitionDuration(el, duration) {
    el.style["".concat(vendorPrefix.css, "transition-duration")] = duration == null ? '' : "".concat(duration, "ms");
  }
  function setTransform(el, transform) {
    el.style["".concat(vendorPrefix.css, "transform")] = transform ? "".concat(transform) : '';
  }

  /**
   * add specified event listener
   */
  function on(el, event, fn) {
    if (window.addEventListener) {
      el.addEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
    } else if (window.attachEvent) {
      el.attachEvent('on' + event, fn);
    } else {
      el['on' + event] = fn;
    }
  }

  /**
   * remove specified event listener
   */
  function off(el, event, fn) {
    if (window.removeEventListener) {
      el.removeEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
    } else if (window.detachEvent) {
      el.detachEvent('on' + event, fn);
    } else {
      el['on' + event] = null;
    }
  }

  /**
   * get touch event and current event
   * @param {MouseEvent|TouchEvent} evt
   */
  function getEvent(evt) {
    var event = evt;
    var touch = evt.touches && evt.touches[0] || evt.changedTouches && evt.changedTouches[0];
    var target = touch ? document.elementFromPoint(touch.clientX, touch.clientY) : evt.target;
    if (touch && !('clientX' in event)) {
      event.clientX = touch.clientX;
      event.clientY = touch.clientY;
      event.pageX = touch.pageX;
      event.pageY = touch.pageY;
      event.screenX = touch.screenX;
      event.screenY = touch.screenY;
    }
    return {
      touch: touch,
      event: event,
      target: target
    };
  }

  /**
   * get scroll element
   * @param {Boolean} includeSelf whether to include the passed element
   * @returns {HTMLElement} scroll element
   */
  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function getWindowScrollingElement() {
    return document.scrollingElement || document.documentElement;
  }

  /**
   * Returns the "bounding client rect" of given element
   * @param  {HTMLElement} el The element whose boundingClientRect is wanted
   * @param  {Boolean} relativeToContainingBlock Whether the rect should be relative to the containing block of (including) the container
   * @param  {HTMLElement} container The parent the element will be placed in
   * @return {Object} The boundingClientRect of el, with specified adjustments
   */
  function getRect(el, relativeToContainingBlock, container) {
    if (!el.getBoundingClientRect && el !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if (relativeToContainingBlock && el !== window) {
      container = container || el.parentNode;
      do {
        if (container && container.getBoundingClientRect) {
          var containerRect = container.getBoundingClientRect();

          // Set relative to edges of padding box of container
          top -= containerRect.top + parseInt(css(container, 'border-top-width'));
          left -= containerRect.left + parseInt(css(container, 'border-left-width'));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
        /* jshint boss:true */
      } while (container = container.parentNode);
    }
    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height
    };
  }
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector == null) {
          var children = Array.prototype.slice.call(ctx.children);

          // If it can be found directly in the child element, return
          var _index = children.indexOf(el);
          if (_index > -1) return children[_index];

          // When the dom cannot be found directly in children, need to look down
          for (var i = 0; i < children.length; i++) {
            if (containes(el, children[i])) return children[i];
          }
        } else if ((selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
      } while (el = el.parentNode);
    }
    return null;
  }

  /**
   * Check if child element is contained in parent element
   */
  function containes(el, root) {
    if (!el || !root) return false;
    if (root.compareDocumentPosition) {
      return root === el || !!(root.compareDocumentPosition(el) & 16);
    }
    if (root.contains && el.nodeType === 1) {
      return root.contains(el) && root !== el;
    }
    while (el = el.parentNode) if (el === root) return true;
    return false;
  }

  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @return {HTMLElement|null} The last child, ignoring ghostEl
   */
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }

  /**
   * Returns the index of an element within its parent for a selected set of elements
   */
  function index(el, selector) {
    var index = 0;
    if (!el || !el.parentNode) {
      return -1;
    }
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && (!selector || matches(el, selector)) && css(el, 'display') !== 'none') {
        index++;
      }
    }
    return index;
  }

  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible) and non-draggable elements
   * @return {HTMLElement} The child at index childNum, or null if not found
   */
  function getChild(el, childNum, selector, includeDragEl) {
    var i = 0,
      currentChild = 0,
      children = el.children;
    while (i < children.length) {
      if (children[i] !== Sortable.ghost && css(children[i], 'display') !== 'none' && closest(children[i], selector, el, false) && (includeDragEl || children[i] !== Sortable.dragged)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }

  // https://github.com/SortableJS/Sortable/blob/c5a882267542456d75b16d000dc1b603a907613a/src/Sortable.js#L161
  function detectDirection(el, selector) {
    var elCSS = css(el),
      elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
      child1 = getChild(el, 0, selector),
      child2 = getChild(el, 1, selector),
      child1CSS = child1 && css(child1),
      child2CSS = child2 && css(child2),
      child1Width = child1CSS && parseInt(child1CSS.marginLeft) + parseInt(child1CSS.marginRight) + getRect(child1).width,
      child2Width = child2CSS && parseInt(child2CSS.marginLeft) + parseInt(child2CSS.marginRight) + getRect(child2).width,
      CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float';
    if (elCSS.display === 'flex') {
      return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
    }
    if (elCSS.display === 'grid') {
      return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
    }
    if (child1 && child1CSS["float"] && child1CSS["float"] !== 'none') {
      var touchingSideChild2 = child1CSS["float"] === 'left' ? 'left' : 'right';
      return child2 && (child2CSS.clear === 'both' || child2CSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
    }
    return child1 && (child1CSS.display === 'block' || child1CSS.display === 'flex' || child1CSS.display === 'table' || child1CSS.display === 'grid' || child1Width >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && child1Width + child2Width > elWidth) ? 'vertical' : 'horizontal';
  }

  /**
   * add or remove element's class
   */
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }

  /**
   * Check if a DOM element matches a given selector
   * @returns
   */
  function matches(el, selector) {
    if (!selector) return;
    selector[0] === '>' && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (error) {
        return false;
      }
    }
    return false;
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }
        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }

  /**
   * Check if the mouse pointer is within an element
   */
  function within(event, element, rect) {
    rect = rect || getRect(element);
    return event.clientX <= rect.right && event.clientX >= rect.left && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  /**
   * Reports the position of its argument node relative to the node on which it is called.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
   */
  function comparePosition(a, b) {
    return a.compareDocumentPosition ? a.compareDocumentPosition(b) : a.contains ? (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) + 0 : 0;
  }
  function sort(before, after) {
    var compareValue = comparePosition(before, after);
    return compareValue === 2 ? 1 : compareValue === 4 ? -1 : 0;
  }
  function preventDefault(evt) {
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
  }
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
      name = _ref.name,
      params = _ref.params;
    var callback = sortable.options[name];
    if (typeof callback === 'function') {
      callback(Object.assign({}, params));
    }
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      return setTimeout(callback, 17);
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
  function AutoScroll(options) {
    this.options = options;
    this.autoScrollAnimationFrame = null;
  }
  AutoScroll.prototype = {
    destroy: function destroy() {
      if (this.autoScrollAnimationFrame == null) {
        return;
      }
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = null;
    },
    update: function update(scrollEl, dragEvent, moveEvent) {
      var _this = this;
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = requestAnimationFrame(function () {
        if (dragEvent && moveEvent) {
          _this.autoScroll(scrollEl, moveEvent);
        }
        _this.update(scrollEl, dragEvent, moveEvent);
      });
    },
    autoScroll: function autoScroll(scrollEl, evt) {
      if (!scrollEl || evt.clientX === void 0 || evt.clientY === void 0) return;
      var rect = getRect(scrollEl);
      if (!rect) return;
      var clientX = evt.clientX,
        clientY = evt.clientY;
      var top = rect.top,
        right = rect.right,
        bottom = rect.bottom,
        left = rect.left,
        height = rect.height,
        width = rect.width;
      if (clientY < top || clientX > right || clientY > bottom || clientX < left) {
        return;
      }
      var _this$options = this.options,
        scrollThreshold = _this$options.scrollThreshold,
        scrollSpeed = _this$options.scrollSpeed;
      var scrollTop = scrollEl.scrollTop,
        scrollLeft = scrollEl.scrollLeft,
        scrollHeight = scrollEl.scrollHeight,
        scrollWidth = scrollEl.scrollWidth;

      // check direction
      var toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
      var toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
      var toRight = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
      var toBottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;
      var scrollx = 0,
        scrolly = 0;
      if (toLeft) {
        scrollx = Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * scrollSpeed.x);
      }
      if (toRight) {
        scrollx = Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * scrollSpeed.x);
      }
      if (toTop) {
        scrolly = Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * scrollSpeed.y);
      }
      if (toBottom) {
        scrolly = Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * scrollSpeed.y);
      }
      if (scrolly) {
        scrollEl.scrollTop += scrolly;
      }
      if (scrollx) {
        scrollEl.scrollLeft += scrollx;
      }
    }
  };

  function Animation(options) {
    this.options = options;
    this.animations = [];
  }
  Animation.prototype = {
    collect: function collect(parentEl) {
      if (!parentEl) return;
      var parentRect = getRect(parentEl),
        docWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        maxWidth = Math.min(parentRect.right, docWidth),
        maxHeight = Math.min(parentRect.bottom, docHeight),
        children = Array.prototype.slice.call(parentEl.children),
        animations = [];
      for (var i = 0; i <= children.length; i++) {
        var node = children[i];
        if (!node || node === Sortable.ghost || css(node, 'display') === 'none') {
          continue;
        }
        var rect = getRect(node);
        if (rect.bottom < 0 || rect.right < 0) {
          continue;
        }

        // Animate only elements within the visible area
        if (rect.top > maxHeight || rect.left > maxWidth) {
          break;
        }
        animations.push({
          node: node,
          rect: rect
        });
      }
      this.animations.push(animations);
    },
    animate: function animate() {
      var animations = this.animations.pop();
      for (var i = 0, len = animations.length; i < len; i++) {
        var _animations$i = animations[i],
          node = _animations$i.node,
          rect = _animations$i.rect;
        this._excute(node, rect);
      }
    },
    _excute: function _excute(el, _ref) {
      var left = _ref.left,
        top = _ref.top;
      var rect = getRect(el);
      if (rect.top === top && rect.left === left) {
        return;
      }
      var ot = top - rect.top;
      var ol = left - rect.left;
      setTransitionDuration(el);
      setTransform(el, "translate3d(".concat(ol, "px, ").concat(ot, "px, 0)"));

      // repaint
      el.offsetWidth;
      setTransitionDuration(el, this.options.animation);
      setTransform(el, 'translate3d(0px, 0px, 0px)');
      clearTimeout(el.animated);
      el.animated = setTimeout(function () {
        setTransitionDuration(el);
        setTransform(el, '');
        el.animated = null;
      }, this.options.animation);
    }
  };

  var dragElements, cloneElements;
  function Multiple(options) {
    this.options = options || {};
    this.selectedElements = [];
  }
  Multiple.prototype = {
    destroy: function destroy() {
      dragElements = cloneElements = null;
    },
    active: function active() {
      return !!dragElements;
    },
    setParams: function setParams(params) {
      params.nodes = dragElements || [];
      params.clones = cloneElements || [];
    },
    select: function select(element) {
      toggleClass(element, this.options.selectedClass, true);
      this.selectedElements.push(element);
      this.selectedElements.sort(function (a, b) {
        return sort(a, b);
      });
    },
    deselect: function deselect(element) {
      var index = this.selectedElements.indexOf(element);
      if (index > -1) {
        toggleClass(element, this.options.selectedClass, false);
        this.selectedElements.splice(index, 1);
      }
    },
    getGhostElement: function getGhostElement() {
      if (!dragElements) return null;
      var container = document.createElement('div');
      this.selectedElements.forEach(function (node, index) {
        var clone = node.cloneNode(true);
        var opacity = index === 0 ? 1 : 0.5;
        clone.style = "position: absolute;left: 0;top: 0;bottom: 0;right: 0;opacity: ".concat(opacity, ";z-index: ").concat(index, ";");
        container.appendChild(clone);
      });
      return container;
    },
    toggleSelected: function toggleSelected(elements, add) {
      var _this = this;
      if (add) {
        elements.forEach(function (el) {
          return _this.selectedElements.push(el);
        });
      } else {
        this.selectedElements = this.selectedElements.filter(function (el) {
          return elements.indexOf(el) < 0;
        });
      }
    },
    toggleClass: function toggleClass$1(bool) {
      if (!dragElements) return;
      for (var i = 0; i < dragElements.length; i++) {
        toggleClass(dragElements[i], this.options.chosenClass, bool);
      }
    },
    toggleVisible: function toggleVisible(bool) {
      if (!dragElements) return;
      if (bool) {
        var dragIndex = dragElements.indexOf(Sortable.dragged);
        this._viewElements(dragElements, dragIndex, Sortable.dragged);
      } else {
        this._hideElements(dragElements);
      }
    },
    onChoose: function onChoose() {
      if (!this.options.multiple || !this.selectedElements.length || this.selectedElements.indexOf(Sortable.dragged) < 0) {
        return;
      }
      this.selectedElements.sort(function (a, b) {
        return sort(a, b);
      });
      dragElements = this.selectedElements;
      this.toggleClass(true);
    },
    onDrag: function onDrag(sortable) {
      if (!dragElements) return;
      sortable.animator.collect(Sortable.dragged.parentNode);
      this._hideElements(dragElements);
      sortable.animator.animate();
      this.toggleClass(false);
    },
    onDrop: function onDrop(fromSortable, toSortable, pullMode) {
      if (!dragElements) return;
      var dragEl = Sortable.dragged,
        cloneEl = Sortable.clone,
        dragIndex = dragElements.indexOf(dragEl);
      toSortable.animator.collect(cloneEl.parentNode);
      if (fromSortable !== toSortable && pullMode === 'clone') {
        css(cloneEl, 'display', 'none');
        cloneElements = dragElements.map(function (node) {
          return node.cloneNode(true);
        });
        this._viewElements(cloneElements, dragIndex, cloneEl);
        this._viewElements(dragElements, dragIndex, dragEl);
      } else {
        this._viewElements(dragElements, dragIndex, cloneEl);
      }
      toSortable.animator.animate();

      // Recalculate selected elements
      if (fromSortable !== toSortable) {
        toSortable.multiplayer.toggleSelected(cloneElements || dragElements, true);
        if (pullMode !== 'clone') {
          fromSortable.multiplayer.toggleSelected(dragElements, false);
        }
      }
    },
    onSelect: function onSelect(dragEvent, dropEvent, dragEl, sortable) {
      var _getEvent = getEvent(dropEvent),
        event = _getEvent.event;
      if (Sortable.dragged || !this._isClick(dragEvent, event)) return;
      var dragIndex = this.selectedElements.indexOf(dragEl);
      toggleClass(dragEl, this.options.selectedClass, dragIndex < 0);
      var params = {
        from: sortable.el,
        event: event,
        node: dragEl,
        index: index(dragEl)
      };
      if (dragIndex < 0) {
        this.selectedElements.push(dragEl);
        dispatchEvent({
          sortable: sortable,
          name: 'onSelect',
          params: params
        });
      } else {
        this.selectedElements.splice(dragIndex, 1);
        dispatchEvent({
          sortable: sortable,
          name: 'onDeselect',
          params: params
        });
      }
      this.selectedElements.sort(function (a, b) {
        return sort(a, b);
      });
    },
    _viewElements: function _viewElements(elements, index, target) {
      for (var i = 0; i < elements.length; i++) {
        css(elements[i], 'display', '');
        if (i < index) {
          target.parentNode.insertBefore(elements[i], target);
        } else {
          var dropEl = i > 0 ? elements[i - 1] : target;
          target.parentNode.insertBefore(elements[i], dropEl.nextSibling);
        }
      }
    },
    _hideElements: function _hideElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        if (elements[i] == Sortable.dragged) continue;
        css(elements[i], 'display', 'none');
      }
    },
    _isClick: function _isClick(dragEvent, dropEvent) {
      var dx = dropEvent.clientX - dragEvent.clientX;
      var dy = dropEvent.clientY - dragEvent.clientY;
      var dd = Math.sqrt(dx * dx + dy * dy);
      return dd >= 0 && dd <= 1;
    }
  };

  var expando = 'Sortable' + Date.now();
  var sortables = [];
  var fromEl, dragEl, dropEl, nextEl, cloneEl, ghostEl, parentEl, dragEvent, moveEvent, lastDropEl, listenerNode, lastHoverArea, dragStartTimer;
  var to, from, pullMode, oldIndex, newIndex, fromIndex, targetNode;
  var _prepareGroup = function _prepareGroup(options) {
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup,
        pull: true,
        put: true,
        revertDrag: true
      };
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
  var _detectNearestSortable = function _detectNearestSortable(x, y) {
    var result;
    sortables.some(function (sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (threshold == void 0) return;
      var rect = getRect(sortable),
        insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
        insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return result = sortable;
      }
    });
    return result;
  };
  var _positionChanged = function _positionChanged(evt) {
    var lastEvent = moveEvent || dragEvent;
    var clientX = evt.clientX,
      clientY = evt.clientY;
    var distanceX = clientX - lastEvent.clientX;
    var distanceY = clientY - lastEvent.clientY;
    if (clientX !== void 0 && clientY !== void 0 && Math.abs(distanceX) <= 0 && Math.abs(distanceY) <= 0) {
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
      throw "Sortable-dnd: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    el[expando] = this;
    this.el = el;
    this.options = options = Object.assign({}, options);
    var defaults = {
      store: null,
      disabled: false,
      group: '',
      animation: 150,
      draggable: null,
      handle: null,
      multiple: false,
      selectHandle: null,
      customGhost: null,
      direction: function direction() {
        return detectDirection(el, options.draggable);
      },
      autoScroll: true,
      scrollThreshold: 55,
      scrollSpeed: {
        x: 10,
        y: 10
      },
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      selectedClass: '',
      swapOnDrop: true,
      fallbackOnBody: false,
      supportTouch: 'ontouchstart' in window,
      emptyInsertThreshold: -5
    };

    // Set default options
    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }
    _prepareGroup(options);

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }
    var supportTouch = this.options.supportTouch;
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
    _onDrag: function _onDrag( /** TouchEvent|MouseEvent */evt) {
      var _this = this;
      // Don't trigger start event when an element is been dragged
      if (dragEl || this.options.disabled || !this.options.group.pull) return;

      // only left button and enabled
      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return;
      var _getEvent = getEvent(evt),
        touch = _getEvent.touch,
        event = _getEvent.event,
        target = _getEvent.target;

      // Safari ignores further event handling after mousedown
      if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;
      var element = closest(target, this.options.draggable, this.el);

      // No dragging is allowed when there is no dragging element
      if (!element || element.animated) return;
      dragEl = element;
      dragEvent = event;
      listenerNode = touch ? dragEl : document;
      on(listenerNode, 'mouseup', this._onDrop);
      on(listenerNode, 'touchend', this._onDrop);
      on(listenerNode, 'touchcancel', this._onDrop);
      var _this$options = this.options,
        handle = _this$options.handle,
        selectHandle = _this$options.selectHandle;

      // allow multi-drag
      if (typeof selectHandle === 'function' && selectHandle(event)) return;
      if (typeof selectHandle === 'string' && matches(target, selectHandle)) return;

      // check handle
      if (typeof handle === 'function' && !handle(event)) return;
      if (typeof handle === 'string' && !matches(target, handle)) return;
      var _this$options2 = this.options,
        delay = _this$options2.delay,
        delayOnTouchOnly = _this$options2.delayOnTouchOnly;

      // Delay is impossible for native DnD in Edge or IE
      if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        on(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
        on(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
        on(this.el.ownerDocument, 'mouseup', this._cancelStart);
        on(this.el.ownerDocument, 'touchend', this._cancelStart);
        on(this.el.ownerDocument, 'touchcancel', this._cancelStart);
        dragStartTimer = setTimeout(function () {
          return _this._onStart(touch, event);
        }, delay);
      } else {
        this._onStart(touch, event);
      }
    },
    _delayMoveHandler: function _delayMoveHandler(evt) {
      var e = evt.touches ? evt.touches[0] : evt;
      if (Math.max(Math.abs(e.clientX - dragEvent.clientX), Math.abs(e.clientY - dragEvent.clientY)) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))) {
        this._cancelStart();
      }
    },
    _cancelStart: function _cancelStart() {
      clearTimeout(dragStartTimer);
      off(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
      off(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
      off(this.el.ownerDocument, 'mouseup', this._cancelStart);
      off(this.el.ownerDocument, 'touchend', this._cancelStart);
      off(this.el.ownerDocument, 'touchcancel', this._cancelStart);
    },
    _onStart: function _onStart(touch, event) {
      var i = index(dragEl);
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
        params: this._getParams(event)
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
          setTimeout(function () {
            return document.selection.empty();
          }, 0);
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (error) {}
    },
    _onStarted: function _onStarted() {
      toggleClass(cloneEl, this.options.chosenClass, true);
      this._appendGhost();
      this.multiplayer.onDrag(this);
      dispatchEvent({
        sortable: this,
        name: 'onDrag',
        params: this._getParams(dragEvent)
      });
      css(dragEl, 'display', 'none');
      toggleClass(dragEl, this.options.chosenClass, false);
      dragEl.parentNode.insertBefore(cloneEl, dragEl);
      if (Safari) {
        css(document.body, 'user-select', 'none');
      }
    },
    _getGhostElement: function _getGhostElement() {
      var customGhost = this.options.customGhost;
      if (typeof customGhost === 'function') {
        var selectedElements = this.multiplayer.selectedElements;
        return customGhost(selectedElements.length ? selectedElements : [dragEl]);
      }
      return this.multiplayer.getGhostElement() || dragEl;
    },
    _appendGhost: function _appendGhost() {
      if (ghostEl) return;
      var _this$options3 = this.options,
        fallbackOnBody = _this$options3.fallbackOnBody,
        ghostClass = _this$options3.ghostClass,
        ghostStyle = _this$options3.ghostStyle;
      var container = fallbackOnBody ? document.body : this.el;
      var element = this._getGhostElement();
      ghostEl = element.cloneNode(true);
      toggleClass(ghostEl, ghostClass, true);
      var rect = getRect(dragEl);
      var style = Object.assign({
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
        'pointer-events': 'none'
      }, ghostStyle);
      for (var key in style) {
        css(ghostEl, key, style[key]);
      }
      setTransition(ghostEl, 'none');
      setTransform(ghostEl, 'translate3d(0px, 0px, 0px)');
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);
      var ox = (dragEvent.clientX - rect.left) / parseInt(ghostEl.style.width) * 100;
      var oy = (dragEvent.clientY - rect.top) / parseInt(ghostEl.style.height) * 100;
      css(ghostEl, 'transform-origin', "".concat(ox, "% ").concat(oy, "%"));
      css(ghostEl, 'transform', 'translateZ(0)');
      css(ghostEl, 'will-change', 'transform');
    },
    _nearestSortable: function _nearestSortable( /** TouchEvent|MouseEvent */evt) {
      preventDefault(evt);
      if (!dragEvent || !dragEl || !_positionChanged(evt)) return;

      // Init in the move event to prevent conflict with the click event
      !moveEvent && this._onStarted();
      var _getEvent2 = getEvent(evt),
        event = _getEvent2.event,
        target = _getEvent2.target;
      moveEvent = event;
      var dx = event.clientX - dragEvent.clientX;
      var dy = event.clientY - dragEvent.clientY;
      setTransform(ghostEl, "translate3d(".concat(dx, "px, ").concat(dy, "px, 0)"));
      if (this.options.autoScroll) {
        var scrollEl = getParentAutoScrollElement(target, true);
        this.autoScroller.update(scrollEl, dragEvent, moveEvent);
      }
      var nearest = _detectNearestSortable(event.clientX, event.clientY);
      nearest && nearest[expando]._onMove(event, target);
    },
    _allowPut: function _allowPut() {
      if (fromEl === this.el) {
        return true;
      } else if (!this.options.group.put) {
        return false;
      } else {
        var _this$options$group = this.options.group,
          name = _this$options$group.name,
          put = _this$options$group.put;
        var fromGroup = fromEl[expando].options.group;
        return put.join && put.indexOf(fromGroup.name) > -1 || fromGroup.name && name && fromGroup.name === name;
      }
    },
    _allowSwap: function _allowSwap() {
      var order = sort(cloneEl, dropEl);
      nextEl = order < 0 ? dropEl.nextSibling : dropEl;
      var rect = getRect(dropEl),
        direction = typeof this.options.direction === 'function' ? this.options.direction.call(moveEvent, dragEl, this) : this.options.direction,
        vertical = direction === 'vertical',
        mouseOnAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
        dropElSize = dropEl[direction === 'vertical' ? 'offsetHeight' : 'offsetWidth'],
        hoverArea = mouseOnAxis >= (vertical ? rect.top : rect.left) && mouseOnAxis < (vertical ? rect.bottom : rect.right) - dropElSize / 2 ? -1 : 1;
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
    _onMove: function _onMove( /** TouchEvent|MouseEvent */event, target) {
      if (!this._allowPut()) return;
      dispatchEvent({
        sortable: this,
        name: 'onMove',
        params: this._getParams(event)
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
    _onInsert: function _onInsert(event) {
      var target = dropEl || cloneEl,
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
            revertDrag: true
          })
        });
      }
      if (!cloneTo) {
        dispatchEvent({
          sortable: from[expando],
          name: 'onRemove',
          params: this._getParams(event)
        });
      }
      if (cloneBack && dropEl !== dragEl) {
        dispatchEvent({
          sortable: this,
          name: 'onChange',
          params: this._getParams(event, {
            from: fromEl,
            backToOrigin: true
          })
        });
      }
      if (!cloneBack) {
        dispatchEvent({
          sortable: this,
          name: 'onAdd',
          params: this._getParams(event)
        });
      }
      from[expando].animator.animate();
      this.animator.animate();
      from = this.el;
    },
    _onChange: function _onChange(event) {
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
        params: this._getParams(event)
      });
      this.animator.animate();
      from = this.el;
    },
    _onDrop: function _onDrop( /** TouchEvent|MouseEvent */event) {
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
          params: this._getParams(event)
        });
        moveEvent && this._onEnd(event);
      }
      if (!moveEvent && this.options.multiple) {
        this.multiplayer.onSelect(dragEvent, event, dragEl, this);
      }
      if (ghostEl && ghostEl.parentNode) {
        ghostEl.parentNode.removeChild(ghostEl);
      }
      this.multiplayer.destroy();
      this.autoScroller.destroy();
      this._nulling();
    },
    _onEnd: function _onEnd(event) {
      var params = this._getParams(event);
      this.multiplayer.onDrop(from[expando], to[expando], pullMode);

      // swap real drag element to the current drop position
      if (this.options.swapOnDrop && (pullMode !== 'clone' || from === to)) {
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
          params: params
        });
      }
      dispatchEvent({
        sortable: to[expando],
        name: 'onDrop',
        params: params
      });
    },
    _getParams: function _getParams(event) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var evt = Object.create(null);
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
    _nulling: function _nulling() {
      to = from = fromEl = dragEl = dropEl = nextEl = cloneEl = ghostEl = parentEl = pullMode = oldIndex = newIndex = fromIndex = dragEvent = moveEvent = targetNode = lastDropEl = listenerNode = lastHoverArea = dragStartTimer = Sortable.clone = Sortable.ghost = Sortable.active = Sortable.dragged = null;
    },
    // ========================================= Public Methods =========================================
    destroy: function destroy() {
      this._nulling();
      this._cancelStart();
      off(this.el, 'touchstart', this._onDrag);
      off(this.el, 'mousedown', this._onDrag);
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el[expando] = this.animator = this.multiplayer = this.autoScroller = null;
    },
    option: function option(key, value) {
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
    select: function select(element) {
      this.multiplayer.select(element);
    },
    deselect: function deselect(element) {
      this.multiplayer.deselect(element);
    },
    getSelectedElements: function getSelectedElements() {
      return this.multiplayer.selectedElements;
    }
  };
  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    index: index,
    closest: closest,
    getRect: getRect,
    toggleClass: toggleClass,
    detectDirection: detectDirection
  };
  Sortable.get = function (element) {
    return element[expando];
  };
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };

  return Sortable;

})));
