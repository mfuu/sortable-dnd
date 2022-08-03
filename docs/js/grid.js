const gridGroup = document.getElementById('gridGroup');
const gridChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<i class="drag">drag me</i><p>${i + 1}</p>`;
  gridChildren.push(li);
}
gridGroup.append(...gridChildren);
new Sortable(
  gridGroup,
  {
    animation: 150,
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