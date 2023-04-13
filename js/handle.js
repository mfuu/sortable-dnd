const handleGroup = document.getElementById('handleGroup');
const handleChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<i class="drag"></i>  <span>item ${i + 1}</span>`;
  handleChildren.push(li);
}
handleGroup.append(...handleChildren);
new Sortable(
  handleGroup,
  {
    animation: 150,
    chosenClass: 'chosen',
    handle: '.drag',
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