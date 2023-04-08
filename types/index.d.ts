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
  sortable: Sortable;
  group: HTMLElement;
  node: HTMLElement;
  offset: Offset;
  rect: Rect;
}

type MultiNode = {
  node: HTMLElement;
  offset: Offset;
  rect: Rect;
}

type MultiFromTo = {
  sortable: Sortable;
  group: HTMLElement;
  nodes: MultiNode[];
}

type EventType = Event & (PointerEvent | MouseEvent | TouchEvent);


type options = {
  /**
   * Specifies which items inside the element should be draggable
   * @example
   * - (e) => e.target.tagName === 'LI' ? true : false
   * - (e) => e.target // use function to set the drag element if retrun HTMLElement
   * - 'div'   // use tag name
   * - '.item' // use class name
   * - '#item' // use id
   */
  draggable?: Function | String;

  /**
   * Drag handle selector within list items
   * @example
   * - (e) => e.target.tagName === 'I' ? true : false
   * - 'i' // use tag name
   * - '.handle' // use class
   * - '#handle' // use id
   */
  handle?: Function | String;

  /**
   * Set value to allow drag between different lists
   * @example
   * String: 'name'
   * Object: { name: 'group', put: true | false, pull: true | false }
   * @defaults `' '`
   */
  group?: String | Group;

  /**
   * Enable multi-drag
   * @defaults `false`
   */
  multiple?: Boolean;

  /**
   * Speed of the animation (in ms) while moving the items.
   * @defaults `150`
   */
  animation?: Number;

  /**
   * The callback function when the drag is started.
   */
  onDrag?: (params: {
    from: FromTo | MultiFromTo;
    to: FromTo | MultiFromTo;
    event: EventType;
  }) => void;

  /**
   * The callback function when the dragged element is moving.
   */
  onMove?: (params: {
    from: FromTo | MultiFromTo;
    to: FromTo | MultiFromTo;
    event: EventType;
  }) => void;

  /**
   * The callback function when the drag is completed.
   */
  onDrop?: (params: {
    from: FromTo | MultiFromTo;
    to: FromTo | MultiFromTo;
    event: EventType;
    changed: Boolean;
  }) => void;

  /**
   * The callback function when element is dropped into the list from another list.
   */
  onAdd?: (params: {
    from: FromTo | MultiFromTo;
    to: FromTo | MultiFromTo;
    event: EventType;
  }) => void;

  /**
   * The callback function when element is removed from the list into another list.
   */
  onRemove?: (params: {
    from: FromTo | MultiFromTo;
    to: FromTo | MultiFromTo;
    event: EventType;
  }) => void;

  /**
   * The callback function when the dragged element changes position in the list.
   */
  onChange?: (params: {
    from: FromTo | MultiFromTo;
    to: FromTo | MultiFromTo;
    event: EventType;
  }) => void;

  /**
   * The callback function when element is selected
   */
  onSelect?: (params: FromTo) => void;

  /**
   * The callback function when element is unselected
   */
  onDeselect?: (params: FromTo) => void;

  /**
   * Disables the sortable if set to true.
   * @defaults `false`
   */
  disabled?: Boolean;

  /**
   * This class will be added to the item while dragging.
   * @defaults `' '`
   */
  chosenClass?: String;

  /**
   * Class name for selected item
   * @defaults `' '`
   */
  selectedClass?: String;

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
   * Threshold to trigger autoscroll.
   * @defaults `25`
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
