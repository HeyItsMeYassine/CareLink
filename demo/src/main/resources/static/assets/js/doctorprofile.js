// Global variables
let doctorData = null;
let wilayaCityMap = {};
let citiesData = [];
let specialitiesData = [];

// Fetch CSV data
async function fetchCSVData() {
    try {
        // Fetch doctor data
        const doctorResponse = await fetch('../../backend/data/doctor.csv');
        const doctorCSV = await doctorResponse.text();
        
        // Parse doctor CSV
        const doctorRows = doctorCSV.split('\n');
        const doctorHeaders = doctorRows[0].split(',');
        const doctors = doctorRows.slice(1).filter(row => row.trim()).map(row => {
            const values = row.split(',');
            return doctorHeaders.reduce((obj, header, index) => {
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

        // Fetch specialities data
        const specialitiesResponse = await fetch('../../backend/data/specialities.csv');
        const specialitiesCSV = await specialitiesResponse.text();
        
        // Parse specialities CSV
        const specialityRows = specialitiesCSV.split('\n').slice(1);
        specialitiesData = specialityRows.filter(row => row.trim()).map(row => {
            const [id, name] = row.split(',');
            return {
                id: id.trim(),
                name: name.trim()
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

        return doctors;
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        return [];
    }
}

// Get current doctor ID (in a real app, this would come from login session)
function getCurrentDoctorId() {
    // For demo, use the first doctor ID
    // In production, get from session/localStorage
    return 'ID001'; // Default to first doctor
}

// Populate form with doctor data
function populateForm(doctor) {
    if (!doctor) return;
    
    // Update header
    document.getElementById('doctorName').textContent = `Dr. ${doctor['First_Name']} ${doctor['Last_Name']}`;
    document.getElementById('doctorSpeciality').textContent = doctor['Speciality'];
    
    // Update form fields
    document.getElementById('firstName').value = doctor['First_Name'] || '';
    document.getElementById('lastName').value = doctor['Last_Name'] || '';
    document.getElementById('sexe').value = doctor['Sexe'] || '';
    document.getElementById('email').value = doctor['Email'] || '';
    document.getElementById('phone').value = doctor['Phone Number'] || '';
    document.getElementById('wilaya').value = doctor['Wilaya'] || '';
    document.getElementById('locationLink').value = doctor['Location_Link'] || '';
    
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
    wilayaSelect.value = doctor['Wilaya'] || '';
    updateCityDropdown(doctor['Wilaya'], doctor['City']);
    
    // Populate specialities dropdown
    const specialitySelect = document.getElementById('speciality');
    specialitiesData.forEach(speciality => {
        const option = document.createElement('option');
        option.value = speciality.name;
        option.textContent = speciality.name;
        specialitySelect.appendChild(option);
    });
    
    // Set speciality
    specialitySelect.value = doctor['Speciality'] || '';
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
        'First_Name': document.getElementById('firstName').value,
        'Last_Name': document.getElementById('lastName').value,
        'Sexe': document.getElementById('sexe').value,
        'Email': document.getElementById('email').value,
        'Phone Number': document.getElementById('phone').value,
        'Wilaya': document.getElementById('wilaya').value,
        'City': document.getElementById('city').value,
        'Speciality': document.getElementById('speciality').value,
        'Location_Link': document.getElementById('locationLink').value
    };
    
    // Update password only if provided
    if (password) {
        formData['Password'] = password;
    }
    
    // Update doctor data
    doctorData = { ...doctorData, ...formData };
    
    // In a real app, you would send this to the server
    // For now, save to localStorage
    localStorage.setItem('currentDoctor', JSON.stringify(doctorData));
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Update header
    document.getElementById('doctorName').textContent = `Dr. ${formData['First_Name']} ${formData['Last_Name']}`;
    document.getElementById('doctorSpeciality').textContent = formData['Speciality'];
    
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
        const doctors = await fetchCSVData();
        
        // Get current doctor ID
        const doctorId = getCurrentDoctorId();
        
        // Find current doctor
        doctorData = doctors.find(d => d.ID === doctorId);
        
        if (doctorData) {
            populateForm(doctorData);
        } else {
            console.error('Doctor not found');
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
        window.location.href = 'doctordashboard.html';
    });
    
    // Cancel button
    document.querySelector('.btn-secondary').addEventListener('click', () => {
        window.location.href = 'doctordashboard.html';
    });
});