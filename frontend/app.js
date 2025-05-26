// API Configuration
const API_URL = 'http://localhost:8000';

// DOM Elements
const appointmentForm = document.getElementById('appointmentForm');
const appointmentsList = document.getElementById('appointmentsList');
const notification = document.getElementById('notification');

// Utility Functions
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function formatDateTime(date, time) {
    return new Date(`${date}T${time}`).toLocaleString();
}

// Load Doctors and Patients
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/users/?is_doctor=true`);
        const doctors = await response.json();
        const doctorSelect = document.getElementById('doctor');
        
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = doctor.name;
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading doctors:', error);
        showNotification('Failed to load doctors', 'error');
    }
}

async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/users/?is_doctor=false`);
        const patients = await response.json();
        const patientSelect = document.getElementById('patient');
        
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            patientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patients:', error);
        showNotification('Failed to load patients', 'error');
    }
}

// Load Appointments
async function loadAppointments() {
    try {
        const response = await fetch(`${API_URL}/appointments/`);
        const appointments = await response.json();
        
        appointmentsList.innerHTML = '';
        
        appointments.forEach(appointment => {
            const appointmentCard = document.createElement('div');
            appointmentCard.className = 'appointment-card';
            
            appointmentCard.innerHTML = `
                <div class="appointment-info">
                    <h3>${formatDateTime(appointment.date, appointment.time)}</h3>
                    <p>Doctor: ${appointment.doctor.name}</p>
                    <p>Patient: ${appointment.patient.name}</p>
                    <span class="status-badge status-${appointment.status.toLowerCase()}">
                        ${appointment.status}
                    </span>
                    ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
                </div>
                <div class="appointment-actions">
                    <button class="btn-edit" onclick="editAppointment(${appointment.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteAppointment(${appointment.id})">Delete</button>
                </div>
            `;
            
            appointmentsList.appendChild(appointmentCard);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Failed to load appointments', 'error');
    }
}

// Create Appointment
async function createAppointment(event) {
    event.preventDefault();
    
    const formData = {
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        doctor_id: document.getElementById('doctor').value,
        patient_id: document.getElementById('patient').value,
        notes: document.getElementById('notes').value,
        status: 'scheduled'
    };
    
    try {
        const response = await fetch(`${API_URL}/appointments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Appointment scheduled successfully');
            appointmentForm.reset();
            loadAppointments();
        } else {
            throw new Error('Failed to create appointment');
        }
    } catch (error) {
        console.error('Error creating appointment:', error);
        showNotification('Failed to schedule appointment', 'error');
    }
}

// Delete Appointment
async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Appointment deleted successfully');
            loadAppointments();
        } else {
            throw new Error('Failed to delete appointment');
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showNotification('Failed to delete appointment', 'error');
    }
}

// Edit Appointment
async function editAppointment(id) {
    try {
        const response = await fetch(`${API_URL}/appointments/${id}`);
        const appointment = await response.json();
        
        // Populate form with appointment data
        document.getElementById('date').value = appointment.date;
        document.getElementById('time').value = appointment.time;
        document.getElementById('doctor').value = appointment.doctor_id;
        document.getElementById('patient').value = appointment.patient_id;
        document.getElementById('notes').value = appointment.notes || '';
        
        // Scroll to form
        document.querySelector('.appointment-form').scrollIntoView({ behavior: 'smooth' });
        
        // Update form submission handler
        appointmentForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = {
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                doctor_id: document.getElementById('doctor').value,
                patient_id: document.getElementById('patient').value,
                notes: document.getElementById('notes').value,
                status: appointment.status
            };
            
            try {
                const updateResponse = await fetch(`${API_URL}/appointments/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                if (updateResponse.ok) {
                    showNotification('Appointment updated successfully');
                    appointmentForm.reset();
                    appointmentForm.onsubmit = createAppointment;
                    loadAppointments();
                } else {
                    throw new Error('Failed to update appointment');
                }
            } catch (error) {
                console.error('Error updating appointment:', error);
                showNotification('Failed to update appointment', 'error');
            }
        };
    } catch (error) {
        console.error('Error loading appointment details:', error);
        showNotification('Failed to load appointment details', 'error');
    }
}

// Event Listeners
appointmentForm.addEventListener('submit', createAppointment);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDoctors();
    loadPatients();
    loadAppointments();
}); 