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
        updateFilterButtons();
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
            const priority = Math.floor(Math.random() * 3); // Random priority for demo
            
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false,
                dateTime: dateTime,
                priority: priority, // 0 = low, 1 = medium, 2 = high
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateTaskCount();
            
            // Clear input fields
            taskInput.value = '';
            setMinDateTime();
            
            // Add colorful animation
            addTaskBtn.classList.add('clicked');
            setTimeout(() => {
                addTaskBtn.classList.remove('clicked');
            }, 300);
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
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet! Add one above!' : 
                                      currentFilter === 'active' ? 'No active tasks! Great job!' : 'No completed tasks yet!';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-item');
                taskItem.dataset.id = task.id;
                
                // Add priority class
                if (task.priority === 2) {
                    taskItem.classList.add('high-priority');
                } else if (task.priority === 1) {
                    taskItem.classList.add('medium-priority');
                } else {
                    taskItem.classList.add('low-priority');
                }
                
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
                
                // Ask for new priority
                const newPriority = prompt('Set priority (1 = Low, 2 = Medium, 3 = High):', task.priority + 1);
                if (newPriority && [1, 2, 3].includes(parseInt(newPriority))) {
                    task.priority = parseInt(newPriority) - 1;
                }
                
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
            
            // Add delete animation
            const deletedItem = document.querySelector(`[data-id="${id}"]`);
            if (deletedItem) {
                deletedItem.classList.add('deleting');
                setTimeout(() => {
                    deletedItem.remove();
                }, 300);
            }
        }
    }
    
    // Clear all completed tasks
    function clearCompletedTasks() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateTaskCount();
            
            // Add clear animation
            clearCompletedBtn.classList.add('clicked');
            setTimeout(() => {
                clearCompletedBtn.classList.remove('clicked');
            }, 300);
        }
    }
    
    // Update task count
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        const totalTasks = tasks.length;
        
        let countText = '';
        if (totalTasks === 0) {
            countText = 'No tasks yet!';
        } else if (activeTasks === 0) {
            countText = 'All tasks completed! 🎉';
        } else {
            countText = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
        }
        
        taskCount.textContent = countText;
    }
    
    // Update filter buttons
    function updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${currentFilter}Btn`).classList.add('active');
    }
    
    // Set filter
    function setFilter(filter) {
        currentFilter = filter;
        updateFilterButtons();
        renderTasks();
        
        // Add filter animation
        const activeBtn = document.getElementById(`${filter}Btn`);
        activeBtn.classList.add('clicked');
        setTimeout(() => {
            activeBtn.classList.remove('clicked');
        }, 300);
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
