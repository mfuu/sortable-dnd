type SortableState = {
  sortable: Sortable;
  group: HTMLElement;
  node: HTMLElement;
  offset: DOMOffset;
  rect: DOMRect;
};

type MultiNode = {
  node: HTMLElement;
  offset: DOMOffset;
  rect: DOMRect;
};

export type Group = {
  name: String;
  put: Boolean;
  pull: Boolean;
};

export type DOMOffset = {
  height: Number;
  width: Number;
  top: Number;
  left: Number;
};

export type DOMRect = DOMOffset & {
  bottom: Number;
  right: Number;
};

export type EventType = Event & (TouchEvent | MouseEvent);

export type FromTo = SortableState & { nodes?: MultiNode[] };

export type Select = SortableState & { event: EventType };

export type Options = {
  /**
   * Specifies which items inside the element should be draggable.
   * @example
   * - (e) => e.target.tagName === 'LI' ? true : false
   * - (e) => e.target // use function to set the drag element if retrun an HTMLElement
   * - 'div'   // use tag name
   * - '.item' // use class name
   * - '#item' // use id
   */
  draggable?: Function | String;

  /**
   * Drag handle selector within list items.
   * @example
   * - (e) => e.target.tagName === 'I' ? true : false
   * - 'i' // use tag name
   * - '.handle' // use class
   * - '#handle' // use id
   */
  handle?: Function | String;

  /**
   * Set value to allow drag between different lists.
   * @example
   * String: '...'
   * Object: { name: '...', put: true | false, pull: true | false }
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
  onDrag?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when the dragged element is moving.
   */
  onMove?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when the drag is completed.
   */
  onDrop?: (params: {
    from: FromTo;
    to: FromTo;
    event: EventType;
    changed: Boolean;
  }) => void;

  /**
   * The callback function when element is dropped into the current list from another list.
   */
  onAdd?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when element is removed from the current list into another list.
   */
  onRemove?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when the dragged element changes position in the current list.
   */
  onChange?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

  /**
   * The callback function when element is selected.
   */
  onSelect?: (params: Select) => void;

  /**
   * The callback function when element is unselected.
   */
  onDeselect?: (params: Select) => void;

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
   * Class name for selected item.
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
   * Appends the cloned DOM Element into the Document's Body.
   * @defaults `false`
   */
  fallbackOnBody?: Boolean;

  /**
   * The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases.
   * @defualts `false`
   */
  stopPropagation?: Boolean;
};

declare class Sortable {
  /**
   * @param ParentElement The Parent which holds the draggable element(s).
   * @param options Options to customise the behavior of the drag animations.
   */
  constructor(ParentElement: HTMLElement, options?: Options);

  /**
   * Manually clear all the state of the component, using this method the component will not be draggable.
   */
  destroy(): void;

  /**
   * Get/Set sortable options.
   * @param key option name
   * @param value option value
   */
  option(key: string, value: any): any;

  /**
   * Get the Sortable instance of an element
   * @param el
   */
  get(el: HTMLElement): Sortable | undefined;

  /**
   * Create sortable instance
   * @param el
   * @param options
   */
  create(el: HTMLElement, options: Options): void;
}

export = Sortable;
