const verticalGroup = document.getElementById('verticalGroup');
const verticalChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerText = i + 1;
  verticalChildren.push(li);
}
verticalGroup.append(...verticalChildren);
new Sortable(
  verticalGroup,
  {
    animation: 500,
    chosenClass: 'chosen',
    onDrag: (e) => {
      console.log(e, 'ondrag')
    },
    onDrop: (changed) => {
      console.log(changed, 'changed')
    }
  }
);