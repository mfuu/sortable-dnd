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
        let pos = index * 4 + 4
        let opacity = index === 0 ? 1 : 0.5
        clone.style = `opacity: ${opacity};position: absolute;z-index: ${index};bottom: -${pos}px;right: -${pos}px;width: 100%;height: 100%;`
        ghost.appendChild(clone)
      })
      return ghost
    },

    _multiDragStart(dragEl, evt) {
      this._captureAnimationState(dragEl)

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        css(node, 'position', 'absolute')
      })

      let dragRect = getRect(dragEl, { relative: true })

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        setRect(node, dragRect)
        css(node, 'display', 'none')
      })

      this._animate()
    },

    _multiDragMove(rect, dragEl) {
      selectedElements.forEach((node) => {
        if (node === dragEl) return
        css(node, 'top', rect.top)
        css(node, 'left', rect.left)
      })
    },

    _multiDragEnd(dragEl) {
      this._captureAnimationState(dragEl)

      multiStartTimers.forEach((timer) => clearTimeout(timer))

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        unsetRect(node)
      })

      this._captureMultiAnimationState(selectedElements)

      let index = selectedElements.indexOf(dragEl)
      for (let i = 0; i < selectedElements.length; i++) {
        if (i < index) {
          this.el.insertBefore(selectedElements[i], dragEl)
        } else {
          let dropEl = i > 0 ? selectedElements[i - 1] : dragEl
          this.el.insertBefore(selectedElements[i], dropEl.nextSibling)
        }
      }

      this._animate()
      this._multiAnimate()
    },
  }
}
