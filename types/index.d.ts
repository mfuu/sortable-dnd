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
   * Whether elements can be moved out of this list.
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
   * List of currently placed drag element.
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
   * Pull value of the start list.
   */
  pullMode: boolean | 'clone';

  /**
   * Position of the drop element relative to the drag element after swap is complete.
   * @example
   * 0: <div>dragEl, dropEl</div> // The position of dropEl is the same as dragEl.
   *
   * 1: <div>dragEl</div> // dropEl comes after dragEl.
   *    <div>dropEl</div>
   *
   * -1: <div>dropEl</div> // dropEl comes before dragEl.
   *    <div>dragEl</div>
   */
  relative: 0 | 1 | -1;

  /**
   * Revert draged element to initial position after moving to a another list if `pull: 'clone'` & `revertDrag: true`.
   */
  revertDrag?: boolean;

  /**
   * Dragged element go back to the original list if `pull: 'clone'`.
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
   * - string: '...'
   * - object: { name: '...', put: true | false, pull: true | false | 'clone', revertDrag: true | false }
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
  dealyOnTouchOnly?: boolean;

  /**
   * How many *pixels* the point should move before cancelling a delayed drag event.
   * @defaults `1`
   */
  touchStartThreshold?: number;

  /**
   * Distance mouse must be from empty sortable to insert drag element into it.
   * @defaults `-5`
   */
  emptyInsertThreshold?: number;

  /**
   * Appends the ghost Element into the Document's Body.
   * @defaults `false`
   */
  fallbackOnBody?: boolean;

  /**
   * When the value is false, the dragged element will return to the starting position of the drag.
   * @defaults `true`
   */
  swapOnDrop?: boolean | ((params: SortableEvent) => boolean);

  /**
   * This class will be added to the item while dragging.
   * @defaults `''`
   */
  chosenClass?: string;

  /**
   * Class name for selected item.
   * @defaults `''`
   */
  selectedClass?: string;

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
  onChoose?: (params: SortableEvent) => void;

  /**
   * Element is unchosen.
   */
  onUnchoose?: (params: SortableEvent) => void;

  /**
   * Element dragging started.
   */
  onDrag?: (params: SortableEvent) => void;

  /**
   * Event when you move an item in the list or between lists.
   */
  onMove?: (params: SortableEvent) => void;

  /**
   * Element dragging is completed.
   * The params records only the status from the drag to the drop, all operations in the process are ignored.
   */
  onDrop?: (params: SortableEvent) => void;

  /**
   * Element is dropped into the current list from another.
   */
  onAdd?: (params: SortableEvent) => void;

  /**
   * Element is removed from the current list into another.
   */
  onRemove?: (params: SortableEvent) => void;

  /**
   * Dragging element changes position in the current list.
   */
  onChange?: (params: SortableEvent) => void;

  /**
   * Element is selected. Takes effect in `multiple: true`.
   */
  onSelect?: (params: SelectEvent) => void;

  /**
   * Element is unselected. Takes effect in `multiple: true`.
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
  closest(element: HTMLElement, selector: string, context: HTMLElement, includeContext?: boolean): HTMLElement | null;

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

export { Sortable };
export default Sortable;
