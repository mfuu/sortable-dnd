declare class Sortable {
  public el: HTMLElement;

  public options: Sortable.Options;

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
   * Original element to be dragged.
   */
  static dragged: HTMLElement | null;

  /**
   * The ghost element.
   */
  static ghost: HTMLElement | null;

  /**
   * The clone element. All operations during dnd are based on clone.
   */
  static clone: HTMLElement | null;

  /**
   * Public Methods.
   */
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
   * Get or set the option value, depending on whether the `value` is passed in.
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
   * Selects the provided multi-drag item
   * @param element The element to be selected
   */
  select(element: HTMLElement): void;

  /**
   * Deselects the provided multi-drag item
   * @param element The element to be deselected
   */
  deselect(element: HTMLElement): void;

  /**
   * Get the selected elements in the case of `multiple: true`.
   */
  getSelectedElements(): HTMLElement[];
}

declare namespace Sortable {
  export interface Options extends SortableOptions {}

  export type Direction = 'vertical' | 'horizontal';

  export type EventType = Event & (TouchEvent | MouseEvent);

  export interface DOMRect {
    height: number;
    width: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  export interface DOMOffset extends DOMRect {};

  export interface Group {
    /**
     * group name
     */
    name: string;
    /**
     * whether elements can be added from other lists, or an array of group names from which elements can be taken.
     */
    put?: readonly string[] | boolean;
    /**
     * whether elements can be moved out of this list.
     */
    pull?: boolean | 'clone';
    /**
     * revert draged element to initial position after moving to a another list.
     */
    revertDrag?: boolean;
  }

  export interface ScrollSpeed {
    x: number;
    y: number;
  }

  export interface Item {
    /**
     * Sortable instance
     */
    sortable: Sortable;
    /**
     * index within parent
     */
    index: number;
    /**
     * dragged element
     */
    node: HTMLElement;
    /**
     * list container
     */
    el: HTMLElement;
  }

  export interface FromTo extends Item {
    /**
     * dragged elements
     */
    nodes?: HTMLElement[];
    /**
     * `Sortable.Options.store`
     */
    store?: any;
  }

  export interface SelectEvent {
    /**
     * TouchEvent | MouseEvent
     */
    event: EventType;
    /**
     * index within parent
     */
    index: number;
    /**
     * dragged element
     */
    node: HTMLElement;
    /**
     * list container
     */
    from: HTMLElement;
  }

  export interface SortableEvent {
    /**
     * previous list
     */
    from: HTMLElement;
    /**
     * list, in which moved element.
     */
    to: HTMLElement;
    /**
     * dragged element
     */
    node: HTMLElement;
    /**
     * dragged elements
     */
    nodes: HTMLElement[];
    /**
     * cloned element, all dnd operations are based on cloned element and do not alter the source dom(node).
     */
    clone: HTMLElement;
    /**
     * cloned elements, there is a value only in the `pull: clone` after moving to a another list.
     */
    clones: HTMLElement[];
    /**
     * drop element
     */
    target: HTMLElement;
    /**
     * old index within parent
     */
    oldIndex: number;
    /**
     * new index within parent
     */
    newIndex: number;
    /**
     * TouchEvent | MouseEvent
     */
    event: EventType;
    /**
     * Pull mode if dragging into another sortable.
     */
    pullMode: "clone" | boolean | undefined;
    /**
     * Position of the drop element relative to the drag element after swap is complete.
     * 
     * @example 
     * 
     * 0: index(target) === index(node)
     * 
     * 1: index(target) > index(node)
     * 
     * -1: index(target) < index(node)
     */
    relative: 0 | 1 | -1;
  }

  export interface SortableOptions {
    /**
     * store data
     * @example
     * 
     * // store value
     * sortable.option('store', value);
     * 
     * // get the stored value
     * sortable.option('store');
     */
    store?: any;

    /**
     * Specifies which items inside the element should be draggable.
     * @example
     * - 'div'   // use tag name
     * - '.item' // use class name
     * - '#item' // use id
     * @defaults `' '`
     */
    draggable?: string;

    /**
     * Drag handle selector within list items.
     * @example
     * - (e) => e.target.tagName === 'I' ? true : false
     * - 'i' // use tag name
     * - '.handle' // use class
     * - '#handle' // use id
     * @defaults `' '`
     */
    handle?: string | ((event: EventType) => boolean);

    /**
     * Set value to allow drag between different lists.
     * @example
     * - string: '...'
     * - object: { name: '...', put: true | false, pull: true | false }
     * @defaults `' '`
     */
    group?: string | Group;

    /**
     * Enable multi-drag.
     * @defaults `false`
     */
    multiple?: boolean;

    /**
     * Handle selector within list items which used to select element in `multiple: true`.
     * @example
     * - (e) => e.target.tagName === 'Checkbox' ? true : false
     * - 'checkbox' // use tag name
     * - '.checkbox' // use class
     * - '#checkbox' // use id
     * @defaults `' '`
     */
    selectHandle?: string | ((event: EventType) => boolean);

    /**
     * Customize the ghost element in drag.
     */
    customGhost?: (nodes: HTMLElement[]) => HTMLElement;

    /**
     * Direction of Sortable, will be detected automatically if not given.
     */
    direction?: Direction | ((event: EventType, dragEl: HTMLElement, sortable: Sortable) => Direction);

    /**
     * Speed of the animation (in ms) while moving the items.
     * @defaults `150`
     */
    animation?: number;

    /**
     * Disables the sortable if set to `true`.
     * @defaults `false`
     */
    disabled?: boolean;

    /**
     * Automatic scrolling when moving to the edge of the container.
     * @defaults `true`
     */
    autoScroll?: boolean;

    /**
     * Threshold to trigger autoscroll.
     * @defaults `25`
     */
    scrollThreshold?: number;

    /**
     * Vertical&Horizontal scrolling speed (px)
     * @defaults `{ x: 10, y: 10 }`
     */
    scrollSpeed?: ScrollSpeed;

    /**
     * Time in milliseconds to define when the sorting should start.
     * @defaults `0`
     */
    delay?: number;

    /**
     * Only delay if user is using touch.
     * @defaults `false`
     */
    dealyOnTouchOnly?: boolean;

    /**
     * How many *pixels* the point should move before cancelling a delayed drag event.
     */
    touchStartThreshold?: number;

    /**
     * distance mouse must be from empty sortable to insert drag element into it.
     * @defaults `5`
     */
    emptyInsertThreshold?: number;

    /**
     * Appends the cloned DOM Element into the Document's Body.
     * @defaults `false`
     */
    fallbackOnBody?: boolean;

    /**
     * When the value is false, the dragged element will return to the starting position of the drag.
     * @defaults `true`
     */
    swapOnDrop?: boolean;

    /**
     * This class will be added to the item while dragging.
     * @defaults `' '`
     */
    chosenClass?: string;

    /**
     * Class name for selected item.
     * @defaults `' '`
     */
    selectedClass?: string;

    /**
     * This styles will be applied to the mask of the dragging element.
     * @defaults `{ }`
     */
    ghostStyle?: CSSStyleDeclaration;

    /**
     * This class will be applied to the mask of the dragging element.
     * @defaults `' '`
     */
    ghostClass?: string;

    /**
     * Triggered when the drag is started.
     */
    onDrag?: (params: SortableEvent) => void;

    /**
     * Triggered when the dragged element is moving.
     */
    onMove?: (params: SortableEvent) => void;

    /**
     * Triggered when the drag is completed.
     * The params records only the status from the drag to the drop. All operations in the process are ignored.
     */
    onDrop?: (params: SortableEvent) => void;

    /**
     * Triggered when element is dropped into the current list from another.
     */
    onAdd?: (params: SortableEvent) => void;

    /**
     * Triggered when element is removed from the current list into another.
     */
    onRemove?: (params: SortableEvent) => void;

    /**
     * Triggered when the dragged element changes position in the current list.
     */
    onChange?: (params: SortableEvent) => void;

    /**
     * Triggered when element is selected.
     */
    onSelect?: (params: SelectEvent) => void;

    /**
     * Triggered when element is unselected.
     */
    onDeselect?: (params: SelectEvent) => void;
  }

  export interface Utils {
    /**
     * Attach an event handler function.
     * @param element an HTMLElement.
     * @param event an Event context.
     * @param fn
     */
    on(element: HTMLElement, event: string, fn: EventListenerOrEventListenerObject): void;

    /**
     * Remove an event handler function.
     * @param element an HTMLElement.
     * @param event an Event context.
     * @param fn a callback.
     */
    off(element: HTMLElement, event: string, fn: EventListenerOrEventListenerObject): void;

    /**
     * Get the values of all the CSS properties.
     * @param element an HTMLElement.
     */
    css(element: HTMLElement): CSSStyleDeclaration;

    /**
     * Get the value of style properties.
     * @param element an HTMLElement.
     * @param prop a property key.
     */
    css<K extends keyof CSSStyleDeclaration>(element: HTMLElement, prop: K): CSSStyleDeclaration[K];

    /**
     * Set one CSS property.
     * @param element an HTMLElement.
     * @param prop a property key.
     * @param value a property value.
     */
    css<K extends keyof CSSStyleDeclaration>(element: HTMLElement, prop: K, value: CSSStyleDeclaration[K]): void;

    /**
     * Returns the index of an element within its parent for a selected set of elements
     * @param element an HTMLElement.
     * @param selector an element seletor.
     */
    index(element: HTMLElement, selector?: string): number;

    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param element an HTMLElement.
     * @param selector an element seletor.
     * @param context a specific element's context.
     * @param includeContext whether to add `context` to comparison
     */
    closest(element: HTMLElement, selector: string, context: HTMLElement, includeContext: boolean): HTMLElement | null;

    /**
     * Returns the "bounding client rect" of given element
     * @param  {HTMLElement} element The element whose boundingClientRect is wanted
     * @param  {Boolean} relativeToContainingBlock Whether the rect should be relative to the containing block of (including) the container
     * @param  {HTMLElement} container The parent the element will be placed in
     */
    getRect(element: HTMLElement, relativeToContainingBlock: boolean, container: HTMLElement): DOMRect;

    /**
     * Add or remove one classes from each element.
     * @param element an HTMLElement.
     * @param name a class name.
     * @param state a class's state.
     */
    toggleClass(element: HTMLElement, name: string, state: boolean): void;
  }
}

export = Sortable;
