import { on, off } from './utils.js'

export default function DNDEvent() {
  return {
    _bindDragEventListener() {
      this._onDrag = this._onDrag.bind(this)
      this._onMove = this._onMove.bind(this)
      this._onDrop = this._onDrop.bind(this)

      const { supportPointer, supportTouch } = this.options
      if (supportPointer) {
        on(this.rootEl, 'pointerdown', this._onDrag)
      } else if (supportTouch) {
        on(this.rootEl, 'touchstart', this._onDrag)
      } else {
        on(this.rootEl, 'mousedown', this._onDrag)
      }
    },
  
    _unbindDragEventListener() {
      off(this.rootEl, 'pointerdown', this._onDrag)
      off(this.rootEl, 'touchstart', this._onDrag)
      off(this.rootEl, 'mousedown', this._onDrag)
    },
    
    _bindMoveEvents(touch) {
      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', this._onMove)
      } else if (touch) {
        on(this.ownerDocument, 'touchmove', this._onMove)
      } else {
        on(this.ownerDocument, 'mousemove', this._onMove)
      }
    },
  
    _unbindMoveEvents() {
      off(this.ownerDocument, 'pointermove', this._onMove)
      off(this.ownerDocument, 'touchmove', this._onMove)
      off(this.ownerDocument, 'mousemove', this._onMove)
    },
  
    _unbindDropEvents() {
      off(this.ownerDocument, 'pointerup', this._onDrop)
      off(this.ownerDocument, 'pointercancel', this._onDrop)
      off(this.ownerDocument, 'touchend', this._onDrop)
      off(this.ownerDocument, 'touchcancel', this._onDrop)
      off(this.ownerDocument, 'mouseup', this._onDrop)
    },

    _unbindDragEvents() {
      if (this.nativeDraggable) {
        off(this.rootEl, 'dragstart', this._onDragStart)
        off(this.rootEl, 'dragover', this._onDragOver)
        off(this.rootEl, 'dragend', this._onDrop)
      }
    }
  }
}