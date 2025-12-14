import { CONFIG } from './config.js';

// Generate model parameter fields dynamically from CONFIG
function initModelParamFields() {
    const container = document.getElementById('modelParamsContainer');
    if (!container) return;

    CONFIG.getModelConfigurableParams().forEach(paramName => {
        const div = document.createElement('div');
        div.className = 'config-row';
        
        const label = document.createElement('label');
        label.setAttribute('data-i18n', `${paramName}_label`);
        label.textContent = paramName;
        
        const input = document.createElement('input');
        input.id = paramName;
        input.type = 'number';
        input.step = paramName === 'years' ? '1' : '0.01';
        
        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });
}

// Generate actor parameter fields dynamically from CONFIG
function initActorParamFields() {
    const container = document.getElementById('actorParamsContainer');
    if (!container) return;

    CONFIG.getActorConfigurableParams().forEach(paramName => {
        const div = document.createElement('div');
        div.className = 'config-row';
        
        const label = document.createElement('label');
        label.setAttribute('data-i18n', `${paramName}_label`);
        label.textContent = paramName;
        
        const input = document.createElement('input');
        input.id = paramName;
        input.type = 'number';
        input.step = paramName === 'N' || paramName === 'N_max' ? '1' : '0.1';
        
        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });
}

// Initialize form fields when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initModelParamFields();
        initActorParamFields();
    });
} else {
    initModelParamFields();
    initActorParamFields();
}
