declare class Sortable {
  public el: HTMLElement;

  public options: Sortable.Options;

  public virtual: Sortable.Virtual;

  /**
   * @param element The Parent which holds the draggable element(s).
   * @param options Options to customise the behavior of the drag animations.
   */
  constructor(element: HTMLElement, options?: Sortable.Options);

  /**
   * Active Sortable instance.
   */
  static active: Sortable | null;

  /**
   * The element being dragged.
   */
  static dragged: HTMLElement | null;

  /**
   * The ghost element.
   */
  static ghost: HTMLElement | null;

  static utils: Sortable.Utils;

  /**
   * Create sortable instance.
   * @param el
   * @param options
   */
  static create(el: HTMLElement, options: Options): Sortable;

  /**
   * Get the Sortable instance of an element.
   * @param el
   */
  static get(el: HTMLElement): Sortable | undefined;

  /**
   * Get or set the option value, depending on whether the `value` is passed in
   * @param name a Sortable.Options property.
   * @param value a value.
   */
  option<K extends keyof Sortable.Options>(name: K, value: Sortable.Options[K]): void;
  option<K extends keyof Sortable.Options>(name: K): Sortable.Options[K];

  /**
   * Removes the sortable functionality completely.
   */
  destroy(): void;

  /**
   * Get the selected elements in the list.
   */
  getSelectedElements(): HTMLElement[];
}

declare namespace Sortable {
  export interface Options extends SortableOptions {}

  export interface DOMOffset {
    height: Number;
    width: Number;
    top: Number;
    left: Number;
  }

  export interface DOMRect extends DOMOffset {
    bottom: Number;
    right: Number;
  }

  export interface Group {
    name: String;
    put: Boolean;
    pull: Boolean;
  }

  export interface Range {
    start: Number;
    end: Number;
    front: Number;
    behind: Number;
    render: Number;
  }

  export interface ScrollState {
    offset: Number;
    top: Boolean;
    bottom: Boolean;
  }

  export interface ScrollSpeed {
    x: Number;
    y: Number;
  }

  interface SortableState {
    sortable: Sortable;
    group: HTMLElement;
    node: HTMLElement;
    offset: DOMOffset;
    rect: DOMRect;
  }

  interface MultiNode {
    node: HTMLElement;
    offset: DOMOffset;
    rect: DOMRect;
  }

  export interface FromTo extends SortableState {
    nodes?: MultiNode[];
  }

  export interface Select extends SortableState {
    event: EventType;
  }

  export type Direction =
    | 'vertical'
    | 'horizontal'
    | ((sortable: Sortable, dragEl: HTMLElement, event: EventType) => String);

  export type EventType = Event & (TouchEvent | MouseEvent);

  export interface SortableOptions {
    /**
     * Specifies which items inside the element should be draggable.
     * @example
     * - (e) => e.target.tagName === 'LI' ? true : false // use function
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
     * Enable multi-drag.
     * @defaults `false`
     */
    multiple?: Boolean;

    /**
     * Support for virtual lists if set to `true`.
     * @defaults `false`
     */
    virtual?: Boolean;

    /**
     * Virtual list scrolling element.
     * @defaults `null`
     */
    scroller?: HTMLElement;

    /**
     * The unique key values of all items in the list.
     * @defaults `[]`
     */
    dataKeys?: any[];

    /**
     * The number of lines rendered by the virtual scroll.
     * @defaults `30`
     */
    keeps?: Number;

    /**
     * The estimated height of each piece of data.
     * @defaults `null`
     */
    size?: Number;

    /**
     * Top height value to be ignored.
     * @defaults `0`
     */
    headerSize?: Number;

    /**
     * `vertical/horizontal` | `Function`. By default, the direction is automatically determined.
     * @defaults ``
     */
    direction?: Direction;

    /**
     * Speed of the animation (in ms) while moving the items.
     * @defaults `150`
     */
    animation?: Number;

    /**
     * Disables the sortable if set to `true`.
     * @defaults `false`
     */
    disabled?: Boolean;

    /**
     * Automatic scrolling when moving to the edge of the container.
     * @defaults `true`
     */
    autoScroll?: Boolean;

    /**
     * Threshold to trigger autoscroll.
     * @defaults `25`
     */
    scrollThreshold?: Number;

    /**
     * Vertical&Horizontal scrolling speed (px)
     * @defaults `{ x: 10, y: 10 }`
     */
    scrollSpeed?: ScrollSpeed;

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
     * When the value is false, the dragged element will return to the starting position of the drag.
     * @defaults `true`
     */
    swapOnDrop?: Boolean;

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
     * Triggered when the drag is started.
     */
    onDrag?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

    /**
     * Triggered when the dragged element is moving.
     */
    onMove?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

    /**
     * Triggered when the drag is completed.
     */
    onDrop?: (params: { from: FromTo; to: FromTo; event: EventType; changed: Boolean }) => void;

    /**
     * Triggered when element is dropped into the current list from another.
     */
    onAdd?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

    /**
     * Triggered when element is removed from the current list into another.
     */
    onRemove?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

    /**
     * Triggered when the dragged element changes position in the current list.
     */
    onChange?: (params: { from: FromTo; to: FromTo; event: EventType }) => void;

    /**
     * Triggered when element is selected.
     */
    onSelect?: (params: Select) => void;

    /**
     * Triggered when element is unselected.
     */
    onDeselect?: (params: Select) => void;

    /**
     * Triggered when the virtual list is scrolled.
     */
    onScroll?: (params: ScrollState) => void;

    /**
     * Triggered when the virual list created.
     */
    onCreate?: (params: Range) => void;

    /**
     * Triggered when the rendering parameters of the virtual list change.
     */
    onUpdate?: (params: Range) => void;
  }

  interface Utils {
    /**
     * Attach an event handler function.
     * @param element an HTMLElement.
     * @param event an Event context.
     * @param fn
     */
    on(element: HTMLElement, event: String, fn: EventListenerOrEventListenerObject): void;

    /**
     * Remove an event handler function.
     * @param element an HTMLElement.
     * @param event an Event context.
     * @param fn a callback.
     */
    off(element: HTMLElement, event: String, fn: EventListenerOrEventListenerObject): void;

    /**
     * Get/Set one CSS property.
     * @param element an HTMLElement.
     * @param prop a property key.
     * @param value a property value.
     */
    css<K extends keyof CSSStyleDeclaration>(
      element: HTMLElement,
      prop: K,
      value?: CSSStyleDeclaration[K]
    ): void;

    /**
     * Returns the index of an element within its parent for a selected set of elements
     * @param element an HTMLElement.
     * @param selector an element seletor.
     */
    index(element: HTMLElement, selector?: String): Number;

    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param element an HTMLElement.
     * @param selector an element seletor.
     * @param context a specific element's context.
     * @param includeContext whether to add `context` to comparison
     */
    closest(
      element: HTMLElement,
      selector: String,
      context: HTMLElement,
      includeContext: Boolean
    ): HTMLElement | null;

    /**
     * Get element's offet in given parentNode
     * @param element an HTMLElement.
     * @param parentEl a specific element's context.
     */
    getOffset(element: HTMLElement, parentEl: HTMLElement): DOMOffset;

    /**
     * Add or remove one classes from each element.
     * @param element an HTMLElement.
     * @param name a class name.
     * @param state a class's state.
     */
    toggleClass(element: HTMLElement, name: String, state: Boolean): void;
  }

  interface Virtual {
    /**
     * Recalculate the range. The callback function `onUpdate` will be triggered after the calculation is completed.
     */
    updateRange(): void;

    /**
     * Updates the size of a specified node
     * @param key data-key
     * @param size node size
     */
    updateItemSize(key: String | Number, size: Number): void;

    /**
     * Current scrolling direction is top/left.
     */
    isFront(): Boolean;

    /**
     * Current scrolling direction is down/right.
     */
    isBehind(): Boolean;

    /**
     * Git item size by data-key.
     * @param dataKey list item key.
     */
    getSize(dataKey: String | Number): Number;

    /**
     * Get the current scroll height/width.
     */
    getOffset(): Number;

    /**
     * Get client viewport size.
     */
    getClientSize(): Number;

    /**
     * Get the current scrolling distance.
     */
    getScrollSize(): Number;

    /**
     * Scroll to bottom of list.
     */
    scrollToBottom(): void;

    /**
     * Scroll to the specified offset.
     * @param offset
     */
    scrollToOffset(offset: Number): void;

    /**
     * Scroll to the specified index position.
     * @param index
     */
    scrollToIndex(index: Number): void;
  }
}

export = Sortable;
