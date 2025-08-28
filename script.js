// Modern Futuristic To-Do List JavaScript

// DOM Elements
const taskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const navItems = document.querySelectorAll('nav ul li');
const views = document.querySelectorAll('.main-content > div');
const themeSwitch = document.getElementById('theme-switch');
const addNoteBtn = document.getElementById('add-note-btn');
const notesContainer = document.getElementById('notes-container');
const noteModal = document.getElementById('note-modal');
const reminderModal = document.getElementById('reminder-modal');
const usernameModal = document.getElementById('username-modal');
const closeModals = document.querySelectorAll('.close-modal');
const saveNoteBtn = document.getElementById('save-note-btn');
const saveReminderBtn = document.getElementById('save-reminder-btn');
const saveUsernameBtn = document.getElementById('save-username-btn');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const reminderTime = document.getElementById('reminder-time');
const reminderUnit = document.getElementById('reminder-unit');
const usernameInput = document.getElementById('username-input');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const closeNotification = document.querySelector('.close-notification');
const quickReminderBtns = document.querySelectorAll('.quick-reminder-btn');
const usernameElement = document.getElementById('username');
const editUsernameBtn = document.getElementById('edit-username');
const soundSwitch = document.getElementById('sound-switch');

// Templates
const taskTemplate = document.getElementById('task-template');
const noteTemplate = document.getElementById('note-template');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
let username = localStorage.getItem('username') || 'NeoUser';
let currentFilter = 'all';
let editingNoteId = null;
let currentTaskId = null;
let reminderTimers = {};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }

    // Load saved username
    if (localStorage.getItem('username')) {
        username = localStorage.getItem('username');
        usernameElement.textContent = username;
    }

    // Load saved sound preference
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    soundSwitch.checked = soundEnabled;

    // Render tasks and notes
    renderTasks();
    renderNotes();

    // Add event listeners
    setupEventListeners();

    // Setup reminders
    setupReminders();

    // Add futuristic loading effect
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);

    // Add example water reminder if no tasks exist
    if (tasks.length === 0 && reminders.length === 0) {
        addQuickReminder('Drink water', 60);
    }
});

// Setup Event Listeners
function setupEventListeners() {
    // Add task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Edit username
    editUsernameBtn.addEventListener('click', editUsername);

    // Filter tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Navigation
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            views.forEach(v => v.classList.remove('active-view'));
            views[index].classList.add('active-view');
        });
    });

    // Theme toggle
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Notes
    addNoteBtn.addEventListener('click', openNoteModal);
    
    // Close modals
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            noteModal.style.display = 'none';
            reminderModal.style.display = 'none';
        });
    });
    
    saveNoteBtn.addEventListener('click', saveNote);
    saveReminderBtn.addEventListener('click', saveReminder);

    // Close notification
    closeNotification.addEventListener('click', () => {
        notification.style.display = 'none';
    });

    // Quick reminder buttons
    quickReminderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const task = btn.dataset.task;
            const time = parseInt(btn.dataset.time);
            addQuickReminder(task, time);
        });
    });

    // Username modal
    saveUsernameBtn.addEventListener('click', saveUsername);
    
    // Sound toggle
    soundSwitch.addEventListener('change', () => {
        localStorage.setItem('soundEnabled', soundSwitch.checked);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            noteModal.style.display = 'none';
        }
        if (e.target === reminderModal) {
            reminderModal.style.display = 'none';
        }
        if (e.target === usernameModal) {
            usernameModal.style.display = 'none';
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (noteModal.style.display === 'block') {
                noteModal.style.display = 'none';
            }
            if (reminderModal.style.display === 'block') {
                reminderModal.style.display = 'none';
            }
            if (usernameModal.style.display === 'block') {
                usernameModal.style.display = 'none';
            }
            if (notification.style.display === 'block') {
                notification.style.display = 'none';
            }
        }
    });
    
    // Enter key in username input
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveUsername();
    });
}

// Task Functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();

    // Add animation effect
    const firstTask = taskList.firstChild;
    if (firstTask) {
        firstTask.classList.add('highlight');
        setTimeout(() => {
            firstTask.classList.remove('highlight');
        }, 1000);
    }
}

function addQuickReminder(taskText, minutes) {
    // Create a new task
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    
    // Set a reminder for this task
    const reminderTime = minutes * 60 * 1000; // Convert minutes to milliseconds
    setReminder(newTask.id, reminderTime);
    
    renderTasks();
    
    // Show confirmation notification
    showNotification(`Reminder set: ${taskText} in ${minutes} minutes`);
}

function toggleTaskComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    const newCompleted = !task.completed;
    
    if (newCompleted) {
        // If task is being marked as completed, remove it after a short delay
        tasks[taskIndex] = { ...task, completed: true };
        saveTasks();
        renderTasks();
        updateAnalytics();
        
        // Show notification
        showNotification(`Task completed: ${task.text}`);
        
        // Remove the task after 2 seconds
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            updateAnalytics();
        }, 2000);
    } else {
        // If task is being marked as not completed, just update it
        tasks[taskIndex] = { ...task, completed: false };
        saveTasks();
        renderTasks();
        updateAnalytics();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText === null || newText.trim() === '') return;

    tasks = tasks.map(t => {
        if (t.id === id) {
            return { ...t, text: newText.trim() };
        }
        return t;
    });

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    // Remove any reminders for this task
    clearReminder(id);
    reminders = reminders.filter(reminder => reminder.taskId !== id);
    saveReminders();
    
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateAnalytics();
}

function renderTasks() {
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = currentFilter === 'all' ? 
            'No tasks yet. Add a new task to get started!' : 
            `No ${currentFilter} tasks found.`;
        taskList.appendChild(emptyMessage);
        return;
    }

    filteredTasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const taskItem = taskElement.querySelector('.task-item');
        const checkbox = taskElement.querySelector('input[type="checkbox"]');
        const taskText = taskElement.querySelector('.task-text');
        const taskReminder = taskElement.querySelector('.task-reminder');
        const setReminderBtn = taskElement.querySelector('.set-reminder');
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');

        taskItem.dataset.id = task.id;
        checkbox.checked = task.completed;
        taskText.textContent = task.text;

        // Check if this task has a reminder
        const reminder = reminders.find(r => r.taskId === task.id);
        if (reminder) {
            const reminderDate = new Date(reminder.time);
            const now = new Date();
            
            // Only show reminder if it's in the future
            if (reminderDate > now) {
                const timeLeft = formatTimeLeft(reminderDate - now);
                taskReminder.innerHTML = `<i class="fas fa-bell"></i> ${timeLeft}`;
            }
        }

        if (task.completed) {
            taskItem.classList.add('completed');
        }

        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        setReminderBtn.addEventListener('click', () => openReminderModal(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(taskItem);
    });

    updateAnalytics();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveReminders() {
    localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Reminder Functions
function openReminderModal(taskId) {
    currentTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Display task name in the modal
    document.querySelector('.task-name-display').textContent = task.text;
    
    // Check if there's an existing reminder for this task
    const existingReminder = reminders.find(r => r.taskId === taskId);
    if (existingReminder) {
        const now = new Date();
        const reminderDate = new Date(existingReminder.time);
        if (reminderDate > now) {
            const timeLeftMs = reminderDate - now;
            const minutes = Math.round(timeLeftMs / (60 * 1000));
            reminderTime.value = minutes;
            reminderUnit.value = '60'; // Default to minutes
        }
    } else {
        // Default values
        reminderTime.value = '30';
        reminderUnit.value = '60';
    }
    
    reminderModal.style.display = 'block';
    reminderTime.focus();
}

function saveReminder() {
    if (!currentTaskId) return;
    
    const time = parseInt(reminderTime.value);
    const unit = parseInt(reminderUnit.value);
    
    if (isNaN(time) || time <= 0) {
        alert('Please enter a valid time value.');
        return;
    }
    
    // Calculate reminder time in milliseconds
    const reminderTimeMs = time * unit * 1000;
    
    // Set the reminder
    setReminder(currentTaskId, reminderTimeMs);
    
    // Close the modal
    reminderModal.style.display = 'none';
    
    // Show confirmation
    const task = tasks.find(t => t.id === currentTaskId);
    if (task) {
        let timeText;
        if (unit === 60) timeText = `${time} minute${time !== 1 ? 's' : ''}`;
        else if (unit === 3600) timeText = `${time} hour${time !== 1 ? 's' : ''}`;
        else timeText = `${time} day${time !== 1 ? 's' : ''}`;
        
        showNotification(`Reminder set: ${task.text} in ${timeText}`);
    }
    
    // Reset current task ID
    currentTaskId = null;
    
    // Re-render tasks to show reminder indicators
    renderTasks();
}

function setReminder(taskId, timeInMs) {
    // Clear any existing reminder for this task
    clearReminder(taskId);
    
    // Calculate the absolute time for the reminder
    const reminderTime = new Date(Date.now() + timeInMs);
    
    // Add to reminders array
    reminders = reminders.filter(r => r.taskId !== taskId);
    reminders.push({
        id: Date.now(),
        taskId: taskId,
        time: reminderTime.toISOString()
    });
    
    saveReminders();
    
    // Set the timer
    reminderTimers[taskId] = setTimeout(() => {
        triggerReminder(taskId);
    }, timeInMs);
}

function clearReminder(taskId) {
    // Clear the timeout if it exists
    if (reminderTimers[taskId]) {
        clearTimeout(reminderTimers[taskId]);
        delete reminderTimers[taskId];
    }
}

function triggerReminder(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Remove the reminder from the array
    reminders = reminders.filter(r => r.taskId !== taskId);
    saveReminders();
    
    // Show notification
    showNotification(`Time to: ${task.text}`);
    
    // Play notification sound if enabled
    const soundEnabled = document.querySelector('.settings-content .setting-item:nth-child(2) input').checked;
    if (soundEnabled) {
        playNotificationSound();
    }
    
    // Re-render tasks to update UI
    renderTasks();
}

function playNotificationSound() {
    if (soundSwitch.checked) {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-remove-2576.mp3');
        audio.volume = 0.5;
        audio.play().catch(error => console.log('Error playing sound:', error));
    }
}

function showNotification(message) {
    notificationMessage.textContent = message;
    notification.style.display = 'block';
    
    // Play notification sound
    playNotificationSound();
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function formatTimeLeft(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return 'Soon';
    }
}

function setupReminders() {
    // Clear any existing timers
    Object.keys(reminderTimers).forEach(key => {
        clearTimeout(reminderTimers[key]);
    });
    reminderTimers = {};
    
    // Set up timers for all reminders
    const now = new Date();
    
    reminders = reminders.filter(reminder => {
        const reminderTime = new Date(reminder.time);
        
        // Skip reminders that are in the past
        if (reminderTime <= now) return false;
        
        // Calculate time until reminder
        const timeUntilReminder = reminderTime - now;
        
        // Set the timer
        reminderTimers[reminder.taskId] = setTimeout(() => {
            triggerReminder(reminder.taskId);
        }, timeUntilReminder);
        
        return true;
    });
    
    saveReminders();
}

// Username Functions
function editUsername() {
    // Open the username modal
    usernameInput.value = username;
    usernameModal.style.display = 'block';
    usernameInput.focus();
}

function saveUsername() {
    const newUsername = usernameInput.value.trim();
    if (newUsername !== '') {
        username = newUsername;
        usernameElement.textContent = username;
        localStorage.setItem('username', username);
        
        // Close the modal
        usernameModal.style.display = 'none';
        
        // Show confirmation
        showNotification(`Username updated to: ${username}`);
        
        // Add animation effect
        usernameElement.classList.add('highlight');
        setTimeout(() => {
            usernameElement.classList.remove('highlight');
        }, 1000);
    }
}

// Note Functions
function openNoteModal(note = null) {
    if (note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
        editingNoteId = note.id;
        document.querySelector('.modal-header h3').textContent = 'Edit Note';
    } else {
        noteTitle.value = '';
        noteContent.value = '';
        editingNoteId = null;
        document.querySelector('.modal-header h3').textContent = 'Add Note';
    }
    
    noteModal.style.display = 'block';
    noteTitle.focus();
}

function closeNoteModal() {
    noteModal.style.display = 'none';
}

function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (title === '' || content === '') {
        alert('Please enter both title and content for your note.');
        return;
    }

    if (editingNoteId) {
        // Edit existing note
        notes = notes.map(note => {
            if (note.id === editingNoteId) {
                return {
                    ...note,
                    title,
                    content,
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });
    } else {
        // Add new note
        const newNote = {
            id: Date.now(),
            title,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(newNote);
    }

    saveNotes();
    renderNotes();
    closeNoteModal();
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        openNoteModal(note);
    }
}

function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
}

function renderNotes() {
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No notes yet. Add a new note to get started!';
        notesContainer.appendChild(emptyMessage);
        return;
    }

    notes.forEach(note => {
        const noteElement = document.importNode(noteTemplate.content, true);
        const noteCard = noteElement.querySelector('.note-card');
        const noteTitle = noteElement.querySelector('.note-title');
        const noteContentEl = noteElement.querySelector('.note-content');
        const noteDate = noteElement.querySelector('.note-date');
        const editBtn = noteElement.querySelector('.edit-note');
        const deleteBtn = noteElement.querySelector('.delete-note');

        noteCard.dataset.id = note.id;
        noteTitle.textContent = note.title;
        noteContentEl.textContent = note.content;
        
        // Format date
        const date = new Date(note.updatedAt);
        noteDate.textContent = `Updated: ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        editBtn.addEventListener('click', () => editNote(note.id));
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        notesContainer.appendChild(noteCard);
    });
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Analytics Functions
function updateAnalytics() {
    if (tasks.length === 0) return;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${completionRate}%`;
    document.querySelector('.stat-card p').textContent = `${completionRate}% Complete`;
    
    // Calculate productivity score (simple algorithm)
    const today = new Date().setHours(0, 0, 0, 0);
    const recentTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).setHours(0, 0, 0, 0);
        return taskDate >= today - 7 * 24 * 60 * 60 * 1000; // Tasks from last 7 days
    });
    
    const recentCompletedTasks = recentTasks.filter(task => task.completed).length;
    const recentTasksCount = recentTasks.length;
    
    let productivityScore = 0;
    if (recentTasksCount > 0) {
        // Base score from completion rate
        productivityScore = Math.round((recentCompletedTasks / recentTasksCount) * 70);
        
        // Bonus for number of tasks
        productivityScore += Math.min(recentTasksCount * 2, 20);
        
        // Bonus for consistency (simplified)
        productivityScore += Math.min(recentTasksCount, 10);
    }
    
    document.querySelector('.score').textContent = productivityScore;
}

// Add some futuristic effects
function addFuturisticEffects() {
    // Hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('button, .task-item, .note-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-2px)';
            el.style.boxShadow = 'var(--glow)';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.boxShadow = '';
        });
    });
}

// Call this function after DOM is loaded
document.addEventListener('DOMContentLoaded', addFuturisticEffects);