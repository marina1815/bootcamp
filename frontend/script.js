// ================================
// MyPrescription - Authentication Logic
// ================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const roleButtons = document.querySelectorAll('.role-btn');
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const authForms = document.querySelectorAll('.auth-form');
  const submitButtons = document.querySelectorAll('.submit-btn');

  // State
  let currentRole = 'DOCTOR'; // 'doctor' or 'patient'
  let currentMode = 'login';  // 'login' or 'signup'

  // ================================
  // Role Switching (Doctor/Patient)
  // ================================
  roleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const role = button.dataset.role;
      
      // Update active state
      roleButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentRole = role;
      
      updateActiveForm();
    });
  });

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      
      toggleButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentMode = mode;
      
      updateActiveForm();
    });
  });
  function updateActiveForm() {
    // Hide all forms
    authForms.forEach(form => form.classList.remove('active'));
    
    const formId = `${currentRole}-${currentMode}`;
    const activeForm = document.getElementById(formId);
    
    if (activeForm) {
      activeForm.classList.add('active');
    }
  }

  document.getElementById('doctor-login').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      role: 'DOCTOR',
      type: 'login',
      email: document.getElementById('doctor-login-email').value,
      password: document.getElementById('doctor-login-password').value
    };
    
    handleFormSubmit(formData);
  });

  document.getElementById('doctor-signup').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      role: 'DOCTOR',
      type: 'signup',
      first_name: document.getElementById('doctor-firstname').value,
      last_name: document.getElementById('doctor-lastname').value,
      email: document.getElementById('doctor-email').value,
      phone: document.getElementById('doctor-phone').value,
      license_number: document.getElementById('doctor-license').value,
      clinic_address: document.getElementById('doctor-address').value,
      speciality: document.getElementById('doctor-specialty').value,
      password: document.getElementById('doctor-password').value
    };
    
    if (validateDoctorSignup(formData)) {
      handleFormSubmit(formData);
    }
  });

  document.getElementById('patient-login').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      role: 'PATIENT',
      type: 'login',
      email: document.getElementById('patient-login-email').value,
      password: document.getElementById('patient-login-password').value
    };
    
    handleFormSubmit(formData);
  });

  document.getElementById('patient-signup').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const genderElement = document.querySelector('input[name="gender"]:checked');
    
    const formData = {
      role: 'PATIENT',
      type: 'signup',
      first_name: document.getElementById('patient-firstname').value,
      last_name: document.getElementById('patient-lastname').value,
      email: document.getElementById('patient-email').value,
      phone: document.getElementById('patient-phone').value,
      gender: genderElement ? genderElement.value : '',
      age: document.getElementById('patient-age').value,
      password: document.getElementById('patient-password').value
    };
    
    if (validatePatientSignup(formData)) {
      handleFormSubmit(formData);
    }
  });

  
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  function validateDoctorSignup(data) {
    if (!data.first_name || !data.last_name) {
      alert('⚠️ Veuillez renseigner votre nom et prénom');
      return false;
    }

    if (!validateEmail(data.email)) {
      alert('⚠️ Email invalide');
      return false;
    }

    if (!validatePhone(data.phone)) {
      alert('⚠️ Numéro de téléphone invalide');
      return false;
    }

    if (!data.license_number || data.license_number.length < 3) {
      alert('⚠️ Numéro de licence invalide');
      return false;
    }

    if (!data.clinic_address || data.clinic_address.length < 5) {
      alert('⚠️ Adresse du cabinet requise');
      return false;
    }

    if (!data.speciality) {
      alert('⚠️ Veuillez sélectionner votre spécialité');
      return false;
    }

    if (data.password.length < 8) {
      alert('⚠️ Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    return true;
  }

  function validatePatientSignup(data) {
    if (!data.first_name || !data.last_name) {
      alert('⚠️ Veuillez renseigner votre nom et prénom');
      return false;
    }

    if (!validateEmail(data.email)) {
      alert('⚠️ Email invalide');
      return false;
    }

    if (!validatePhone(data.phone)) {
      alert('⚠️ Numéro de téléphone invalide');
      return false;
    }

    if (!data.gender) {
      alert('⚠️ Veuillez sélectionner votre sexe');
      return false;
    }

    const age = parseInt(data.age);
    if (isNaN(age) || age < 1 || age > 120) {
      alert('⚠️ Âge invalide');
      return false;
    }

    if (data.password.length < 8) {
      alert('⚠️ Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    return true;
  }

  
 async function handleFormSubmit(data) {
  console.log(" Sending data to API:", data);

  const API_BASE = "http://localhost:3000";
  const isLogin = data.type === "login";
  const endpoint = isLogin ? "/auth/login" : "/auth/register";

  try {
    let payload;

    if (isLogin) {
      payload = {
        email: data.email,
        password: data.password,
      };
    } else {
      payload = { ...data };
      delete payload.type;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || result.error || "Une erreur est survenue");
    }

    console.log(" Success:", result);

    //  Login success: store token + user
    if (isLogin && result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      window.location.href = "dashboard.html";

      return;
    }

   
  } catch (error) {
    console.error(" Error:", error);
    alert(` Erreur: ${error.message}`);
  }
}


  function setupPasswordStrength(inputId, prefix) {
    const passwordInput = document.getElementById(inputId);
    const strengthFill = document.getElementById(`${prefix}-strength-fill`);
    const strengthText = document.getElementById(`${prefix}-strength-text`);
    const reqLength = document.getElementById(`${prefix}-req-length`);
    const reqUppercase = document.getElementById(`${prefix}-req-uppercase`);
    const reqLowercase = document.getElementById(`${prefix}-req-lowercase`);
    const reqNumber = document.getElementById(`${prefix}-req-number`);
    const reqSpecial = document.getElementById(`${prefix}-req-special`);
    
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      
      
      const hasLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      
      
      updateRequirement(reqLength, hasLength);
      updateRequirement(reqUppercase, hasUppercase);
      updateRequirement(reqLowercase, hasLowercase);
      updateRequirement(reqNumber, hasNumber);
      updateRequirement(reqSpecial, hasSpecial);
      
      
      let score = 0;
      if (hasLength) score++;
      if (hasUppercase) score++;
      if (hasLowercase) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;
      
      strengthFill.className = 'strength-fill';
      strengthText.className = 'strength-text';
      
      if (password.length === 0) {
        strengthText.textContent = 'Entrez un mot de passe';
      } else if (score <= 2) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Faible';
      } else if (score <= 4) {
        strengthFill.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Moyen';
      } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Fort';
      }
    });
  }
  
  function updateRequirement(element, isValid) {
    if (isValid) {
      element.classList.add('valid');
    } else {
      element.classList.remove('valid');
    }
  }
  
  setupPasswordStrength('doctor-password', 'doctor');
  setupPasswordStrength('patient-password', 'patient');

  
  // Initialize
  updateActiveForm();
});
