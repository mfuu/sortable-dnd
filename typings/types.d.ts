type Group = {
  name: String;
  put: Boolean;
  pull: Boolean;
}

type Offset = {
  height: Number;
  width: Number;
  top: Number;
  left: Number;
}

type Rect = {
  height: Number;
  width: Number;
  top: Number;
  bottom: Number;
  left: Number;
  right: Number;
}

type FromTo = {
  group: HTMLElement;
  node: HTMLElement;
  offset: Offset;
  rect: Rect;
}

type options = {
  /**
   * Specifies which items inside the element should be draggable
   * @example
   * Example Values:
   * - (e) => e.target.tagName === 'div' ? true : false
   * - 'div'   // use tag name
   * - '.drag' // use class name
   * - '#drag' // use id
   */
  draggable?: Function | String;

  /**
   * @example
   * String: 'name'
   * Object: { name: 'group', put: true | false, pull: true | false }
   * @defaults `' '`
   */
  group?: String | Group;

  /**
   * Speed of the animation (in ms) while moving the items.
   * @defaults `150`
   */
  animation?: Number;

  /**
   * The callback function when the drag is started.
   */
  onDrag?: (
    from: FromTo,
    to: FromTo,
    event: Event & PointerEvent,
    originalEvent: Event & PointerEvent,
  ) => void;

  /**
   * The callback function when the dragged element is moving.
   */
  onMove?: (
    from: FromTo,
    to: FromTo,
    ghostEl: HTMLElement,
    event: Event & DragEvent,
    originalEvent: Event & DragEvent,
  ) => void;

  /**
   * The callback function when the drag is completed.
   */
  onDrop?: (
    from: FromTo,
    to: FromTo,
    event: Event & DragEvent,
    originalEvent: Event & DragEvent,
    changed: Boolean,
  ) => void;

  /**
   * The callback function when element is dropped into the list from another list.
   */
  onAdd?: (
    from: FromTo,
    to: FromTo,
    event: Event,
    originalEvent: Event,
  ) => void;

  /**
   * The callback function when element is removed from the list into another list.
   */
  onRemove?: (
    from: FromTo,
    to: FromTo,
    event: Event,
    originalEvent: Event,
  ) => void;

  /**
   * The callback function when the dragged element changes position in the list.
   */
  onChange?: (
    from: FromTo,
    to: FromTo,
    event: Event & DragEvent,
    originalEvent: Event & DragEvent,
  ) => void;

  /**
   * Disables the sortable if set to true.
   * @defaults `false`
   */
  disabled?: Boolean;

  /**
   * This class will be added to the item while dragging.
   * @defaults `{ }`
   */
  chosenClass?: String;

  /**
   * This styles will be applied to the mask of the dragging element.
   * @defaults `{ }`
   */
  ghostStyle?: CSSStyleDeclaration;

  /**
   * This class will be applied to the mask of the dragging element.
   * @defaults `' '`
   */
  ghostClass?: String;

  /**
   * Automatic scrolling when moving to the edge of the container, **for browsers that do not support HTML5 drag events**.
   * @defaults `true`
   */
  autoScroll?: Boolean;

  /**
   * The distance to scroll each frame when autoscrolling.
   * @defaults `5`
   */
  scrollStep?: Number;

  /**
   * Threshold to trigger autoscroll.
   * @defaults `15`
   */
  scrollThreshold?: Number;

  /**
   * Time in milliseconds to define when the sorting should start.
   * @defaults `0`
   */
  delay?: Number;

  /**
   * Only delay if user is using touch.
   * @defaults `false`
   */
  dealyOnTouchOnly?: Boolean;

  /**
   * Appends the cloned DOM Element into the Document's Body
   * @defaults `false`
   */
  fallbackOnBody?: Boolean;

  /**
   * true: Ignore the HTML5 DnD behaviour and force the fallback to kick in.
   * @defaults `false`
   */
  forceFallback?: Boolean;

  /**
   * The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases.
   * @defualts `false`
   */
  stopPropagation?: Boolean;
}

declare class Sortable {
  /**
   * @param ParentElement The Parent which holds the draggable element(s).
   * @param options Options to customise the behavior of the drag animations.
   */
  constructor(ParentElement: HTMLElement, options?: options)

  /**
   * Manually clear all the state of the component. After using this method, the component will no longer be draggable.
   */
  destroy(): void
}

export = Sortable