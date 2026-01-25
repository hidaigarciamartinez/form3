// ================== ELEMENTOS DEL DOM ==================
const form = document.getElementById('multi-step-form');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const progress = document.getElementById('progress');
const prevButtons = document.querySelectorAll('.btn-prev');
const nextButtons = document.querySelectorAll('.btn-next');
const formSummary = document.getElementById('form-summary');
const submitButton = document.querySelector('.btn-submit');
const successSection = document.querySelector('.form-success');

// ================== DATOS DEL FORMULARIO ==================
const formData = {
    personal: {},
    contact: {},
    professional: {}
};

let currentStep = 0;

// ================== INICIALIZACIÓN ==================
initForm();

nextButtons.forEach(btn => btn.addEventListener('click', nextStep));
prevButtons.forEach(btn => btn.addEventListener('click', prevStep));
form.addEventListener('submit', handleSubmit);

document.querySelectorAll('input[required], select[required]')
    .forEach(input => input.addEventListener('blur', validateField));

document.getElementById('email')?.addEventListener('input', function () {
    if (this.value.trim()) validateEmailField(this);
});

document.getElementById('phone')?.addEventListener('input', function () {
    if (this.value.trim()) validatePhoneField(this);
});

// ================== FUNCIONES ==================
function initForm() {
    showStep(currentStep);
    updateProgressBar();
    loadFormData();
}

function showStep(step) {
    progressSteps.forEach((p, i) => {
        i === step
            ? p.setAttribute('aria-current', 'step')
            : p.removeAttribute('aria-current');
    });

    formSteps.forEach((s, i) => s.classList.toggle('active', i === step));

    if (step === formSteps.length - 1) updateFormSummary();
}

function nextStep() {
    if (!validateStep(currentStep)) return;
    saveStepData(currentStep);
    currentStep++;
    showStep(currentStep);
    updateProgressBar();
}

function prevStep() {
    saveStepData(currentStep);
    currentStep--;
    showStep(currentStep);
    updateProgressBar();
}

function updateProgressBar() {
    progressSteps.forEach((p, i) =>
        p.classList.toggle('active', i <= currentStep)
    );
    progress.style.width = `${(currentStep / (progressSteps.length - 1)) * 100}%`;
}

function validateStep(step) {
    let isValid = true;
    const inputs = formSteps[step].querySelectorAll(
        'input[required], select[required]'
    );

    inputs.forEach(input => {
        if (input.type === 'email' && !validateEmailField(input)) isValid = false;
        else if (input.type === 'tel' && !validatePhoneField(input)) isValid = false;
        else if (!validateField({ target: input })) isValid = false;
    });

    return isValid;
}

function validateField(e) {
    const input = e.target;
    const error = input.nextElementSibling;
    if (!error) return true;

    if (!input.value.trim()) {
        showError(input, error, 'Este campo es obligatorio');
        return false;
    }
    clearError(input, error);
    return true;
}

function validateEmailField(input) {
    const error = input.nextElementSibling;
    if (!error) return true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        showError(input, error, 'Correo electrónico inválido');
        return false;
    }
    clearError(input, error);
    return true;
}

function validatePhoneField(input) {
    const error = input.nextElementSibling;
    if (!error) return true;

    if (!/^[0-9]{10}$/.test(input.value)) {
        showError(input, error, 'El número debe tener 10 dígitos');
        return false;
    }
    clearError(input, error);
    return true;
}

function showError(input, error, msg) {
    input.classList.add('input-error');
    error.textContent = msg;
}

function clearError(input, error) {
    input.classList.remove('input-error');
    error.textContent = '';
}

function saveStepData(step) {
  const category = getStepCategory(step);

  // 🔥 STEP 2: lógica inteligente por contenido
  if (step === 1) {
    formData.contact = {};

    const quienInvito = document.querySelector('[name="quienInvito"]')?.value.trim();
    const nombreEvento = document.querySelector('[name="nombreEvento"]')?.value.trim();
    const otroTexto = document.querySelector('[name="otroTexto"]')?.value.trim();
    const redSocial = document.querySelector('[name="redSocial"]')?.value;
    if (nombreEvento) {
      formData.contact.medioPrincipal = 'Evento';
      formData.contact.nombreEvento = nombreEvento;
    } 
    else if (quienInvito) {
      formData.contact.medioPrincipal = 'Invitacion';
      formData.contact.quienInvito = quienInvito;
    } 
    else if (redSocial) {
      formData.contact.medioPrincipal = 'Redes';
      formData.contact.redSocial = redSocial;
    } 
    else if (otroTexto) {
      formData.contact.medioPrincipal = 'Otro';
      formData.contact.otroTexto = otroTexto;
    }

    // Guardar lo demás del step 2
    formSteps[step].querySelectorAll('input, select').forEach(input => {
      if (
        !['quienInvito', 'nombreEvento', 'otroTexto'].includes(input.name) &&
        input.type !== 'radio' &&
        input.value
      ) {
        formData.contact[input.name] = input.value;
      }
    });

    localStorage.setItem('formData', JSON.stringify(formData));
    return;
  }

  // 🔹 Otros steps (igual que antes)
  formSteps[step].querySelectorAll('input, select').forEach(input => {
    if (
      (input.type === 'radio' && input.checked) ||
      (input.type !== 'radio' && input.value)
    ) {
      formData[category][input.name] = input.value;
    }
  });

  localStorage.setItem('formData', JSON.stringify(formData));
}

function loadFormData() {
    const saved = localStorage.getItem('formData');
    if (!saved) return;

    Object.assign(formData, JSON.parse(saved));

    formSteps.forEach((step, i) => {
        const category = getStepCategory(i);
        step.querySelectorAll('input, select').forEach(input => {
            if (formData[category]?.[input.name]) {
                input.value = formData[category][input.name];
            }
        });
    });
}

function getStepCategory(step) {
    return ['personal', 'contact', 'professional'][step] || 'otro';
}

function updateFormSummary() {
    const sectionTitles = {
        personal: 'Información personal',
        contact: 'Información de contacto',
        professional: 'Información profesional'
    };

    const labels = {
        firstName: 'Nombre',
        lastName: 'Apellidos',
        cumpleaños: 'Fecha de nacimiento',
        edad: 'Edad',
        genero: 'Género',
        civil:'Estado Civil',
        nacion:'Nacionalidad',
        prof:'Profesión/Ocupación',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        address: 'Dirección',
        city: 'Ciudad',
        occupation: 'Ocupación',
        company: 'Compañía',
        experience: 'Experiencia'
    };

    let html = '';

    ['personal', 'contact', 'professional'].forEach(section => {
        html += `<div class="summary-section">
                <h3>${sectionTitles[section]}</h3>`;

        for (const [k, v] of Object.entries(formData[section])) {
            if (v) {
                html += `<div>${labels[k] || k}: ${v}</div>`;
            }
        }

        html += '</div>';
    });

    formSummary.innerHTML = html;
}


async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    saveStepData(currentStep);
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
        await submitFormData(formData);
        document.getElementById('success-email').textContent =
            formData.contact.email;
        showSuccess();
    } catch {
        alert('Error al enviar el formulario');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar';
    }
}

function submitFormData(data) {
    return new Promise(resolve => setTimeout(resolve, 1500));
}

function showSuccess() {
    form.style.display = 'none';
    successSection.style.display = 'block';
    localStorage.removeItem('formData');

    document.querySelector('.btn-new')
        .addEventListener('click', resetForm);
}

function resetForm() {
    form.reset();
    Object.keys(formData).forEach(k => formData[k] = {});
    currentStep = 0;
    form.style.display = 'block';
    successSection.style.display = 'none';
    initForm();
}


document.getElementById('invMiembro')?.addEventListener('change', e => {
  document.getElementById('quienInvito')
    .classList.toggle('oculto', !e.target.checked);
});

document.getElementById('eventoCheck')?.addEventListener('change', e => {
  document.getElementById('nombreEvento')
    .classList.toggle('oculto', !e.target.checked);
});

document.getElementById('otroCheck')?.addEventListener('change', e => {
  document.getElementById('otroTexto')
    .classList.toggle('oculto', !e.target.checked);
});

const medios = document.querySelectorAll('input[name="medioPrincipal"]');

const sections = {
  Invitacion: document.getElementById('inv-content'),
  Redes: document.getElementById('redes-content'),
  Evento: document.getElementById('evento-content'),
  Otro: document.getElementById('otro-content')
};

function limpiarSeccion(section) {
  section.querySelectorAll('input').forEach(input => {
    input.checked = false;
    input.value = '';
  });
}

medios.forEach(radio => {
  radio.addEventListener('change', () => {

    // 🔒 Forzar que SOLO este radio quede activo
    medios.forEach(r => r.checked = false);
    radio.checked = true;

    // Ocultar y limpiar todo
    Object.values(sections).forEach(sec => {
      sec.classList.add('oculto');
      limpiarSeccion(sec);
    });

    // Mostrar solo lo correspondiente
    sections[radio.value].classList.remove('oculto');
  });
});

  document.querySelectorAll('input[name="medioPrincipalVisual"]').forEach(radio => {
radio.addEventListener('change', () => {
document.querySelector('[name="redSocial"]').value = '';
});
});

// ===== BLOQUEO PARA QUE SOLO UNA OPCIÓN PUEDA USARSE =====

// Inputs
const invitacionInput = document.querySelector('[name="quienInvito"]');
const eventoInput = document.querySelector('[name="nombreEvento"]');
const otroInput = document.querySelector('[name="otroTexto"]');
const redSocialSelect = document.querySelector('[name="redSocial"]');

// Contenedores (para deshabilitar visualmente)
const invitacionBox = document.getElementById('inv-content');
const eventoBox = document.getElementById('evento-content');
const redesBox = document.getElementById('redes-content');
const otroBox = document.getElementById('otro-content');

function limpiarYBloquear(excepto) {
  const grupos = [
    { box: invitacionBox, input: invitacionInput },
    { box: eventoBox, input: eventoInput },
    { box: redesBox, input: redSocialSelect },
    { box: otroBox, input: otroInput }
  ];

  grupos.forEach(g => {
    if (g.input !== excepto) {
      g.box.classList.add('oculto');
      g.input.value = '';
      g.input.disabled = true;
    }
  });
}

function habilitarTodo() {
  [invitacionInput, eventoInput, redSocialSelect, otroInput].forEach(i => {
    i.disabled = false;
  });
}

// Detectar escritura / selección
[invitacionInput, eventoInput, otroInput].forEach(input => {
  input.addEventListener('input', () => {
    if (input.value.trim()) {
      limpiarYBloquear(input);
    } else {
      habilitarTodo();
    }
  });
});

redSocialSelect.addEventListener('change', () => {
  if (redSocialSelect.value) {
    limpiarYBloquear(redSocialSelect);
  } else {
    habilitarTodo();
  }
});


// ===== SINCRONIZAR RADIOS VISUALES =====
const radiosVisuales = document.querySelectorAll('input[name="medioPrincipalVisual"]');

function marcarRadio(valor) {
  radiosVisuales.forEach(radio => {
    radio.checked = radio.value === valor;
  });
}

// Invitación
document.querySelector('[name="quienInvito"]')?.addEventListener('input', e => {
  if (e.target.value.trim()) marcarRadio('Invitacion');
});

// Evento
document.querySelector('[name="nombreEvento"]')?.addEventListener('input', e => {
  if (e.target.value.trim()) marcarRadio('Evento');
});

// Otro
document.querySelector('[name="otroTexto"]')?.addEventListener('input', e => {
  if (e.target.value.trim()) marcarRadio('Otro');
});

// Redes (select)
document.querySelector('[name="redSocial"]')?.addEventListener('change', e => {
  if (e.target.value) marcarRadio('Redes');
});

