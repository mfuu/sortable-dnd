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

export interface Group {
  /**
   * group name
   */
  name: string;

  /**
   * Whether elements can be added from other lists, or an array of group names from which elements can be taken.
   */
  put?: readonly string[] | boolean;

  /**
   * Ability to move from the list. `clone` — copy the item, rather than move.
   */
  pull?: boolean | 'clone';

  /**
   * Revert draged element to initial position after moving to a another list.
   */
  revertDrag?: boolean;
}

export interface ScrollSpeed {
  x: number;
  y: number;
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
   * Start list of element to be dragged.
   */
  from: HTMLElement;

  /**
   * List of currently placed drag element. Or the start list(from) in `pull: 'clone'`.
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
   * old index within parent. `-1`: element added from another list to the current list
   */
  oldIndex: number;

  /**
   * new index within parent. `-1`: element has been removed from the current list
   */
  newIndex: number;

  /**
   * TouchEvent | MouseEvent
   */
  event: EventType;

  /**
   * Pull value of the start list.
   */
  pullMode: boolean | 'clone';

  /**
   * Position of the drag element relative to the drop element(target) after swap is complete.
   * @example
   * 0: // The position of dropEl is the same as dragEl.
   * <div>dragEl, dropEl</div>
   *
   * 1: // dragEl comes after dropEl.
   * <div>dropEl</div> <div>dragEl</div>
   *
   * -1: // dragEl comes before dropEl.
   * <div>dragEl</div> <div>dropEl</div>
   */
  relative: 0 | 1 | -1;

  /**
   * Revert draged element to initial position after moving to a another list in `pull: 'clone'` & `revertDrag: true`.
   */
  revertDrag?: boolean;

  /**
   * Dragged element go back to the original list in `pull: 'clone'`.
   */
  backToOrigin?: boolean;
}

export interface SortableOptions {
  /**
   * store data.
   * @example
   * sortable.option('store', value); // store value
   * sortable.option('store'); // get the stored value
   *
   * @defaults `undefined`
   */
  store?: any;

  /**
   * Whether the current list can be sorted by dragging.
   * @defaults `true`
   */
  sortable?: boolean;

  /**
   * Specifies which items inside the element should be draggable.
   * @example
   * - 'div'   // use tag name
   * - '.item' // use class name
   * - '#item' // use id
   * @defaults `''`
   */
  draggable?: string;

  /**
   * Drag handle selector within list items.
   * @example
   * - (e) => e.target.tagName === 'I' ? true : false
   * - 'i' // use tag name
   * - '.handle' // use class
   * - '#handle' // use id
   * @defaults `''`
   */
  handle?: string | ((event: EventType) => boolean);

  /**
   * Set value to allow drag between different lists.
   * @example
   * - string: 'name'
   * - object: {
   *    name: 'name', // group name
   *
   *    // whether elements can be added from other lists,
   *    // or an array of group names from which elements can be taken.
   *    put: true | false | ['group1', 'group2'],
   *
   *    // whether elements can be moved out of this list.
   *    pull: true | false | 'clone',
   *
   *    // revert drag element to initial position after moving to a another list.
   *    revertDrag: true | false,
   * }
   * @defaults `''`
   */
  group?: string | Group;

  /**
   * Axis on which dragging will be locked.
   * @defaults `''`
   */
  lockAxis?: 'x' | 'y';

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
   * @defaults `''`
   */
  selectHandle?: string | ((event: EventType) => boolean);

  /**
   * Customize the ghost element in drag.
   * @defaults `undefined`
   */
  customGhost?: (nodes: HTMLElement[]) => HTMLElement;

  /**
   * Direction of Sortable, will be detected automatically if not given.
   * @defaults `''`
   */
  direction?: Direction | ((event: EventType, dragEl: HTMLElement, sortable: Sortable) => Direction);

  /**
   * ms, animation speed moving items when sorting, `0` — without animation.
   * @defaults `150`
   */
  animation?: number;

  /**
   * Easing for animation.
   *
   * See https://easings.net/ for examples.
   *
   * For other possible values, see
   * https://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp
   *
   * @example
   *
   * // CSS functions
   * | 'steps(int, start | end)'
   * | 'cubic-bezier(n, n, n, n)'
   *
   * // CSS values
   * | 'linear'
   * | 'ease'
   * | 'ease-in'
   * | 'ease-out'
   * | 'ease-in-out'
   * | 'step-start'
   * | 'step-end'
   * | 'initial'
   * | 'inherit'
   * @defaults `''`
   */
  easing?: string;

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
   * @defaults `55`
   */
  scrollThreshold?: number;

  /**
   * Vertical & Horizontal scrolling speed (px)
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
  delayOnTouchOnly?: boolean;

  /**
   * How many *pixels* the point should move before cancelling a delayed drag event.
   * @defaults `1`
   */
  touchStartThreshold?: number;

  /**
   * Distance mouse must be from empty sortable to insert drag element into it.
   * @defaults `-1`
   */
  emptyInsertThreshold?: number;

  /**
   * Appends the ghost Element into the Document's Body.
   * @defaults `false`
   */
  fallbackOnBody?: boolean;

  /**
   * When the value is false, the dragEl will not move to the drop position.
   * @defaults `true`
   */
  swapOnDrop?: boolean | ((event: SortableEvent) => boolean);

  /**
   * Class name for the chosen item.
   * @defaults `''`
   */
  chosenClass?: string;

  /**
   * Class name for selected item.
   * @defaults `''`
   */
  selectedClass?: string;

  /**
   * Class name for the drop placeholder.
   */
  placeholderClass?: string;

  /**
   * This styles will be applied to the mask of the dragging element.
   * @defaults `{}`
   */
  ghostStyle?: CSSStyleDeclaration;

  /**
   * This class will be applied to the mask of the dragging element.
   * @defaults `''`
   */
  ghostClass?: string;

  /**
   * Element is chosen.
   */
  onChoose?: (event: SortableEvent) => void;

  /**
   * Element is unchosen.
   */
  onUnchoose?: (event: SortableEvent) => void;

  /**
   * Element dragging started.
   */
  onDrag?: (event: SortableEvent) => void;

  /**
   * Move an item in the list or between lists.
   */
  onMove?: (event: SortableEvent) => void;

  /**
   * Element dragging is completed. Only record changes in the current list.
   */
  onDrop?: (event: SortableEvent) => void;

  /**
   * Element is dropped into the current list from another.
   */
  onAdd?: (event: SortableEvent) => void;

  /**
   * Element is removed from the current list into another.
   */
  onRemove?: (event: SortableEvent) => void;

  /**
   * Dragging element changes position in the current list.
   */
  onChange?: (event: SortableEvent) => void;

  /**
   * Element is selected. Takes effect in `multiple: true`.
   */
  onSelect?: (event: SelectEvent) => void;

  /**
   * Element is unselected. Takes effect in `multiple: true`.
   */
  onDeselect?: (event: SelectEvent) => void;
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
  closest(element: HTMLElement, selector: string, context?: HTMLElement, includeContext?: boolean): HTMLElement | null;

  /**
   * Returns the "bounding client rect" of given element
   * @param element The element whose boundingClientRect is wanted
   * @param relativeToContainingBlock Whether the rect should be relative to the containing block of (including) the container
   * @param container The parent the element will be placed in
   */
  getRect(element: HTMLElement, relativeToContainingBlock?: boolean, container?: HTMLElement): DOMRect;

  /**
   * Add or remove one classes from each element.
   * @param element an HTMLElement.
   * @param name a class name.
   * @param state a class's state.
   */
  toggleClass(element: HTMLElement, name: string, state: boolean): void;

  /**
   * Determine the direction in which the container is rolling.
   * @param el list container.
   * @param selector an element seletor.
   */
  detectDirection(el: HTMLElement, selector: string): Direction;
}

declare class Sortable {
  public el: HTMLElement;

  public options: SortableOptions;

  /**
   * @param element The Parent which holds the draggable element(s).
   * @param options Options to customise the behavior of the drag animations.
   */
  constructor(element: HTMLElement, options?: SortableOptions);

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
  static utils: Utils;

  /**
   * Create sortable instance.
   * @param el The Parent which holds the draggable element(s).
   * @param options Options to customise the behavior of the drag animations.
   */
  static create(el: HTMLElement, options: SortableOptions): Sortable;

  /**
   * Get the Sortable instance of an element.
   * @param el Elements passed in when creating an instance.
   */
  static get(el: HTMLElement): Sortable | undefined;

  /**
   * Get or set the option value, depending on whether the `value` is passed in.
   * @param name a SortableOptions property.
   * @param value a value.
   */
  option<K extends keyof SortableOptions>(name: K, value: SortableOptions[K]): void;
  option<K extends keyof SortableOptions>(name: K): SortableOptions[K];

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

export default Sortable;
