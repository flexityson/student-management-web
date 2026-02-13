// Common authentication utilities and functions

export function showMessage(messageContainer, message, type = 'error') {
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    messageContainer.innerHTML = `
        <div class="${messageClass}">
            <i class="fas ${icon}" aria-hidden="true"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 3000);
    }
}

export function togglePasswordVisibility(input, toggle) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    toggle.innerHTML = type === 'password' 
        ? '<i class="fas fa-eye" aria-hidden="true"></i>'
        : '<i class="fas fa-eye-slash" aria-hidden="true"></i>';
}

export function validateEmail(email) {
    return email && email.includes('@') && email.includes('.');
}

export function validatePassword(password) {
    return password && password.length >= 6;
}

export function clearErrorStates(...inputs) {
    inputs.forEach(input => {
        input.classList.remove('form-error');
    });
}

export function setLoadingState(button, textElement, spinner, isLoading) {
    button.disabled = isLoading;
    textElement.style.display = isLoading ? 'none' : 'inline';
    spinner.style.display = isLoading ? 'inline-block' : 'none';
}

export function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
        feedback = 'Weak password - add more characters';
        return { feedback, className: 'password-strength weak' };
    } else if (strength <= 3) {
        feedback = 'Medium password - could be stronger';
        return { feedback, className: 'password-strength medium' };
    } else {
        feedback = 'Strong password';
        return { feedback, className: 'password-strength strong' };
    }
}

export function handleUrlMessages(messageContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'account_created') {
        showMessage(messageContainer, 'Account created successfully! Please sign in.', 'success');
    } else if (message === 'session_expired') {
        showMessage(messageContainer, 'Your session has expired. Please sign in again.');
    } else if (message === 'password_reset') {
        showMessage(messageContainer, 'Password reset successfully! Please sign in with your new password.', 'success');
    }
}

export function handleRememberedEmail(emailInput, rememberCheckbox) {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
        return true;
    }
    return false;
}
