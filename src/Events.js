import { on, off, debounce } from './utils.js'

export default function DNDEvent() {
  return {
    _bindEventListener() {
      this._onStart = this._onStart.bind(this)
      this._onMove = this._onMove.bind(this)
      this._onDrop = this._onDrop.bind(this)
  
      const { supportPointer, supportTouch, supportPassive } = this.options
      if (supportPointer) {
        on(this.$el, 'pointerdown', this._onStart, supportPassive)
      } else if (supportTouch) {
        on(this.$el, 'touchstart', this._onStart, supportPassive)
      } else {
        on(this.$el, 'mousedown', this._onStart, supportPassive)
      }
    },
  
    _unbindEventListener() {
      const { supportPassive } = this.options
      off(this.$el, 'pointerdown', this._onStart, supportPassive)
      off(this.$el, 'touchstart', this._onStart, supportPassive)
      off(this.$el, 'mousedown', this._onStart, supportPassive)
    },
    
    _bindMoveEvents(touch) {
      const { supportPointer, ownerDocument, supportPassive } = this.options
      if (supportPointer) {
        on(ownerDocument, 'pointermove', this._onMove, supportPassive)
      } else if (touch) {
        on(ownerDocument, 'touchmove', this._onMove, supportPassive)
      } else {
        on(ownerDocument, 'mousemove', this._onMove, supportPassive)
      }
    },
  
    _bindUpEvents() {
      const { ownerDocument, supportPassive } = this.options
      on(ownerDocument, 'pointerup', this._onDrop, supportPassive)
      on(ownerDocument, 'pointercancel', this._onDrop, supportPassive)
      on(ownerDocument, 'touchend', this._onDrop, supportPassive)
      on(ownerDocument, 'touchcancel', this._onDrop, supportPassive)
      on(ownerDocument, 'mouseup', this._onDrop, supportPassive)
    },
  
    _unbindMoveEvents() {
      const { ownerDocument, supportPassive } = this.options
      off(ownerDocument, 'pointermove', this._onMove, supportPassive)
      off(ownerDocument, 'touchmove', this._onMove, supportPassive)
      off(ownerDocument, 'mousemove', this._onMove, supportPassive)
    },
  
    _unbindUpEvents() {
      const { ownerDocument, supportPassive } = this.options
      off(ownerDocument, 'pointerup', this._onDrop, supportPassive)
      off(ownerDocument, 'pointercancel', this._onDrop, supportPassive)
      off(ownerDocument, 'touchend', this._onDrop, supportPassive)
      off(ownerDocument, 'touchcancel', this._onDrop, supportPassive)
      off(ownerDocument, 'mouseup', this._onDrop, supportPassive)
    }
  }
}