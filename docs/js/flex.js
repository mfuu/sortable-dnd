const flexGroup = document.getElementById('flexGroup');
const flexChildren = [];
for(let i = 0; i < 64; i++) {
  let li = document.createElement('li');
  li.innerHTML = `<i class="drag">drag me</i><p>${i + 1}</p>`;
  flexChildren.push(li);
}
flexGroup.append(...flexChildren);
new Sortable(
  flexGroup,
  {
    animation: 500,
    ghostStyle: { border: '1px solid #aaa', textAlign: 'center' },
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