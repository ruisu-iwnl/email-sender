class EmailConsole {
    constructor() {
        this.consoleElement = document.getElementById('console-output');
        this.isSending = false;
    }

    clear() {
        this.consoleElement.innerHTML = '<div class="text-light">Ready to send emails...</div>';
    }

    addMessage(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const messageDiv = document.createElement('div');
        
        let colorClass = 'text-light';
        if (type === 'success') colorClass = 'text-success';
        if (type === 'error') colorClass = 'text-danger';
        if (type === 'warning') colorClass = 'text-warning';
        
        messageDiv.innerHTML = `<span class="text-light">[${timestamp}]</span> <span class="${colorClass}">${message}</span>`;
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

class FileUploadManager {
    constructor() {
        this.uploadedFiles = [];
        this.fileInput = document.getElementById('file-upload');
        this.fileList = document.getElementById('file-list');
        this.previewModal = new bootstrap.Modal(document.getElementById('filePreviewModal'));
        this.currentPreviewFile = null;
        
        this.init();
    }
    
    init() {
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('remove-file-btn').addEventListener('click', () => this.removeCurrentFile());
    }
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.uploadedFiles.push(file);
                this.displayFile(file);
            }
        });
        
        event.target.value = '';
    }
    
    validateFile(file) {
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/pdf',
            'text/plain'
        ];
        
        const allowedExtensions = ['.link', '.jpeg', '.jpg', '.png', '.docx', '.xlsx', '.pdf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            alert(`File type ${fileExtension} is not supported.`);
            return false;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return false;
        }
        
        return true;
    }
    
    displayFile(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item d-flex justify-content-between align-items-center p-2 border rounded mb-2';
        fileItem.dataset.fileName = file.name;
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'd-flex align-items-center';
        
        const icon = this.getFileIcon(file);
        const fileDetails = document.createElement('div');
        fileDetails.innerHTML = `
            <div class="fw-bold">${file.name}</div>
            <small class="text-muted">${this.formatFileSize(file.size)}</small>
        `;
        
        fileInfo.appendChild(icon);
        fileInfo.appendChild(fileDetails);
        
        const actions = document.createElement('div');
        
        const previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.className = 'btn btn-sm btn-outline-primary me-2';
        previewBtn.textContent = 'Preview';
        previewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.previewFile(file.name);
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-sm btn-outline-danger';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeFile(file.name);
        });
        
        actions.appendChild(previewBtn);
        actions.appendChild(removeBtn);
        
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(actions);
        
        this.fileList.appendChild(fileItem);
    }
    
    getFileIcon(file) {
        const icon = document.createElement('i');
        icon.className = 'me-2';
        
        if (file.type.startsWith('image/')) {
            icon.className += 'bi bi-image text-primary';
        } else if (file.type.includes('pdf')) {
            icon.className += 'bi bi-file-earmark-pdf text-danger';
        } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
            icon.className += 'bi bi-file-earmark-word text-primary';
        } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
            icon.className += 'bi bi-file-earmark-excel text-success';
        } else {
            icon.className += 'bi bi-file-earmark text-secondary';
        }
        
        return icon;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    previewFile(fileName) {
        const file = this.uploadedFiles.find(f => f.name === fileName);
        if (!file) return;
        
        this.currentPreviewFile = file;
        const previewContent = document.getElementById('file-preview-content');
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewContent.innerHTML = `
                    <div class="text-center">
                        <img src="${e.target.result}" class="img-fluid" alt="${file.name}">
                        <p class="mt-2"><strong>${file.name}</strong></p>
                        <p class="text-muted">${this.formatFileSize(file.size)}</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            previewContent.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-file-earmark text-muted mb-3" style="font-size: 5rem;"></i>
                    <h5>${file.name}</h5>
                    <p class="text-muted">${this.formatFileSize(file.size)}</p>
                    <p class="text-muted">Preview not available for this file type</p>
                </div>
            `;
        }
        
        this.previewModal.show();
    }
    
    removeFile(fileName) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== fileName);
        
        const fileItem = this.fileList.querySelector(`[data-file-name="${fileName}"]`);
        if (fileItem) {
            fileItem.remove();
        }
    }
    
    removeCurrentFile() {
        if (this.currentPreviewFile) {
            this.removeFile(this.currentPreviewFile.name);
            this.previewModal.hide();
        }
    }
    
    getFiles() {
        return this.uploadedFiles;
    }
}

const fileManager = new FileUploadManager();

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
            
            const formData = new FormData();
            formData.append('recipients', recipients);
            formData.append('subject', subject);
            formData.append('content', content);
            
            const files = fileManager.getFiles();
            files.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
            
            fetch('/send-emails', {
                method: 'POST',
                body: formData
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
