function initSortable(id, config = {}) {
  const list = getPageData(10, 0);
  const wrap = document.getElementById(id);

  for (let i = 0; i < list.length; i++) {
    let li = document.createElement("li");
    li.classList.add("list-item");
    li.classList.add(config.itemClass);
    li.innerHTML = `
      ${
        config.handle
          ? '<div class="text-align-right"><i class="handle">☰</i></div>'
          : ""
      }
      <p>${list[i].desc}</p>
    `;
    wrap.append(li);
  }

  new Sortable(wrap, {
    chosenClass: "chosen",
    selectedClass: "selected",
    onDrag: (params) => {
      console.log(params, "drag");
    },
    onDrop: (params) => {
      console.log(params, "drop");
    },
    onMove: (params) => {
      // code
    },
    onChange: (params) => {
      // code
    },
    onAdd: (params) => {
      console.log(params, "add");
    },
    onRemove: (params) => {
      console.log(params, "remove");
    },
    ...config,
  });
}
