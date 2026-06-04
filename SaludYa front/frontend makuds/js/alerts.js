function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeSingleButtonAlert(defaultTitle, firstArg, secondArg, thirdArg) {
    if (typeof secondArg === 'function') {
        return {
            title: defaultTitle,
            message: firstArg || '',
            callback: secondArg
        };
    }

    return {
        title: firstArg || defaultTitle,
        message: secondArg || '',
        callback: typeof thirdArg === 'function' ? thirdArg : () => {}
    };
}

const AlertSystem = {
    show: function(config = {}) {
        const {
            icon = 'success',
            title = 'Alerta',
            message = '',
            buttons = ['Okay'],
            onConfirm = () => {},
            onCancel = () => {},
            dismissible = buttons.length > 0
        } = config;

        const overlay = document.createElement('div');
        overlay.className = 'alert-overlay';

        const modal = document.createElement('div');
        modal.className = 'alert-modal';

        const confirmLabel = buttons[0] || '';
        const cancelLabel = buttons[1] || '';
        const buttonsHtml = [
            confirmLabel ? `<button class="btn btn-confirm" type="button">${escapeHtml(confirmLabel)}</button>` : '',
            cancelLabel ? `<button class="btn btn-cancel" type="button">${escapeHtml(cancelLabel)}</button>` : ''
        ].join('');

        modal.innerHTML = `
            <div class="alert-content">
                <div class="alert-body">
                    <div class="alert-icon alert-${escapeHtml(icon)}">
                        ${this.getIcon(icon)}
                    </div>
                    <div class="alert-text">
                        <h2 class="alert-title">${escapeHtml(title)}</h2>
                        <p class="alert-message">${escapeHtml(message)}</p>
                    </div>
                </div>
                <div class="alert-buttons"${buttonsHtml ? '' : ' style="display: none;"'}>${buttonsHtml}</div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const confirmButton = modal.querySelector('.btn-confirm');
        const cancelButton = modal.querySelector('.btn-cancel');

        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.close(overlay, modal);
                onConfirm();
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.close(overlay, modal);
                onCancel();
            });
        }

        if (dismissible) {
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    this.close(overlay, modal);
                    onCancel();
                }
            });
        }
    },

    getIcon: function(type) {
        const icons = {
            success: '<i class="ti ti-circle-check"></i>',
            error: '<i class="ti ti-circle-x"></i>',
            warning: '<i class="ti ti-alert-circle"></i>',
            info: '<i class="ti ti-info-circle"></i>',
            loading: '<i class="ti ti-loader"></i>'
        };

        return icons[type] || icons.success;
    },

    close: function(overlay, modal) {
        overlay.classList.add('fade-out');
        modal.classList.add('fade-out');

        setTimeout(() => {
            overlay.remove();
            modal.remove();
        }, 300);
    },

    confirm: function(title, message, onConfirm) {
        this.show({
            icon: 'warning',
            title: title,
            message: message,
            buttons: ['Confirmar', 'Cancelar'],
            onConfirm: onConfirm
        });
    },

    success: function(titleOrMessage, messageOrCallback, callback) {
        const data = normalizeSingleButtonAlert('Éxito', titleOrMessage, messageOrCallback, callback);

        this.show({
            icon: 'success',
            title: data.title,
            message: data.message,
            buttons: ['Okay'],
            onConfirm: data.callback
        });
    },

    error: function(titleOrMessage, messageOrCallback, callback) {
        const data = normalizeSingleButtonAlert('Error', titleOrMessage, messageOrCallback, callback);

        this.show({
            icon: 'error',
            title: data.title,
            message: data.message,
            buttons: ['Entendido'],
            onConfirm: data.callback
        });
    },

    info: function(titleOrMessage, messageOrCallback, callback) {
        const data = normalizeSingleButtonAlert('Información', titleOrMessage, messageOrCallback, callback);

        this.show({
            icon: 'info',
            title: data.title,
            message: data.message,
            buttons: ['Okay'],
            onConfirm: data.callback
        });
    },

    loading: function(title, message) {
        this.show({
            icon: 'loading',
            title: title || 'Cargando',
            message: message || '',
            buttons: [],
            dismissible: false
        });
    }
};

if (typeof window !== 'undefined') {
    window.AlertSystem = AlertSystem;
}
