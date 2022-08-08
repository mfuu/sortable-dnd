const nestedGroup = document.getElementById('nestedDemo');
new Sortable(
  nestedGroup,
  {
    animation: 150,
    chosenClass: 'chosen',
    fallbackOnBody: true,
    // draggable: (e) => e.target,
    onDrag: (e) => {
      console.log(e, 'ondrag')
    },
    onDrop: (changed) => {
      console.log(changed, 'changed')
    }
  }
);