import {
  css,
  getRect,
  setRect,
  getIndex,
  unsetRect,
  getElement,
  toggleClass,
  isHTMLElement,
  getOffset,
} from './utils'
import Sortable from './Sortable.js'

const MultiFromTo = { sortable: null, group: null, nodes: [] }

/**
 * Difference before and after dragging
 */
class MultiDifference {
  constructor() {
    this.from = { ...MultiFromTo }
    this.to = { ...MultiFromTo }
  }
  destroy() {
    this.from = { ...MultiFromTo }
    this.to = { ...MultiFromTo }
  }
}

let multiDiffer = new MultiDifference()

const _emitMultiDiffer = function () {
  return { from: { ...multiDiffer.from }, to: { ...multiDiffer.to } }
}

export default function Multiple() {
  let selectedElements = []

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

    _allowMultiDrag() {
      let dragEl = Sortable.dragEl
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

    _multiDragStart(e, evt) {
      let dragEl = Sortable.dragEl

      multiDiffer.from = {
        sortable: this,
        group: this.el,
        nodes: selectedElements.map((node) => {
          return { node, rect: getRect(node), offset: getOffset(node) }
        })
      }
      // on-muti-drag-start
      this._dispatchEvent('onDrag', { ..._emitMultiDiffer(), event: e, originalEvent: evt })

      // capture animate
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

    _multiDragMove() {
      let rect = getRect(Sortable.ghost, { relative: true })
      let dragEl = Sortable.dragEl
      selectedElements.forEach((node) => {
        if (node === dragEl) return
        css(node, 'top', rect.top)
        css(node, 'left', rect.left)
      })
    },

    _multiDragChange() {

    },

    _multiDragEnd(rootEl) {
      let dragEl = Sortable.dragEl
      this._captureAnimationState(dragEl)

      selectedElements.forEach((node) => {
        if (node === dragEl) return
        unsetRect(node)
      })

      this._captureMultiAnimationState(selectedElements)

      let index = selectedElements.indexOf(dragEl)
      for (let i = 0; i < selectedElements.length; i++) {
        if (i < index) {
          rootEl.insertBefore(selectedElements[i], dragEl)
        } else {
          let dropEl = i > 0 ? selectedElements[i - 1] : dragEl
          rootEl.insertBefore(selectedElements[i], dropEl.nextSibling)
        }
      }

      multiDiffer.to = {

      }

      this._animate()
      this._multiAnimate()
    },
  }
}
