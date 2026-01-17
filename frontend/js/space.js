// Space Dashboard - Additional functionality
// This extends the main dashboard.js functionality

const API_BASE = window.location.origin + '/api';

// Real-time datetime update for tasks calendar
function updateTasksCalendarDateTime() {
    const now = new Date();
    const timeEl = document.getElementById('tasks-current-time');
    const dateEl = document.getElementById('tasks-current-date');
    
    if (timeEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    if (dateEl) {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekday = weekdays[now.getDay()];
        const month = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        dateEl.textContent = `${weekday}, ${month} ${day}, ${year}`;
    }
}

// Auto-refresh countdown
let refreshCountdown = 30;
function updateRefreshCountdown() {
    const countdownEl = document.getElementById('refresh-countdown');
    if (countdownEl) {
        countdownEl.textContent = `${refreshCountdown}s`;
        refreshCountdown--;
        
        if (refreshCountdown < 0) {
            refreshCountdown = 30;
            // Add spinning animation to refresh button
            const refreshBtn = document.getElementById('update-schedule-btn');
            if (refreshBtn) {
                refreshBtn.classList.add('refreshing');
            }
            loadIrrigationTasks(); // Refresh tasks
            // Remove spinning animation after 1 second
            setTimeout(() => {
                if (refreshBtn) {
                    refreshBtn.classList.remove('refreshing');
                }
            }, 1000);
        }
    }
}

// Real-time irrigation data updates for space sidebar
async function updateIrrigationSidebarSpace() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success && data.irrigation) {
            const irrigation = data.irrigation;
            
            // Update irrigation minutes
            const minutesEl = document.getElementById('irrigation-minutes-space');
            const progressCircle = document.getElementById('irrigation-progress-circle-space');
            
            const minutes = irrigation.total_minutes_today || 0;
            if (minutesEl) minutesEl.textContent = minutes;
            
            // Update circular progress (max 60 minutes)
            if (progressCircle) {
                const maxMinutes = 60;
                const percentage = Math.min((minutes / maxMinutes) * 100, 100);
                const circumference = 534;
                const offset = circumference - (percentage / 100) * circumference;
                progressCircle.style.strokeDashoffset = offset;
            }
            
            // Update valve opens
            const valveEl = document.getElementById('valve-open-count-space');
            if (valveEl) valveEl.textContent = irrigation.valve_open_count || 0;
            
            // Update avg duration
            const avgDurationEl = document.getElementById('avg-duration-space');
            if (avgDurationEl) {
                const avgMin = Math.round((irrigation.avg_duration || 0) / 60);
                avgDurationEl.textContent = `${avgMin} min`;
            }
            
            // Update water used
            const waterUsedEl = document.getElementById('water-used-today-space');
            if (waterUsedEl) {
                const waterUsed = Math.round(irrigation.water_used_today || 0);
                waterUsedEl.textContent = `${waterUsed} L`;
            }
            
            // Update status
            const statusEl = document.getElementById('irrigation-status-space');
            if (statusEl) {
                const indicator = statusEl.querySelector('.status-indicator-space');
                const statusText = statusEl.querySelector('span');
                
                if (irrigation.valve_state === 'open') {
                    indicator.className = 'status-indicator-space status-active';
                    statusText.textContent = 'Active';
                } else if (irrigation.valve_state === 'error') {
                    indicator.className = 'status-indicator-space status-warning';
                    statusText.textContent = 'Warning';
                } else {
                    indicator.className = 'status-indicator-space status-idle';
                    statusText.textContent = 'Idle';
                }
            }
        }
    } catch (error) {
        console.error('Error updating irrigation sidebar:', error);
    }
}

// Initialize real-time updates
setInterval(updateTasksCalendarDateTime, 1000); // Update every second
setInterval(updateRefreshCountdown, 1000); // Update countdown every second
setInterval(updateIrrigationSidebarSpace, 2000); // Update irrigation sidebar every 2 seconds
setTimeout(updateTasksCalendarDateTime, 100); // Initial update
setTimeout(updateIrrigationSidebarSpace, 500); // Initial irrigation sidebar update

// Toggle Irrigation Tasks Sidebar
function setupTasksSidebar() {
    const toggleCard = document.getElementById('tasks-toggle-card');
    const sidebar = document.getElementById('irrigation-tasks-sidebar');
    const closeBtn = document.getElementById('tasks-close-btn');
    
    if (toggleCard) {
        toggleCard.addEventListener('click', () => {
            sidebar.classList.add('active');
            loadIrrigationTasks();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // Close on overlay click
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !toggleCard.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
}

// Load Irrigation Tasks from API
async function loadIrrigationTasks() {
    const tableBody = document.getElementById('tasks-table-body');
    
    try {
        const response = await fetch(`${API_BASE}/irrigation/tasks`);
        const data = await response.json();
        
        if (data.success && data.tasks && data.tasks.length > 0) {
            // Update tasks count
            const tasksCount = document.getElementById('tasks-count');
            if (tasksCount) {
                tasksCount.textContent = data.tasks.length;
            }
            
            // Render tasks table with calendar style
            tableBody.innerHTML = data.tasks.map(task => {
                const date = new Date(task.start_day);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = formatDate(task.start_day);
                
                return `
                <tr>
                    <td class="task-date-cell">
                        <span class="task-day-indicator">${dayName}</span>
                        ${dateStr}
                    </td>
                    <td class="task-time-cell">${task.start_time}</td>
                    <td class="task-duration-cell">${task.duration || '30 min'}</td>
                    <td class="task-volume-cell">${task.volume || '447 l'}</td>
                    <td>
                        <div class="task-progress-bar">
                            <div class="task-progress-fill ${task.progress === 100 ? 'complete' : ''}" 
                                 style="width: ${task.progress || 0}%"></div>
                        </div>
                        <div class="task-progress-text">${task.progress || 0}%</div>
                    </td>
                </tr>
            `}).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
                        <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                        No irrigation tasks scheduled
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading irrigation tasks:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #f44336;">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    Failed to load tasks
                </td>
            </tr>
        `;
    }
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
}

// Schedule Modal Functionality
function setupScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    const addBtn = document.getElementById('add-schedule-btn');
    const updateBtn = document.getElementById('update-schedule-btn');
    const closeBtn = document.getElementById('schedule-modal-close');
    const overlay = document.getElementById('schedule-modal-overlay');
    const cancelBtn = document.getElementById('schedule-cancel-btn');
    const saveBtn = document.getElementById('schedule-save-btn');
    const dayButtons = document.querySelectorAll('.day-btn');
    
    console.log('Schedule Modal Setup:', {
        modal: modal ? 'Found' : 'NOT FOUND',
        addBtn: addBtn ? 'Found' : 'NOT FOUND',
        updateBtn: updateBtn ? 'Found' : 'NOT FOUND',
        dayButtons: dayButtons.length
    });
    
    let selectedDays = [];
    
    // Open modal
    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            console.log('Add button clicked!');
            e.stopPropagation();
            if (modal) {
                modal.classList.add('active');
                console.log('Modal should be visible now');
            }
            selectedDays = [];
            resetForm();
        });
    } else {
        console.error('Add schedule button not found!');
    }
    
    // Update schedules (refresh)
    if (updateBtn) {
        updateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadIrrigationTasks();
        });
    }
    
    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // Day selection
    dayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const day = btn.dataset.day;
            
            if (selectedDays.includes(day)) {
                selectedDays = selectedDays.filter(d => d !== day);
            } else {
                selectedDays.push(day);
            }
        });
    });
    
    // Save schedule
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const name = document.getElementById('schedule-name').value;
            const startTime = document.getElementById('schedule-start-time').value;
            const duration = document.getElementById('schedule-duration').value;
            const threshold = document.getElementById('schedule-threshold').value;
            
            if (!name || !startTime || !duration) {
                alert('Please fill in all required fields');
                return;
            }
            
            if (selectedDays.length === 0) {
                alert('Please select at least one day');
                return;
            }
            
            const scheduleData = {
                name: name,
                start_time: startTime,
                duration: parseInt(duration),
                days_of_week: selectedDays.join(','),
                soil_threshold: parseInt(threshold) || 30
            };
            
            try {
                const response = await fetch(`${API_BASE}/schedules`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(scheduleData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Schedule created successfully!');
                    closeModal();
                    loadIrrigationTasks();
                } else {
                    alert('Failed to create schedule: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating schedule:', error);
                alert('Failed to create schedule');
            }
        });
    }
    
    function resetForm() {
        document.getElementById('schedule-name').value = '';
        document.getElementById('schedule-start-time').value = '';
        document.getElementById('schedule-duration').value = '';
        document.getElementById('schedule-threshold').value = '30';
        dayButtons.forEach(btn => btn.classList.remove('active'));
    }
}

// Initialize tasks sidebar
setTimeout(() => {
    setupTasksSidebar();
    setupScheduleModal();
    loadIrrigationTasks(); // Load initial count
}, 500);

// Sync quick stats with main irrigation sidebar data
function updateQuickStats() {
    // Irrigation minutes
    const irrigationMinutes = document.getElementById('irrigation-minutes');
    const irrigationMinutesQuick = document.getElementById('irrigation-minutes-quick');
    if (irrigationMinutes && irrigationMinutesQuick) {
        irrigationMinutesQuick.textContent = irrigationMinutes.textContent;
    }
    
    // Valve opens
    const valveOpenCount = document.getElementById('valve-open-count');
    const valveOpenCountQuick = document.getElementById('valve-open-count-quick');
    if (valveOpenCount && valveOpenCountQuick) {
        valveOpenCountQuick.textContent = valveOpenCount.textContent;
    }
    
    // Water used
    const waterUsedToday = document.getElementById('water-used-today');
    const waterUsedTodayQuick = document.getElementById('water-used-today-quick');
    if (waterUsedToday && waterUsedTodayQuick) {
        waterUsedTodayQuick.textContent = waterUsedToday.textContent.replace(' L', '');
    }
    
    // Avg duration
    const avgDuration = document.getElementById('avg-duration');
    const avgDurationQuick = document.getElementById('avg-duration-quick');
    if (avgDuration && avgDurationQuick) {
        avgDurationQuick.textContent = avgDuration.textContent.replace(' min', '');
    }
    
    // Irrigation status
    const irrigationStatus = document.getElementById('irrigation-status');
    const irrigationStatusInline = document.getElementById('irrigation-status-inline');
    if (irrigationStatus && irrigationStatusInline) {
        const statusIndicator = irrigationStatus.querySelector('.status-indicator');
        const statusText = irrigationStatus.querySelector('span');
        
        if (statusIndicator && statusText) {
            const inlineIndicator = irrigationStatusInline.querySelector('.status-indicator');
            const inlineText = irrigationStatusInline.querySelector('span');
            
            if (inlineIndicator && inlineText) {
                inlineIndicator.className = statusIndicator.className;
                inlineText.textContent = statusText.textContent;
            }
        }
    }
}

// Update quick stats every 2 seconds
setInterval(updateQuickStats, 2000);

// Initial update
setTimeout(updateQuickStats, 1000);

// Add smooth scroll behavior for space dashboard
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
setTimeout(() => {
    document.querySelectorAll('.sensor-card, .control-card, .chart-card, .status-card, .stat-card, .quick-stat-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}, 100);

console.log('Space Dashboard initialized');
