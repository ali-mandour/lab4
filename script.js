const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const itemsLeft = document.getElementById("itemsLeft");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clearCompleted");
const clearAllBtn = document.getElementById("clearAll");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  tasks.push({ id: Date.now(), text: text, completed: false });
  taskInput.value = "";
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  save();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  save();
  render();
}

function updateTaskText(id, newText) {
  const task = tasks.find(t => t.id === id);
  const trimmed = newText.trim();
  if (task && trimmed !== "") {
    task.text = trimmed;
  }
  save();
  render();
}

function getFilteredTasks() {
  if (currentFilter === "active") return tasks.filter(t => !t.completed);
  if (currentFilter === "completed") return tasks.filter(t => t.completed);
  return tasks;
}

function startEditing(li, task) {
  const span = li.querySelector(".task-text");
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.text;
  input.className = "edit-input";

  span.replaceWith(input);
  input.focus();

  let finished = false;

  function finish(save) {
    if (finished) return;
    finished = true;
    if (save) {
      updateTaskText(task.id, input.value);
    } else {
      render();
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });

  input.addEventListener("blur", () => finish(true));
}

function render() {
  taskList.innerHTML = "";
  const visible = getFilteredTasks();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = tasks.length === 0 ? "No tasks yet. Add one above!" : "Nothing to show here.";
    taskList.appendChild(empty);
  }

  visible.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    span.addEventListener("dblclick", () => startEditing(li, task));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "❌";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, span, deleteBtn);
    taskList.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.completed).length;
  itemsLeft.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
}

// Events
addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
});

clearAllBtn.addEventListener("click", () => {
  if (confirm("Delete all tasks?")) {
    tasks = [];
    save();
    render();
  }
});

render();