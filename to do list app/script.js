document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const taskDateTime = document.getElementById('taskDateTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const allBtn = document.getElementById('allBtn');
    const activeBtn = document.getElementById('activeBtn');
    const completedBtn = document.getElementById('completedBtn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const taskCount = document.getElementById('taskCount');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTaskCount();
        setMinDateTime();
        
        // Set current filter button as active
        document.querySelector('.filter-container button.active').classList.remove('active');
        document.getElementById(`${currentFilter}Btn`).classList.add('active');
    }
    
    // Set minimum date/time to current date/time
    function setMinDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        taskDateTime.min = minDateTime;
        
        // Set default value to current date/time
        taskDateTime.value = minDateTime;
    }
    
    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        const dateTime = taskDateTime.value;
        
        if (text !== '') {
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false,
                dateTime: dateTime,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateTaskCount();
            
            // Clear input fields
            taskInput.value = '';
            setMinDateTime();
        }
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = [];
        
        switch (currentFilter) {
            case 'active':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = [...tasks];
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet!' : 
                                      currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-item');
                taskItem.dataset.id = task.id;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('task-checkbox');
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
                
                const taskText = document.createElement('span');
                taskText.classList.add('task-text');
                if (task.completed) {
                    taskText.classList.add('completed');
                }
                taskText.textContent = task.text;
                
                const taskDateTimeDisplay = document.createElement('span');
                taskDateTimeDisplay.classList.add('task-datetime');
                
                if (task.dateTime) {
                    const date = new Date(task.dateTime);
                    const formattedDate = formatDateTime(date);
                    taskDateTimeDisplay.textContent = formattedDate;
                }
                
                const taskActions = document.createElement('div');
                taskActions.classList.add('task-actions');
                
                const editBtn = document.createElement('button');
                editBtn.classList.add('edit-btn');
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.addEventListener('click', () => editTask(task.id));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
                
                taskActions.appendChild(editBtn);
                taskActions.appendChild(deleteBtn);
                
                taskItem.appendChild(checkbox);
                taskItem.appendChild(taskText);
                taskItem.appendChild(taskDateTimeDisplay);
                taskItem.appendChild(taskActions);
                
                taskList.appendChild(taskItem);
            });
        }
    }
    
    // Format date/time for display
    function formatDateTime(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    }
    
    // Toggle task complete status
    function toggleTaskComplete(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
    
    // Edit a task
    function editTask(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            const newDateTime = prompt('Edit date/time (YYYY-MM-DDTHH:MM):', task.dateTime);
            
            if (newDateTime !== null) {
                task.text = newText.trim();
                task.dateTime = newDateTime || task.dateTime;
                saveTasks();
                renderTasks();
            }
        }
    }
    
    // Delete a task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    }
    
    // Clear all completed tasks
    function clearCompletedTasks() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateTaskCount();
        }
    }
    
    // Update task count
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
    }
    
    // Set filter
    function setFilter(filter) {
        currentFilter = filter;
        init();
    }
    
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    allBtn.addEventListener('click', () => setFilter('all'));
    activeBtn.addEventListener('click', () => setFilter('active'));
    completedBtn.addEventListener('click', () => setFilter('completed'));
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Initialize the app
    init();
});
