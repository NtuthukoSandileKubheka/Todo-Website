const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date-input');
const todoListUL = document.getElementById('todo-list');
const modal = document.getElementById("subtask-modal");
const subtaskInput = document.getElementById("subtask-input");
const saveSubtaskBtn = document.getElementById("save-subtask");
const closeModalBtn = document.getElementById("close-modal");
let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addTodo();
});

function addTodo() {
    const todoText = todoInput.value.trim();
    const dueDate = dueDateInput.value; // Get due date

    if (todoText.length > 0) {
        const todoObject = {
            text: todoText,
            completed: false,
            important: false,
            subtasks: [],
            dueDate: dueDate || null, // Add due date to the todo object
        };
        allTodos.push(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = "";
        dueDateInput.value = ""; // Clear due date input
    }
}

function updateTodoList() {
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, todoIndex) => {
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    });
}

function createTodoItem(todo, todoIndex) {
    const todoId = "todo-" + todoIndex;
    const todoLI = document.createElement("li");
    todoLI.className = "todo";
    if (todo.important) {
        todoLI.classList.add("important");
    }

    // Check if the task is overdue
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const isOverdue = todo.dueDate && todo.dueDate < today && !todo.completed;

    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}" ${todo.completed ? 'checked' : ''}>
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todo.text}
        </label>
        ${todo.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${todo.dueDate}</span>` : ''}
        <button class="important-button">⭐</button>
        <button class="add-subtask-button">➕</button>
        <ul class="subtasks"></ul>
        <button class="delete-button">
            <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `;

    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        deleteTodoItem(todoIndex);
    });

    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    });

    const importantButton = todoLI.querySelector(".important-button");
    importantButton.addEventListener("click", () => {
        allTodos[todoIndex].important = !allTodos[todoIndex].important;
        saveTodos();
        updateTodoList();
    });

    const subtaskList = todoLI.querySelector(".subtasks");
    todo.subtasks.forEach((subtask, subIndex) => {
        const subtaskItem = document.createElement("li");
        subtaskItem.innerHTML = `
            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
            <span>${subtask.text}</span>
            <button class="delete-subtask">❌</button>
        `;

        subtaskItem.querySelector("input").addEventListener("change", (e) => {
            allTodos[todoIndex].subtasks[subIndex].completed = e.target.checked;
            saveTodos();
        });

        subtaskItem.querySelector(".delete-subtask").addEventListener("click", () => {
            allTodos[todoIndex].subtasks.splice(subIndex, 1);
            saveTodos();
            updateTodoList();
        });

        subtaskList.appendChild(subtaskItem);
    });

    const addSubtaskButton = todoLI.querySelector(".add-subtask-button");
    addSubtaskButton.addEventListener("click", () => {
        modal.style.display = "flex";

        saveSubtaskBtn.onclick = () => {
            const subtaskText = subtaskInput.value.trim();
            if (subtaskText) {
                allTodos[todoIndex].subtasks.push({ text: subtaskText, completed: false });
                saveTodos();
                updateTodoList();
            }
            subtaskInput.value = "";
            modal.style.display = "none";
        };
    });

    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    return todoLI;
}

function deleteTodoItem(todoIndex) {
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    saveTodos();
    updateTodoList();
}

function saveTodos() {
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos() {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}