import {
  css,
  getRect,
  setRect,
  getIndex,
  unsetRect,
  getElement,
  toggleClass,
  isHTMLElement,
} from './utils'

export default function Multiple() {
  let selectedElements = []
  let multiStartTimers = []

  return {
    _setMultiElements(evt) {
      if (!this.options.multiple) return

      let target

      const { draggable } = this.options
      if (typeof draggable === 'function') {
        const element = draggable(evt)
        if (!element) return
        if (isHTMLElement(element)) target = element
      }
      if (!target) target = getElement(this.el, evt.target, true)

      if (!target) return

      toggleClass(target, this.options.selectedClass, !~selectedElements.indexOf(target))

      if (!~selectedElements.indexOf(target)) {
        selectedElements.push(target)
        this._dispatchEvent('onSelect', { sortable: this, target, evt })
      } else {
        selectedElements.splice(selectedElements.indexOf(target), 1)
        this._dispatchEvent('onDeselect', { sortable: this, target, evt })
      }

      // get each node's index in group
      selectedElements.forEach((node) => {
        node.sortableIndex = getIndex(this.el, node)
      })

      // sort
      selectedElements.sort((a, b) => a.sortableIndex - b.sortableIndex)
    },

    _allowMultiDrag(dragEl) {
      return this.options.multiple && selectedElements.length && selectedElements.includes(dragEl)
    },

    _getMultiGhostElement() {
      const ghost = document.createElement('div')
      selectedElements.forEach((node, index) => {
        let clone = node.cloneNode(true)
        let pos = index * 5 + 5
        let opacity = index === 0 ? 1 : 0.5
        clone.style = `opacity: ${opacity};border: 1px solid #fff;position: absolute; z-index: ${index};bottom: -${pos}px;right: -${pos}px`
        ghost.appendChild(clone)
      })
      return ghost
    },

    _multiDragStart(dragEl, evt) {
      this._captureMultiAnimationState(selectedElements)

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        css(node, 'position', 'absolute')
      })

      let dragRect = getRect(dragEl, { relative: true })

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        setRect(node, dragRect)
        let timer = setTimeout(() => {
          css(node, 'display', 'none')
        }, this.options.animation)
        multiStartTimers.push(timer)
      })

      this._multiAnimate()
    },

    _multiDragEnd(dragEl) {
      multiStartTimers.forEach(timer => clearTimeout(timer))
      
      this._captureMultiAnimationState(selectedElements)

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        unsetRect(node)
      })

      let index = selectedElements.indexOf(dragEl)
      for (let i = 0; i < selectedElements.length; i++) {
        if (i < index) {
          this.el.insertBefore(selectedElements[i], dragEl)
        } else {
          let dropEl = i > 0 ? selectedElements[i - 1] : dragEl
          this.el.insertBefore(selectedElements[i], dropEl.nextSibling)
        }
      }

      this._multiAnimate()
    },
  }
}
