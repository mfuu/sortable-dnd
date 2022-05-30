const blockGroup = document.getElementById('blockGroup');
const blockChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<i class="drag">drag me</i><p>${i + 1}</p>`;
  blockChildren.push(li);
}
blockGroup.append(...blockChildren);
new Sortable(
  blockGroup,
  {
    animation: 500,
    chosenClass: 'chosen',
    draggable: (e) => {
      return e.target.tagName === 'I' ? true : false
    },
    onDrag: (e) => {
      console.log(e, 'ondrag')
    },
    onDrop: (changed) => {
      console.log(changed, 'changed')
    },
    onChange: (from, to) => {
      console.log(from, to)
    }
  }
);