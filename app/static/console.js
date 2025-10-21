class EmailConsole {
    constructor() {
        this.consoleElement = document.getElementById('console-output');
        this.isSending = false;
    }

    clear() {
        this.consoleElement.innerHTML = '<div class="text-muted">Ready to send emails...</div>';
    }

    addMessage(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const messageDiv = document.createElement('div');
        
        let colorClass = 'text-light';
        if (type === 'success') colorClass = 'text-success';
        if (type === 'error') colorClass = 'text-danger';
        if (type === 'warning') colorClass = 'text-warning';
        
        messageDiv.innerHTML = `<span class="text-muted">[${timestamp}]</span> <span class="${colorClass}">${message}</span>`;
        this.consoleElement.appendChild(messageDiv);
        
        this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
        
        if (this.consoleElement.children.length > 1000) {
            this.consoleElement.removeChild(this.consoleElement.firstChild);
        }
    }

    startSending(totalEmails) {
        this.isSending = true;
        this.addMessage('SMTP initiated...', 'info');
        this.addMessage(`Preparing to send ${totalEmails} email(s)...`, 'info');
    }

    emailSent(email) {
        this.addMessage(`Email sent to ${email}`, 'success');
    }

    emailFailed(email, error) {
        this.addMessage(`Failed to send to ${email}: ${error}`, 'error');
    }

    finishSending(successCount, totalCount) {
        this.addMessage('', 'info');
        if (successCount === totalCount) {
            this.addMessage(`All emails sent successfully! (${successCount}/${totalCount})`, 'success');
        } else {
            this.addMessage(`Sending completed. ${successCount}/${totalCount} emails sent successfully.`, 'warning');
        }
        this.addMessage('Sending process finished.', 'info');
        this.isSending = false;
    }

    showError(error) {
        this.addMessage(`Error: ${error}`, 'error');
        this.addMessage('Sending process stopped.', 'error');
        this.isSending = false;
    }
}

const emailConsole = new EmailConsole();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const recipients = document.getElementById('recipients').value;
        const subject = document.getElementById('subject').value;
        const content = document.getElementById('content').value;
        
        if (!recipients || !subject || !content) {
            alert('Please fill in all fields');
            return;
        }
        
        const emails = recipients.split(/[,;\n]/).filter(email => email.trim()).length;
        
        if (emails > 0) {
            emailConsole.startSending(emails);
            
            fetch('/send-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipients: recipients,
                    subject: subject,
                    content: content
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    emailConsole.showError(data.error);
                } else {
                    let successCount = 0;
                    data.results.forEach(result => {
                        if (result.status === 'success') {
                            emailConsole.emailSent(result.email);
                            successCount++;
                        } else {
                            emailConsole.emailFailed(result.email, result.error);
                        }
                    });
                    emailConsole.finishSending(successCount, data.results.length);
                }
            })
            .catch(error => {
                emailConsole.showError('Network error: ' + error.message);
            });
        }
    });
});
