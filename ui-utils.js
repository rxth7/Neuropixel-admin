// Custom Alert and Confirm Dialogs

export function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-alert-overlay';

        const iconMap = {
            success: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`,
            error: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            warning: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`,
            info: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`
        };

        modal.innerHTML = `
            <div class="custom-alert-box">
                <div class="custom-alert-icon">${iconMap[type]}</div>
                <div class="custom-alert-message">${message}</div>
                <button class="custom-alert-btn custom-alert-btn-${type}">OK</button>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => modal.classList.add('show'), 10);

        const btn = modal.querySelector('.custom-alert-btn');
        btn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                resolve();
            }, 300);
        });
    });
}

export function showConfirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'custom-alert-overlay';

        modal.innerHTML = `
            <div class="custom-alert-box">
                <div class="custom-alert-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <h3 class="custom-alert-title">${title}</h3>
                <div class="custom-alert-message">${message}</div>
                <div class="custom-alert-buttons">
                    <button class="custom-alert-btn custom-alert-btn-cancel">Cancel</button>
                    <button class="custom-alert-btn custom-alert-btn-confirm">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => modal.classList.add('show'), 10);

        const cancelBtn = modal.querySelector('.custom-alert-btn-cancel');
        const confirmBtn = modal.querySelector('.custom-alert-btn-confirm');

        const closeModal = (result) => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
                resolve(result);
            }, 300);
        };

        cancelBtn.addEventListener('click', () => closeModal(false));
        confirmBtn.addEventListener('click', () => closeModal(true));
    });
}

export function setButtonLoading(button, loading = true, originalText = 'Submit') {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <span class="btn-spinner"></span>
            <span>Processing...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || originalText;
    }
}

export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>`,
        error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`,
        warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
        </svg>`,
        info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
        </svg>`
    };

    toast.innerHTML = `
        ${iconMap[type]}
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}