const group1 = document.getElementById('group1');
const group1Children = [];
for(let i = 0; i < 5; i++) {
  let li = document.createElement('li');
  li.setAttribute('data-key', i + 1);
  li.innerHTML = `<i class="drag">drag me</i><span>${i + 1}</span>`;
  group1Children.push(li);
}
group1.append(...group1Children);

new Sortable(
  group1,
  {
    group: { name: 'g', put: true, pull: true },
    animation: 150,
    chosenClass: 'chosen',
    draggable: (e) => {
      return e.target.tagName === 'I' ? true : false
    }
  }
);

const group2 = document.getElementById('group2');
const group2Children = [];
for(let i = 0; i < 5; i++) {
  let li = document.createElement('li');
  li.setAttribute('data-key', i + 10);
  li.innerHTML = `<i class="drag">drag me</i><span>${i + 10}</span>`;
  group2Children.push(li)
}
group2.append(...group2Children);

new Sortable(
  group2,
  {
    group: { name: 'g', put: false, pull: true },
    animation: 150,
    chosenClass: 'chosen',
    draggable: (e) => {
      return e.target.tagName === 'I' ? true : false
    },
    onChange: ({ from, to, event }) => {
      console.log(from, to)
    }
  }
);