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
   * Name of the group. Sortable lists with the same group name can drag items between each other.
   */
  name: string;

  /**
   * Whether elements can be added to this list from other lists.
   * Can be set to `true`, `false`, or an array of group names allowed to put items in this list.
   */
  put?: readonly string[] | boolean;

  /**
   * Ability to move items out of this list.
   * - `true`: allow items to be dragged out.
   * - `false`: prevent items from being dragged out.
   * - `'clone'`: copy the item rather than move it.
   */
  pull?: boolean | 'clone';

  /**
   * Whether to return the dragged element to its initial position after moving to another list when pull is set to `'clone'`.
   */
  revertDrag?: boolean;
}

export interface ScrollSpeed {
  x: number;
  y: number;
}

export interface SortableEvent {
  /**
   * The source list container from which the dragged element originated.
   */
  from: HTMLElement;

  /**
   * The target list container currently holding the dragged/placeholder element.
   * In `pull: 'clone'`, it may represent the source list (`from`).
   */
  to: HTMLElement;

  /**
   * The original element being dragged.
   */
  node: HTMLElement;

  /**
   * The cloned placeholder element. All drag-and-drop operations and DOM rearrangements
   * are based on this clone to avoid altering the source element directly during sorting.
   */
  clone: HTMLElement;

  /**
   * The current target element under the cursor that is being hovered or swapped with.
   */
  target: HTMLElement;

  /**
   * The starting index of the dragged element within its parent container (`from`).
   * Returns `-1` if the element was added from another list.
   */
  oldIndex: number;

  /**
   * The target ending index of the dragged element within its new container (`to`).
   * Returns `-1` if the element has been removed from the current list.
   */
  newIndex: number;

  /**
   * The underlying native touch or mouse event.
   */
  event: EventType;

  /**
   * The pull option mode of the source list (e.g., `true`, `false`, or `'clone'`).
   */
  pullMode: boolean | 'clone';

  /**
   * Position of the dragged element relative to the target element after a swap is completed.
   * @example
   * 0: // The position of target is the same as the dragged element.
   * <div id="same">dragEl, dropEl</div>
   *
   * 1: // The dragged element comes after the target element.
   * <div id="before">dropEl</div>
   * <div id="after">dragEl</div>
   *
   * -1: // The dragged element comes before the target element.
   * <div id="before">dragEl</div>
   * <div id="after">dropEl</div>
   */
  relative: 0 | 1 | -1;

  /**
   * Whether the dragged element returns to its initial position after moving to another list under `pull: 'clone'` & `revertDrag: true`.
   */
  revertDrag?: boolean;

  /**
   * Whether the dragged element should go back to the original list under `pull: 'clone'`.
   */
  backToOrigin?: boolean;
}

export interface SortableOptions {
  /**
   * A custom data store object or function to get/set sorting state.
   * @example
   * sortable.option('store', value); // store value
   * sortable.option('store'); // get the stored value
   *
   * @defaults `undefined`
   */
  store?: any;

  /**
   * Disables the sortable instance if set to `true`.
   * @defaults `false`
   */
  disabled?: boolean;

  /**
   * Whether the current list can be sorted by dragging.
   * @defaults `true`
   */
  sortable?: boolean;

  /**
   * Specifies which items inside the container should be draggable.
   * Supports standard CSS selectors.
   * @example
   * - 'div'   // use tag name
   * - '.item' // use class name
   * - '#item' // use ID
   * - '>div'  // use immediate child tag name selector
   * @defaults `'>*'`
   */
  draggable?: string;

  /**
   * Selector or function defining the drag handle within list items.
   * @example
   * - (e) => e.target.tagName === 'I' ? true : false
   * - 'i'        // use tag name
   * - '.handle'  // use class name
   * - '#handle'  // use ID
   * @defaults `''`
   */
  handle?: string | ((event: EventType) => boolean);

  /**
   * Set value to allow dragging between different lists.
   * Can be a group name string or a configuration object.
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
   *    // whether to revert the drag element to its initial position after clone to a another list.
   *    revertDrag: true | false,
   * }
   * @defaults `''`
   */
  group?: string | Group;

  /**
   * Axis along which dragging should be locked.
   * - `'x'`: horizontal lock.
   * - `'y'`: vertical lock.
   * @defaults `''`
   */
  lockAxis?: 'x' | 'y';

  /**
   * A custom callback function to create or customize the ghost element during dragging.
   * @defaults `undefined`
   */
  customGhost?: (node: HTMLElement) => HTMLElement;

  /**
   * Direction of the Sortable list. Automatically detected if not provided.
   * @defaults `''`
   */
  direction?:
    | Direction
    | ((event: EventType, dragEl: HTMLElement, sortable: Sortable) => Direction);

  /**
   * Animation duration (in milliseconds) when swapping/reordering list items.
   * Set to `0` to disable animations.
   * @defaults `150`
   */
  animation?: number;

  /**
   * CSS easing function or value applied to sorting animations.
   * See https://easings.net/ for examples.
   * @example
   * // CSS functions
   * - 'steps(int, start | end)'
   * - 'cubic-bezier(n, n, n, n)'
   *
   * // CSS keywords
   * - 'linear'
   * - 'ease'
   * - 'ease-in-out'
   * @defaults `''`
   */
  easing?: string;

  /**
   * Whether to enable automatic scrolling when dragging near the container or page edges.
   * @defaults `true`
   */
  autoScroll?: boolean;

  /**
   * Distance (in pixels) from the container boundary required to trigger automatic scrolling.
   * @defaults `55`
   */
  scrollThreshold?: number;

  /**
   * Vertical and horizontal scrolling speed (in pixels per frame).
   * @defaults `{ x: 10, y: 10 }`
   */
  scrollSpeed?: ScrollSpeed;

  /**
   * Delay (in milliseconds) before the sorting drag starts.
   * @defaults `0`
   */
  delay?: number;

  /**
   * Only apply the drag delay when the user is on a touch device.
   * @defaults `false`
   */
  delayOnTouchOnly?: boolean;

  /**
   * Distance (in pixels) the pointer must move during a delay period before the drag is cancelled.
   * @defaults `1`
   */
  touchStartThreshold?: number;

  /**
   * Distance (in pixels) the cursor must be from an empty sortable list to trigger element insertion.
   * @defaults `-1`
   */
  emptyInsertThreshold?: number;

  /**
   * Whether to append the ghost mirror element to the document body instead of the container.
   * @defaults `false`
   */
  appendToBody?: boolean;

  /**
   * Element or custom function returning the element to append the ghost mirror to.
   * @defaults `null`
   */
  ghostContainer?: HTMLElement | ((sortable: Sortable) => HTMLElement);

  /**
   * Whether to finalize the position of `dragEl` on drop.
   * - `true`: placing `dragEl` in the drop position on drop.
   * - `false`: do not move `dragEl` to drop position (typically used for virtual-list updates).
   * @defaults `true`
   */
  swapOnDrop?: boolean | ((event: SortableEvent) => boolean);

  /**
   * Whether to remove the cloned element after dragging completes successfully.
   * @defaults `true`
   */
  removeCloneOnDrop?: boolean | ((event: SortableEvent) => boolean);

  /**
   * Whether to delay trigger of the `onDrop` event until sorting animations complete.
   * @defaults `false`
   */
  dropOnAnimationEnd?: boolean;

  /**
   * CSS class name applied to the active chosen item during sorting.
   * @defaults `''`
   */
  chosenClass?: string;

  /**
   * CSS class name applied to the drop placeholder (clone) element remaining in the list during drag.
   * @defaults `''`
   */
  placeholderClass?: string;

  /**
   * Style declarations applied directly to the ghost mirror element.
   * @defaults `{}`
   */
  ghostStyle?: Partial<CSSStyleDeclaration>;

  /**
   * CSS class name applied to the floating ghost mirror element.
   * @default `''`
   */
  ghostClass?: string;

  /**
   * Callback fired immediately when an element is chosen for potential dragging.
   */
  onChoose?: (event: SortableEvent) => void;

  /**
   * Callback fired when an element is unchosen without completing sorting.
   */
  onUnchoose?: (event: SortableEvent) => void;

  /**
   * Callback fired when dragging officially starts.
   */
  onDrag?: (event: SortableEvent) => void;

  /**
   * Callback fired on every move step as elements are being arranged.
   */
  onMove?: (event: SortableEvent) => void;

  /**
   * Callback fired when the dragged element is successfully dropped.
   */
  onDrop?: (event: SortableEvent) => void;

  /**
   * Callback fired when an element from another list is added to the current list (process of dragging).
   */
  onAdd?: (event: SortableEvent) => void;

  /**
   * Callback fired when an element is dragged out of the current list into another (process of dragging).
   */
  onRemove?: (event: SortableEvent) => void;

  /**
   * Callback fired when the dragged element changes index/position within the current list (process of dragging).
   */
  onChange?: (event: SortableEvent) => void;
}

export interface Utils {
  /**
   * Attaches an event listener to an element.
   * @param el The target HTMLElement.
   * @param event The event type (e.g., 'touchstart', 'mousedown').
   * @param fn The event handler function.
   */
  on(el: HTMLElement, event: string, fn: EventListenerOrEventListenerObject): void;

  /**
   * Removes an event listener from an element.
   * @param el The target HTMLElement.
   * @param event The event type (e.g., 'touchstart', 'mousedown').
   * @param fn The event handler function to remove.
   */
  off(el: HTMLElement, event: string, fn: EventListenerOrEventListenerObject): void;

  /**
   * Reads the computed CSS style declarations of an element.
   * @param el The target HTMLElement.
   */
  css(el: HTMLElement): CSSStyleDeclaration;

  /**
   * Reads a specific computed CSS style property of an element.
   * @param el The target HTMLElement.
   * @param prop The CSS style property key.
   */
  css<K extends keyof CSSStyleDeclaration>(el: HTMLElement, prop: K): CSSStyleDeclaration[K];

  /**
   * Sets a specific inline CSS style property value on an element.
   * @param el The target HTMLElement.
   * @param prop The CSS style property key.
   * @param value The value to apply to the style property.
   */
  css<K extends keyof CSSStyleDeclaration>(
    el: HTMLElement,
    prop: K,
    value: CSSStyleDeclaration[K]
  ): void;

  /**
   * Returns the current index of an element among its siblings (ignoring template or invisible elements).
   * @param el The target HTMLElement.
   * @param selector Optional CSS selector to filter sibling comparison.
   */
  index(el: HTMLElement, selector?: string): number;

  /**
   * Checks if an element matches a given selector.
   * @param el The target HTMLElement.
   * @param selector The CSS selector string.
   */
  matches(el: HTMLElement, selector: string): boolean;

  /**
   * Finds the closest ancestor element that matches the given selector (tests the element itself first).
   * @param el The target HTMLElement.
   * @param selector The CSS selector string.
   * @param context Optional bounding container element.
   * @param includeContext Whether to include the context element in match evaluation.
   */
  closest(
    el: HTMLElement,
    selector: string,
    context?: HTMLElement,
    includeContext?: boolean
  ): HTMLElement | null;

  /**
   * Computes the bounding rect coordinates of an element, with optional absolute/parent container offsets.
   * @param el The target HTMLElement.
   * @param relativeToContainingBlock Whether offsets should be computed relative to containing blocks.
   * @param container Bounding container offset reference.
   */
  getRect(el: HTMLElement, relativeToContainingBlock?: boolean, container?: HTMLElement): DOMRect;

  /**
   * Returns the draggable element at a given index of draggable elements within a Sortable instance.
   * @param el The target HTMLElement.
   * @param childNum The index of the child element to return.
   * @param selector Optional CSS selector to filter child comparison.
   * @param includeDragEl Whether to include the dragged element in the comparison.
   */
  getChild(
    el: HTMLElement,
    childNum: number,
    selector?: string,
    includeDragEl?: boolean
  ): HTMLElement | null;

  /**
   * Adds or removes a CSS class on an element based on a boolean state toggle.
   * @param el The target HTMLElement.
   * @param name The class name to toggle.
   * @param state `true` to add the class, `false` to remove it.
   */
  toggleClass(el: HTMLElement, name: string, state: boolean): void;

  /**
   * Automatically detects or determines directionality of children in a container (vertical or horizontal).
   * @param el The list container element.
   * @param selector The item selector string.
   */
  detectDirection(el: HTMLElement, selector: string): Direction;

  /**
   * expando property name for internal use, sortableListElement[expando] returns the Sortable instance of that element
   */
  expando: string;
}

declare class Sortable {
  public el: HTMLElement;

  public options: SortableOptions;

  /**
   * @param el The Parent container holding the draggable elements.
   * @param options Configuration options to customize the behavior of the drag animations and sorting.
   */
  constructor(el: HTMLElement, options?: SortableOptions);

  /**
   * Reference to the currently active Sortable instance.
   */
  static active: Sortable | null;

  /**
   * Reference to the original HTMLElement being dragged.
   */
  static dragged: HTMLElement | null;

  /**
   * Reference to the cloned placeholder HTMLElement.
   */
  static clone: HTMLElement | null;

  /**
   * Reference to the floating ghost HTMLElement mirror.
   */
  static ghost: HTMLElement | null;

  /**
   * Exposed static utility functions for DOM manipulation and calculation.
   */
  static utils: Utils;

  /**
   * A global key-value store object for storing internal or session state data.
   */
  static store: any;

  /**
   * Creates and returns a new Sortable instance for a container element.
   * @param el The Parent container holding the draggable elements.
   * @param options Configuration options.
   */
  static create(el: HTMLElement, options: SortableOptions): Sortable;

  /**
   * Retrieves the associated Sortable instance bound to a DOM element container.
   * @param el The DOM element.
   */
  static get(el: HTMLElement): Sortable | undefined;

  /**
   * Sets an option key value dynamically on the Sortable instance.
   * @param name The option property key.
   * @param value The value to apply.
   */
  option<K extends keyof SortableOptions>(name: K, value: SortableOptions[K]): void;

  /**
   * Retrieves an option value from the Sortable instance dynamically.
   * @param name The option property key.
   */
  option<K extends keyof SortableOptions>(name: K): SortableOptions[K];

  /**
   * Tears down the Sortable instance completely, removing event listeners and references.
   */
  destroy(): void;
}

export default Sortable;
