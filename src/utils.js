import { IE11OrLess } from './Brower.js'
import Sortable from './Sortable.js'

const captureMode = {
	capture: false,
	passive: false
}

const R_SPACE = /\s+/g

export const CSSTRANSITIONS = ['-webkit-transition', '-moz-transition', '-ms-transition', '-o-transition', 'transition']
export const CSSTRANSFORMS = ['-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform', 'transform']
export const SUPPORTPASSIVE = supportPassive()

/**
 * check if is HTMLElement
 */
export function isHTMLElement(obj) {
  let d = document.createElement("div")
  try {
    d.appendChild(obj.cloneNode(true))
    return obj.nodeType == 1 ? true : false
  } catch(e) {
    return obj == window || obj == document
  }
}


/**
 * set transition style
 * @param {HTMLElement} el 
 * @param {String | Function} transition 
 */
export function setTransition(el, transition) {
  if (transition) {
    if (transition === 'none') CSSTRANSITIONS.forEach(ts => css(el, ts, 'none'))
    else CSSTRANSITIONS.forEach(ts => css(el, ts, `${ts.split('transition')[0]}transform ${transition}`))
  }
  else CSSTRANSITIONS.forEach(ts => css(el, ts, ''))
}

/**
 * set transform style
 * @param {HTMLElement} el 
 * @param {String} transform 
 */
export function setTransform(el, transform) {
  if (transform) CSSTRANSFORMS.forEach(tf => css(el, tf, `${tf.split('transform')[0]}${transform}`))
  else CSSTRANSFORMS.forEach(tf => css(el, tf, ''))
}

/**
 * get touch event and current event
 * @param {Event} evt 
 */
export function getEvent(evt) {
  const touch = (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt)
  const e = touch || evt
  const target = touch ? document.elementFromPoint(e.clientX, e.clientY) : e.target
  return { touch, e, target }
}

/**
 * detect passive event support
 */
export function supportPassive() {
  // https://github.com/Modernizr/Modernizr/issues/1894
  let supportPassive = false
  document.addEventListener('checkIfSupportPassive', null, {
    get passive() {
      supportPassive = true
      return true
    }
  })
  return supportPassive
}

/**
* add specified event listener
* @param {HTMLElement} el 
* @param {String} event 
* @param {Function} fn 
* @param {Boolean} sp
*/
export function on(el, event, fn) {
  if (window.addEventListener) {
    el.addEventListener(event, fn, (SUPPORTPASSIVE || !IE11OrLess) ? captureMode : false)
  } else if (window.attachEvent) {
    el.attachEvent('on' + event, fn)
  }
}

/**
* remove specified event listener
* @param {HTMLElement} el 
* @param {String} event 
* @param {Function} fn 
* @param {Boolean} sp
*/
export function off(el, event, fn) {
  if (window.removeEventListener) {
    el.removeEventListener(event, fn, (SUPPORTPASSIVE || !IE11OrLess) ? captureMode : false)
  } else if (window.detachEvent) {
    el.detachEvent('on' + event, fn)
  }
}

/**
 * get element's offetTop
 * @param {HTMLElement} el 
 */
export function getOffset(el) {
  let result = {
    top: 0,
    left: 0,
    height: 0,
    width: 0
  }
  result.height = el.offsetHeight
  result.width = el.offsetWidth
  result.top = el.offsetTop
  result.left = el.offsetLeft

  let parent = el.offsetParent

  while (parent !== null) {
    result.top += parent.offsetTop
    result.left += parent.offsetLeft
    parent = parent.offsetParent
  }

  return result
}


/**
 * get scroll element
 * @param {HTMLElement} el 
 * @param {Boolean} includeSelf whether to include the passed element
 * @returns {HTMLElement} scroll element
 */
export function getParentAutoScrollElement(el, includeSelf) {
	// skip to window
	if (!el || !el.getBoundingClientRect) return getWindowScrollingElement()

	let elem = el
	let gotSelf = false
	do {
		// we don't need to get elem css if it isn't even overflowing in the first place (performance)
		if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
			let elemCSS = css(elem)
			if (
				elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') ||
				elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')
			) {
				if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement()

				if (gotSelf || includeSelf) return elem
				gotSelf = true
			}
		}
	} while (elem = elem.parentNode)

	return getWindowScrollingElement()
}

export function getWindowScrollingElement() {
  let scrollingElement = document.scrollingElement

  if (scrollingElement) {
    return scrollingElement.contains(document.body) ? document : scrollingElement
  } else {
    return document
  }
}

/**
 * get specified element's index in group
 * @param {HTMLElement} group 
 * @param {HTMLElement} el 
 * @returns {Number} index
 */
export function getIndex(group, el) {
  if (!el || !el.parentNode) return -1

  const children = [...Array.from(group.children)]
  return children.indexOf(el)
}

/**
 * Returns the "bounding client rect" of given element
 * @param {HTMLElement} el  The element whose boundingClientRect is wanted
 * @param {Boolean} checkParent check if parentNode.height < el.height
 */
export function getRect(el, checkParent) {
  if (!el.getBoundingClientRect && el !== window) return

  const rect = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: 0,
    width: 0,
  }

  let elRect

  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect()
    rect.top = elRect.top
    rect.left = elRect.left
    rect.bottom = elRect.bottom
    rect.right = elRect.right
    rect.height = elRect.height
    rect.width = elRect.width

    if (checkParent && el.parentNode !== el.ownerDocument.body) {
      let parentRect, parentNode = el.parentNode

      while(parentNode && parentNode.getBoundingClientRect && parentNode !== el.ownerDocument.body) {
        parentRect = parentNode.getBoundingClientRect()
        if (parentRect.height < rect.height) {
          rect.top = parentRect.top
          rect.left = parentRect.left
          rect.bottom = parentRect.bottom
          rect.right = parentRect.right
          rect.height = parentRect.height
          rect.width = parentRect.width
          return rect
        }
        parentNode = parentNode.parentNode
      }
    }
  } else {
    rect.top = 0
    rect.left = 0
    rect.bottom = window.innerHeight
    rect.right = window.innerWidth
    rect.height = window.innerHeight
    rect.width = window.innerWidth
  }

  return rect
}

/**
 * get target Element in group
 * @param {HTMLElement} group 
 * @param {HTMLElement} el 
 * @param {Boolean} onlyEl only get element
 */
export function getElement(group, el, onlyEl) {
  const children = [...Array.from(group.children)]

  // If it can be found directly in the child element, return
  const index = children.indexOf(el)
  if (index > -1)
    return onlyEl ? children[index] : {
      index,
      el: children[index],
      rect: getRect(children[index]),
      offset: getOffset(children[index])
    }

  // When the dom cannot be found directly in children, need to look down
  for (let i = 0; i < children.length; i++) {
    if (isChildOf(el, children[i])) {
      return onlyEl ? children[i] : {
        index: i,
        el: children[i],
        rect: getRect(children[i]),
        offset: getOffset(children[i])
      }
    }
  }
  return onlyEl ? null : { index: -1, el: null, rect: {}, offset: {} }
}

/**
 * Check if child element is contained in parent element
 * @param {HTMLElement} child 
 * @param {HTMLElement} parent 
 * @returns {Boolean} true | false
 */
export function isChildOf(child, parent) {
  let parentNode
  if (child && parent) {
    parentNode = child.parentNode
    while (parentNode) {
      if (parent === parentNode) return true
      parentNode = parentNode.parentNode
    }
  }
  return false
}

/**
 * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
 * @param  {HTMLElement} el       Parent element
 * @param  {selector} selector    Any other elements that should be ignored
 * @return {HTMLElement}          The last child, ignoring ghostEl
 */
export function lastChild(el, selector) {
  let last = el.lastElementChild

  while (
    last &&
    (
      last === Sortable.ghost ||
      css(last, 'display') === 'none' ||
      selector && !matches(last, selector)
    )
  ) {
    last = last.previousElementSibling
  }

  return last || null
}

/**
 * add or remove element's class
 * @param {HTMLElement} el element
 * @param {String} name class name
 * @param {Boolean} state true: add, false: remove
 */
export function toggleClass(el, name, state) {
  if (el && name) {
    if (el.classList) {
      el.classList[state ? 'add' : 'remove'](name)
    } else {
      const className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ')
      el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ')
    }
  }
}

/**
 * Check if a DOM element matches a given selector
 * @param {HTMLElement} el 
 * @param {String} selector 
 * @returns 
 */
export function matches(el, selector) {
  if (!selector) return

  selector[0] === '>' && (selector = selector.substring(1))

  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector)
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector)
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector)
      }
    } catch(error) {
      return false
    }
  }

  return false
}

/**
 * Check whether the front and rear positions are consistent
 */
export function offsetChanged(o1, o2) {
  return o1.top !== o2.top || o1.left !== o2.left
}

export function css(el, prop, val) {
  let style = el && el.style
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, '')
      } else if (el.currentStyle) {
        val = el.currentStyle
      }
      return prop === void 0 ? val : val[prop]
    } else {
      if (!(prop in style) && prop.indexOf('webkit') === -1) {
        prop = '-webkit-' + prop
      }
      style[prop] = val + (typeof val === 'string' ? '' : 'px')
    }
  }
}

export function debounce(fn, delay, immediate) {
  let timer = null
  return function() {
    const context = this, args = arguments
    timer && clearTimeout(timer)
    immediate && !timer && fn.apply(context, args)
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, delay)
  }
}

export function throttle(fn, delay) {
  let timer = null
  return function() {
    const context = this, args = arguments
    if(!timer) {
      timer = setTimeout(function() {
        timer = null
        fn.apply(context, args)
      }, delay)
    }
  }
}

export function _nextTick(fn) {
  return setTimeout(fn, 0)
}

export const expando = 'Sortable' + Date.now()