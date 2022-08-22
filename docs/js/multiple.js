const multiGroup = document.getElementById('multiGroup');
const multiChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<p>item ${i + 1}</p>`;
  multiChildren.push(li);
}
multiGroup.append(...multiChildren);
new Sortable(
  multiGroup,
  {
    animation: 150,
    multiple: true,
    chosenClass: 'chosen',
    selectedClass: 'selected',
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