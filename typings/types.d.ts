type Group =
{
    name: String;
    put: Boolean;
    pull: Boolean;
};

type Offset =
{
    height: Number;
    width: Number;
    top: Number;
    left: Number;
};

type Rect =
{
    height: Number;
    width: Number;
    top: Number;
    bottom: Number;
    left: Number;
    right: Number;
};

type FromTo =
{
    group: HTMLElement;
    node: HTMLElement;
    offset: Offset;
    rect: Rect;
};

type DragParams =
{
    from: FromTo;
    to: FromTo;
    event: Event & PointerEvent;
    originalEvent: Event & PointerEvent;
};

type MoveParams =
{
    from: FromTo;
    to: FromTo;
    event: Event & DragEvent;
    originalEvent: Event & DragEvent;
    ghostEl: HTMLElement;
};

type DropParams =
{
    from: FromTo;
    to: FromTo;
    event: DragEvent;
    originalEvent: DragEvent;
    changed: Boolean;
};

type Standard =
{
    from: FromTo;
    to: FromTo;
    event: Event;
    originalEvent: Event;
};

type ChangeParams =
{
    from: FromTo;
    to: FromTo;
    event: Event & DragEvent;
    originalEvent: Event & DragEvent;
};

type onDrag = (params: DragParams) => {};
type onMove = (params: MoveParams) => {};
type onDrop = (params: DropParams) => {};
type onAdd = (params: Standard) => {};
type onRemove = (params: Standard) => {};
type onChange = (params: ChangeParams) => {};

type options =
{
    /**
     * Specifies which items inside the element should be draggable
     * @defaults `undefined`
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
     * @defaults `undefined`
     */
    onDrag?: onDrag;

    /**
     * The callback function when the dragged element is moving.
     * @defaults `undefined`
     */
    onMove?: onMove;

    /**
     * The callback function when the drag is completed.
     * @defaults `undefined`
     */
    onDrop?: onDrop;

    /**
     * The callback function when element is dropped into the list from another list.
     * @defaults `undefined`
     */
    onAdd?: onAdd;

    /**
     * The callback function when element is removed from the list into another list.
     * @defaults `undefined`
     */
    onRemove?: onRemove;
    
    /**
     * The callback function when the dragged element changes position in the list.
     * @defaults `undefined`
     */
    onChange?: onChange;

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
     * true: Ignore the HTML5 DnD behaviour and force the fallback to kick in.
     * @defaults `false`
     */
    forceFallback?: Boolean;

    /**
     * The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases.
     * @defualts `false`
     */
    stopPropagation?: Boolean;
};

declare class Sortable
{
    /**
     * @param ParentElement The Parent which holds the draggable element(s).
     * @param options Options to customise the behavior of the drag animations.
     */
    constructor(ParentElement: HTMLElement, options?: options);

    /**
     * Manually clear all the state of the component. After using this method, the component will no longer be draggable.
     */
    destroy(): void;
}

export = Sortable;