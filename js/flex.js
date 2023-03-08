const flexGroup = document.getElementById('flexGroup');
const flexChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<p>item ${i + 1}</p>`;
  flexChildren.push(li);
}
flexGroup.append(...flexChildren);
new Sortable(
  flexGroup,
  {
    animation: 150,
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