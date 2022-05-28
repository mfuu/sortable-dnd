import { on, off } from './utils.js'

export default function DNDEvent() {
  return {
    _bindEventListener() {
      const { supportPointer, supportTouch } = this.options
      if (supportPointer) {
        on(this.$el, 'pointerdown', this._onStart)
      } else if (supportTouch) {
        on(this.$el, 'touchstart', this._onStart)
      } else {
        on(this.$el, 'mousedown', this._onStart)
      }
    },
  
    _unbindEventListener() {
      off(this.$el, 'pointerdown', this._onStart)
      off(this.$el, 'touchstart', this._onStart)
      off(this.$el, 'mousedown', this._onStart)
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
  
    _bindUpEvents() {
      on(this.ownerDocument, 'pointerup', this._onDrop)
      on(this.ownerDocument, 'pointercancel', this._onDrop)
      on(this.ownerDocument, 'touchend', this._onDrop)
      on(this.ownerDocument, 'touchcancel', this._onDrop)
      on(this.ownerDocument, 'mouseup', this._onDrop)
    },
  
    _unbindMoveEvents() {
      off(this.ownerDocument, 'pointermove', this._onMove)
      off(this.ownerDocument, 'touchmove', this._onMove)
      off(this.ownerDocument, 'mousemove', this._onMove)
    },
  
    _unbindUpEvents() {
      off(this.ownerDocument, 'pointerup', this._onDrop)
      off(this.ownerDocument, 'pointercancel', this._onDrop)
      off(this.ownerDocument, 'touchend', this._onDrop)
      off(this.ownerDocument, 'touchcancel', this._onDrop)
      off(this.ownerDocument, 'mouseup', this._onDrop)
    }
  }
}