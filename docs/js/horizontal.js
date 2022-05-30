const horizontalGroup = document.getElementById('horizontalGroup');
const horizontalChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerText = i + 1;
  horizontalChildren.push(li);
}
horizontalGroup.append(...horizontalChildren);
new Sortable(
  horizontalGroup,
  {
    animation: 500,
    chosenClass: 'chosen',
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