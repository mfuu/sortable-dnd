import { IE11OrLess } from './Brower.js'

const captureMode = {
	capture: false,
	passive: false
}

const R_SPACE = /\s+/g

export default {

  /**
  * add specified event listener
  * @param {HTMLElement} el 
  * @param {String} event 
  * @param {Function} fn 
  */
  on(el, event, fn) {
  if (window.addEventListener) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode)
  } else if (window.attachEvent) {
    el.addEventListener('on' + event, fn)
  }
 },
 
 /**
  * remove specified event listener
  * @param {HTMLElement} el 
  * @param {String} event 
  * @param {Function} fn 
  */
  off(el, event, fn) {
   if (window.removeEventListener) {
     el.removeEventListener(event, fn, !IE11OrLess && captureMode)
   } else if (window.detachEvent) {
     el.detachEvent('on' + event, fn)
   }
 },

  getWindowScrollingElement() {
    let scrollingElement = document.scrollingElement
  
    if (scrollingElement) {
      return scrollingElement
    } else {
      return document.documentElement
    }
  },

  /**
   * get specified element's index in group
   * @param {HTMLElement} group 
   * @param {HTMLElement} el 
   * @returns {Number} index
   */
  index(group, el) {
    if (!el || !el.parentNode) return -1

    const children = [...Array.from(group.children)]
    return children.indexOf(el)
  },

  /**
   * Returns the "bounding client rect" of given element
   * @param {HTMLElement} el  The element whose boundingClientRect is wanted
   */
  getRect(el) {
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

    if (el !== window && el.parentNode && el !== this.getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect()
      rect.top = elRect.top
      rect.left = elRect.left
      rect.bottom = elRect.bottom
      rect.right = elRect.right
      rect.height = elRect.height
      rect.width = elRect.width
    } else {
      rect.top = 0
      rect.left = 0
      rect.bottom = window.innerHeight
      rect.right = window.innerWidth
      rect.height = window.innerHeight
      rect.width = window.innerWidth
    }

    return rect
  },

  /**
   * get target Element in group
   * @param {HTMLElement} group 
   * @param {HTMLElement} el 
   */
  getElement(group, el) {
    const result = { index: -1, el: null, rect: {} }
    const children = [...Array.from(group.children)]

    // 如果能直接在子元素中找到，返回对应的index
    const index = children.indexOf(el)
    if (index > -1)
      Object.assign(result, {
        index,
        el: children[index],
        rect: this.getRect(children[index])
      })

    // children 中无法直接找到对应的dom时，需要向下寻找
    for (let i = 0; i < children.length; i++) {
      if (this.isChildOf(el, children[i]))
        Object.assign(result, {
          index: i,
          el: children[i],
          rect: this.getRect(children[i])
        })
    }

    return result
  },

  /**
   * Check if child element is contained in parent element
   * @param {HTMLElement} child 
   * @param {HTMLElement} parent 
   * @returns {Boolean} true | false
   */
  isChildOf(child, parent) {
    let parentNode
    if (child && parent) {
      parentNode = child.parentNode
      while (parentNode) {
        if (parent === parentNode) return true
        parentNode = parentNode.parentNode
      }
    }
    return false
  },

  /**
   * add or remove element's class
   * @param {HTMLElement} el element
   * @param {String} name class name
   * @param {Boolean} state true: add, false: remove
   */
  toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name)
      } else {
        const className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ')
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ')
      }
    }
  },

  /**
   * Check if a DOM element matches a given selector
   * @param {HTMLElement} el 
   * @param {String} selector 
   * @returns 
   */
  matches(el, selector) {
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
  },

  css(el, prop, val) {
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
  },

  debounce(fn, delay) {
    return function (...args) {
      clearTimeout(fn.id)
      fn.id = setTimeout(() => {
        fn.call(this, ...args)
      }, delay)
    }
  },

  _nextTick(fn) {
    return setTimeout(fn, 0)
  }

}