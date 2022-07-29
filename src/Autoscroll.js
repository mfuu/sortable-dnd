import { throttle, getRect } from './utils.js'

export default function AutoScroll() {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      return setTimeout(callback, 17)
    }
  }
  return {
    _autoScroll: throttle(function(_this) {
      if (!_this.scrollEl) return
      // check if is moving now
      if (!(_this.state.sortableDown && _this.state.sortableMove)) return
      const { clientX, clientY } = _this.state.sortableMove
      if (clientX === void 0 || clientY === void 0) return
  
      if (_this.scrollEl === _this.ownerDocument) {
        // does not support now
      } else {
        const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = _this.scrollEl
        const { top, right, bottom, left, height, width } = getRect(_this.scrollEl)
        const { scrollStep, scrollThreshold } = _this.options
        // check direction
        const totop = scrollTop > 0 && clientY >= top && clientY <= (top + scrollThreshold)
        const toleft = scrollLeft > 0 && clientX >= left && clientX <= (left + scrollThreshold)
        const toright = (scrollLeft + width) < scrollWidth && clientX <= right && clientX >= (right - scrollThreshold)
        const tobottom = (scrollTop + height) < scrollHeight && clientY <= bottom && clientY >= (bottom - scrollThreshold)
        // scroll position
        const position = { x: scrollLeft, y: scrollTop }
  
        if (totop) {
          if (toleft) {
            // to top-left
            position.x = scrollLeft - scrollStep
          } else if (toright) {
            // to top-right
            position.x = scrollLeft + scrollStep
          } else {
            // to top
            position.x = scrollLeft
          }
          position.y = scrollTop - scrollStep
        } else if (tobottom) {
          if (toleft) {
            // to bottom-left
            position.x = scrollLeft - scrollStep
          } else if (toright) {
            // to bottom-right
            position.x = scrollLeft + scrollStep
          } else {
            // to bottom
            position.x = scrollLeft
          }
          position.y = scrollTop + scrollStep
        } else if (toleft) {
          // to left
          position.x = scrollLeft - scrollStep
          position.y = scrollTop
        } else if (toright) {
          // to right
          position.x = scrollLeft + scrollStep
          position.y = scrollTop
        }
        // if need to scroll
        if (totop || toleft || toright || tobottom) {
          requestAnimationFrame(() => {
            _this.scrollEl.scrollTo(position.x, position.y)
            _this._autoScroll(_this)
          })
        }
      }
    }, 10)
  }
}