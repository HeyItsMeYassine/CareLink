// Global variables
let patientData = null;
let wilayaCityMap = {};
let citiesData = [];

// Fetch CSV data
async function fetchCSVData() {
    try {
        // Fetch patient data
        const patientResponse = await fetch('../../backend/data/patient.csv');
        const patientCSV = await patientResponse.text();
        
        // Parse patient CSV
        const patientRows = patientCSV.split('\n');
        const patientHeaders = patientRows[0].split(',');
        const patients = patientRows.slice(1).map(row => {
            const values = row.split(',');
            return patientHeaders.reduce((obj, header, index) => {
                obj[header.trim()] = values[index] ? values[index].trim() : '';
                return obj;
            }, {});
        });

        // Fetch cities data
        const citiesResponse = await fetch('../../backend/data/cities.csv');
        const citiesCSV = await citiesResponse.text();
        
        // Parse cities CSV
        const cityRows = citiesCSV.split('\n').slice(1);
        citiesData = cityRows.filter(row => row.trim()).map(row => {
            const [wilaya, city] = row.split(',');
            return {
                wilaya: wilaya.trim(),
                city: city.trim()
            };
        });

        // Organize cities by wilaya
        wilayaCityMap = citiesData.reduce((map, item) => {
            if (!map[item.wilaya]) {
                map[item.wilaya] = [];
            }
            if (!map[item.wilaya].includes(item.city)) {
                map[item.wilaya].push(item.city);
            }
            return map;
        }, {});

        return patients;
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        return [];
    }
}

// Get current patient ID (in a real app, this would come from login session)
function getCurrentPatientId() {
    // For demo, use the first patient ID
    // In production, get from session/localStorage
    return 'ID01'; // Default to first patient
}

// Populate form with patient data
function populateForm(patient) {
    if (!patient) return;
    
    // Update header
    document.getElementById('patientName').textContent = `${patient['First Name']} ${patient['Last Name']}`;
    document.getElementById('patientEmail').textContent = patient.Email;
    
    // Update form fields
    document.getElementById('firstName').value = patient['First Name'] || '';
    document.getElementById('lastName').value = patient['Last Name'] || '';
    document.getElementById('sexe').value = patient['Sexe'] || '';
    document.getElementById('email').value = patient['Email'] || '';
    document.getElementById('phone').value = patient['Phone Number'] || '';
    document.getElementById('wilaya').value = patient['Wilaya'] || '';
    
    // Populate wilaya dropdown
    const wilayaSelect = document.getElementById('wilaya');
    const uniqueWilayas = [...new Set(citiesData.map(item => item.wilaya))];
    
    uniqueWilayas.forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        wilayaSelect.appendChild(option);
    });
    
    // Set wilaya and enable city select
    wilayaSelect.value = patient['Wilaya'] || '';
    updateCityDropdown(patient['Wilaya'], patient['City']);
}

// Update city dropdown based on selected wilaya
function updateCityDropdown(wilaya, selectedCity = '') {
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    if (wilaya && wilayaCityMap[wilaya]) {
        citySelect.disabled = false;
        wilayaCityMap[wilaya].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            if (city === selectedCity) {
                option.selected = true;
            }
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
    }
}

// Save profile data
async function saveProfile(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password && password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Collect form data
    const formData = {
        'First Name': document.getElementById('firstName').value,
        'Last Name': document.getElementById('lastName').value,
        'Sexe': document.getElementById('sexe').value,
        'Email': document.getElementById('email').value,
        'Phone Number': document.getElementById('phone').value,
        'Wilaya': document.getElementById('wilaya').value,
        'City': document.getElementById('city').value
    };
    
    // Update password only if provided
    if (password) {
        formData['Password'] = password;
    }
    
    // Update patient data
    patientData = { ...patientData, ...formData };
    
    // In a real app, you would send this to the server
    // For now, save to localStorage
    localStorage.setItem('currentPatient', JSON.stringify(patientData));
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Update header
    document.getElementById('patientName').textContent = `${formData['First Name']} ${formData['Last Name']}`;
    document.getElementById('patientEmail').textContent = formData['Email'];
    
    // Clear password fields
    document.getElementById('password').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Initialize the page
async function initialize() {
    try {
        // Add loading state
        document.body.classList.add('loading');
        
        // Fetch CSV data
        const patients = await fetchCSVData();
        
        // Get current patient ID
        const patientId = getCurrentPatientId();
        
        // Find current patient
        patientData = patients.find(p => p.ID === patientId);
        
        if (patientData) {
            populateForm(patientData);
        } else {
            console.error('Patient not found');
            // Set default values or show error
        }
        
        // Remove loading state
        document.body.classList.remove('loading');
    } catch (error) {
        console.error('Error initializing page:', error);
        document.body.classList.remove('loading');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page
    initialize();
    
    // Wilaya change event
    document.getElementById('wilaya').addEventListener('change', function() {
        updateCityDropdown(this.value);
    });
    
    // Form submit event
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    // Back button
    document.querySelector('.back-btn').addEventListener('click', () => {
        window.location.href = 'patientdashboard.html';
    });
    
    // Cancel button
    document.querySelector('.btn-secondary').addEventListener('click', () => {
        window.location.href = 'patientdashboard.html';
    });
});