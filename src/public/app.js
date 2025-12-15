// Set today's date as default
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today; // Prevent future dates

    loadWorkouts();
});

// Handle form submission
document.getElementById('workoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const workout = {
        exercise_name: document.getElementById('exercise_name').value.trim(),
        sets: parseInt(document.getElementById('sets').value),
        reps: parseInt(document.getElementById('reps').value),
        weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
        date: document.getElementById('date').value,
        notes: document.getElementById('notes').value.trim()
    };

    try {
        const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Workout added successfully! 💪', 'success');
            document.getElementById('workoutForm').reset();
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').value = today;
            document.getElementById('sets').value = 3;
            document.getElementById('reps').value = 10;
            loadWorkouts();
        } else {
            showToast(data.error || 'Failed to add workout', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to add workout. Please try again.', 'error');
    }
});

// Load and display workouts
async function loadWorkouts() {
    try {
        const response = await fetch('/api/workouts');
        const data = await response.json();
        
        if (response.ok) {
            displayWorkouts(data.workouts);
            updateStats(data.workouts);
        } else {
            console.error('Error loading workouts:', data.error);
        }
    } catch (error) {
        console.error('Error loading workouts:', error);
        showToast('Failed to load workouts', 'error');
    }
}

// Display workouts in the UI
function displayWorkouts(workouts) {
    const container = document.getElementById('workouts');
    
    if (!workouts || workouts.length === 0) {
        container.innerHTML = `
            <div class="no-workouts">
                No workouts logged yet.<br>Start tracking your fitness journey!
            </div>
        `;
        return;
    }

    container.innerHTML = workouts.map(workout => {
        const date = new Date(workout.date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="workout-card">
                <div class="workout-header">
                    <div class="workout-title">
                        <h3>${escapeHtml(workout.exercise_name)}</h3>
                        <div class="workout-date">📅 ${date}</div>
                    </div>
                    <button class="btn-delete" onclick="deleteWorkout(${workout.id})">
                        🗑️ Delete
                    </button>
                </div>
                <div class="workout-details">
                    <span class="detail">
                        <strong>Sets:</strong> ${workout.sets}
                    </span>
                    <span class="detail">
                        <strong>Reps:</strong> ${workout.reps}
                    </span>
                    ${workout.weight ? `
                        <span class="detail">
                            <strong>Weight:</strong> ${workout.weight} lbs
                        </span>
                    ` : ''}
                </div>
                ${workout.notes ? `
                    <div class="workout-notes">
                        📝 ${escapeHtml(workout.notes)}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Update statistics
function updateStats(workouts) {
    const statsDiv = document.getElementById('stats');
    if (!workouts || workouts.length === 0) {
        statsDiv.innerHTML = '';
        return;
    }

    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
    const totalReps = workouts.reduce((sum, w) => sum + (w.sets * w.reps), 0);

    statsDiv.innerHTML = `
        <strong>${totalWorkouts}</strong> workouts • 
        <strong>${totalSets}</strong> sets • 
        <strong>${totalReps}</strong> total reps
    `;
}

// Delete workout
async function deleteWorkout(id) {
    if (!confirm('Are you sure you want to delete this workout?')) {
        return;
    }

    try {
        const response = await fetch(`/api/workouts/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Workout deleted', 'success');
            loadWorkouts();
        } else {
            showToast(data.error || 'Failed to delete workout', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to delete workout', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}