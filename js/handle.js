const gridGroup = document.getElementById('gridGroup');
const gridChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<i class="drag"></i>  <span>item ${i + 1}</span>`;
  gridChildren.push(li);
}
gridGroup.append(...gridChildren);
new Sortable(
  gridGroup,
  {
    animation: 150,
    handle: '.drag',
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