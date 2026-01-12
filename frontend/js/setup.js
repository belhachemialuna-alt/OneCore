let currentStep = 1;
let setupData = {network: {}, system: {}, zones: []};
let cropsData = [], soilTypesData = [], wilayasData = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    populateSelects();
    selectZones(1);
    setupDayButtons();
});

// Setup day button event listeners for existing checkboxes
function setupDayButtons() {
    const dayButtons = document.querySelectorAll('.day-btn input[type="checkbox"]');
    dayButtons.forEach(checkbox => {
        // Set initial state
        updateDayButtonStyle(checkbox);
        
        // Add change listener
        checkbox.addEventListener('change', function() {
            updateDayButtonStyle(this);
        });
    });
}

// Update day button visual style based on checked state
function updateDayButtonStyle(checkbox) {
    const span = checkbox.nextElementSibling;
    if (!span) return;
    
    if (checkbox.checked) {
        span.style.background = '#000000';
        span.style.color = '#FFFFFF';
        span.style.borderColor = '#000000';
    } else {
        span.style.background = '#FFFFFF';
        span.style.color = '#000000';
        span.style.borderColor = '#CCCCCC';
    }
}

async function loadData() {
    try {
        const res = await fetch('/api/setup/data');
        const data = await res.json();
        cropsData = data.crops || [];
        soilTypesData = data.soil_types || [];
        wilayasData = data.wilayas || [];
    } catch (e) {
        console.error('Load error:', e);
    }
}

function populateSelects() {
    const wilayaSelect = document.getElementById('wilaya-select');
    wilayasData.forEach(w => {
        wilayaSelect.innerHTML += `<option value="${w.id}">${w.name}</option>`;
    });
}

function nextStep() {
    if (currentStep === 5) return;
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.querySelectorAll('.progress-step').forEach(s => s.classList.remove('active'));
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
}

function prevStep() {
    if (currentStep === 1) return;
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.querySelectorAll('.progress-step').forEach(s => s.classList.remove('active'));
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
}

function selectNetworkMode(mode) {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
    event.target.closest('.option-card').classList.add('active');
    document.getElementById('wifi-config').style.display = mode === 'wifi' ? 'block' : 'none';
    document.getElementById('hotspot-config').style.display = mode === 'hotspot' ? 'block' : 'none';
}

function selectZones(num) {
    document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const container = document.getElementById('zones-config');
    container.innerHTML = '';
    
    for (let i = 1; i <= num; i++) {
        container.innerHTML += `
            <div class="zone-card">
                <h3><i class="fa-solid fa-layer-group"></i> Zone ${i}</h3>
                <div class="form-group">
                    <label>Crop Type</label>
                    <select id="zone-${i}-crop">
                        ${cropsData.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Soil Type</label>
                    <select id="zone-${i}-soil">
                        ${soilTypesData.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    }
}

let scheduleCount = 1;

function addSchedule() {
    scheduleCount++;
    const container = document.getElementById('schedules-container');
    const scheduleCard = document.createElement('div');
    scheduleCard.className = 'schedule-setup-card';
    scheduleCard.innerHTML = `
        <h3><i class="fa-solid fa-clock"></i> Schedule ${scheduleCount}</h3>
        <div class="form-group">
            <label>
                <i class="fa-solid fa-tag"></i>
                Schedule Name
            </label>
            <input type="text" id="schedule-${scheduleCount}-name" placeholder="e.g., Evening Irrigation" value="Schedule ${scheduleCount}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>
                    <i class="fa-solid fa-clock"></i>
                    Start Time
                </label>
                <input type="time" id="schedule-${scheduleCount}-time" value="18:00">
            </div>
            <div class="form-group">
                <label>
                    <i class="fa-solid fa-hourglass"></i>
                    Duration (minutes)
                </label>
                <input type="number" id="schedule-${scheduleCount}-duration" value="15" min="1" max="120">
            </div>
        </div>
        <div class="form-group">
            <label>Days of Week</label>
            <div class="days-selector">
                <div class="day-label">Su</div>
                <div class="day-label">Mo</div>
                <div class="day-label">Tu</div>
                <div class="day-label">We</div>
                <div class="day-label">Th</div>
                <div class="day-label">Fr</div>
                <div class="day-label">Sa</div>
                <label class="day-btn">
                    <input type="checkbox" value="Sunday" name="schedule-${scheduleCount}-days">
                    <span>Sun</span>
                </label>
                <label class="day-btn">
                    <input type="checkbox" value="Monday" checked name="schedule-${scheduleCount}-days">
                    <span>Mon</span>
                </label>
                <label class="day-btn">
                    <input type="checkbox" value="Tuesday" checked name="schedule-${scheduleCount}-days">
                    <span>Tue</span>
                </label>
                <label class="day-btn">
                    <input type="checkbox" value="Wednesday" checked name="schedule-${scheduleCount}-days">
                    <span>Wed</span>
                </label>
                <label class="day-btn">
                    <input type="checkbox" value="Thursday" checked name="schedule-${scheduleCount}-days">
                    <span>Thu</span>
                </label>
                <label class="day-btn">
                    <input type="checkbox" value="Friday" checked name="schedule-${scheduleCount}-days">
                    <span>Fri</span>
                </label>
                <label class="day-btn">
                    <input type="checkbox" value="Saturday" name="schedule-${scheduleCount}-days">
                    <span>Sat</span>
                </label>
            </div>
        </div>
    `;
    container.appendChild(scheduleCard);
    
    // Add event listeners to day buttons to ensure visual feedback
    const dayButtons = scheduleCard.querySelectorAll('.day-btn input[type="checkbox"]');
    dayButtons.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Force a re-render by toggling a class
            const span = this.nextElementSibling;
            if (this.checked) {
                span.style.background = '#000000';
                span.style.color = '#FFFFFF';
                span.style.borderColor = '#000000';
            } else {
                span.style.background = '#FFFFFF';
                span.style.color = '#000000';
                span.style.borderColor = '#CCCCCC';
            }
        });
    });
}

async function completeSetup() {
    const config = {
        device_name: 'BAYYTI-B1',
        setup_completed: true,
        wilaya: document.getElementById('wilaya-select').value,
        timezone: document.getElementById('timezone-select').value,
        zones: [],
        schedules: []
    };
    
    const numZones = document.querySelectorAll('.zone-card').length;
    for (let i = 1; i <= numZones; i++) {
        config.zones.push({
            id: i,
            name: `Zone ${i}`,
            crop_id: parseInt(document.getElementById(`zone-${i}-crop`).value),
            soil_id: parseInt(document.getElementById(`zone-${i}-soil`).value),
            auto_mode: false
        });
    }
    
    // Collect schedules
    for (let i = 1; i <= scheduleCount; i++) {
        const nameInput = document.getElementById(`schedule-${i}-name`);
        const timeInput = document.getElementById(`schedule-${i}-time`);
        const durationInput = document.getElementById(`schedule-${i}-duration`);
        
        if (nameInput && timeInput && durationInput) {
            const daysCheckboxes = document.querySelectorAll(`.schedule-setup-card:nth-child(${i}) .day-btn input:checked`);
            const days = Array.from(daysCheckboxes).map(cb => cb.value).join(',');
            
            config.schedules.push({
                name: nameInput.value,
                start_time: timeInput.value,
                duration: parseInt(durationInput.value) * 60,
                days_of_week: days,
                enabled: true
            });
        }
    }
    
    try {
        // Save main configuration to backend (persists after reboot)
        const setupResponse = await fetch('/api/setup/complete', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(config)
        });
        
        if (setupResponse.ok) {
            console.log('Configuration saved to backend successfully');
        }
        
        // Save each schedule to database (persists after reboot)
        for (const schedule of config.schedules) {
            try {
                await fetch('/api/schedules', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: schedule.name,
                        start_time: schedule.start_time,
                        duration: schedule.duration,
                        days_of_week: schedule.days_of_week,
                        soil_threshold: 30,
                        enabled: schedule.enabled
                    })
                });
            } catch (e) {
                console.error('Error saving schedule:', e);
            }
        }
        
        console.log('All configurations saved to backend - will persist after reboot');
    } catch (e) {
        console.error('Error saving to backend:', e);
        console.log('Falling back to local storage only');
    }
    
    // Also save to localStorage as backup
    localStorage.setItem('bayyti_setup_complete', 'true');
    localStorage.setItem('bayyti_config', JSON.stringify(config));
    
    document.getElementById('step-5').style.display = 'none';
    document.getElementById('step-complete').style.display = 'block';
}

function goToDashboard() {
    window.location.href = 'index.html';
}
