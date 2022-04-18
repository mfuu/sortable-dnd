import { IE11OrLess } from './brower.js'

const captureMode = {
	capture: false,
	passive: false
}

export default {

  on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode)
  },

  off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode)
  },

  getWindowScrollingElement() {
    let scrollingElement = document.scrollingElement
  
    if (scrollingElement) {
      return scrollingElement
    } else {
      return document.documentElement
    }
  },

  index(group, el) {
    if (!el || !el.parentNode) return -1

    const children = [...Array.from(group.children)]
    return children.indexOf(el)
  },

  getRect(children, index) {
    if (!children.length) return {}
    if (index < 0) return {}
    return children[index].getBoundingClientRect()
  },

  getElement(group, dragging) {
    const result = { index: -1, el: null, rect: {} }

    const children = [...Array.from(group.children)]

    // 如果能直接在子元素中找到，返回对应的index
    const index = children.indexOf(dragging)
    if (index > -1)
      Object.assign(result, {
        index,
        el: children[index],
        rect: children[index].getBoundingClientRect()
      })

    // children 中无法直接找到对应的dom时，需要向下寻找
    for (let i = 0; i < children.length; i++) {
      if (this.isChildOf(dragging, children[i]))
        Object.assign(result, {
          index: i,
          el: children[i],
          rect: children[i].getBoundingClientRect()
        })
    }

    return result
  },

  // 判断子元素是否包含在父元素中
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

  animate(el, preRect, animation = 300) {
    const curRect = el.getBoundingClientRect()

    const left = preRect.left - curRect.left
    const top = preRect.top - curRect.top
    
    this.css(el, 'transition', 'none')
    this.css(el, 'transform', `translate3d(${left}px, ${top}px, 0)`)

    el.offsetLeft // 触发重绘

    this.css(el, 'transition', `all ${animation}ms`)
    this.css(el, 'transform', 'translate3d(0px, 0px, 0px)')
    clearTimeout(el.animated)
    el.animated = setTimeout(() => {
      this.css(el, 'transition', '')
      this.css(el, 'transform', '')
      el.animated = null
    }, animation)
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
  }

}