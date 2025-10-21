from flask import Blueprint, render_template, request, flash, redirect, url_for, current_app, jsonify
from flask_mail import Message
import os
import re
from werkzeug.utils import secure_filename


bp = Blueprint('main', __name__)

def parse_emails(email_string):
    """Parse email addresses from string (comma or newline separated)"""
    if not email_string:
        return []
    
    emails = re.split(r'[,;\n]', email_string)
    emails = [email.strip() for email in emails if email.strip()]
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    valid_emails = [email for email in emails if re.match(email_pattern, email)]
    
    return valid_emails

def get_uploaded_files():
    """Extract uploaded files from request"""
    files = []
    for key in request.files:
        if key.startswith('attachment_'):
            file = request.files[key]
            if file and file.filename:
                files.append(file)
    return files


@bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        recipients = request.form.get('recipients', '')
        subject = request.form.get('subject', '')
        content = request.form.get('content', '')
        
        if not recipients or not subject or not content:
            flash('Please fill in all fields', 'error')
            return render_template('index.html')
        
        email_list = parse_emails(recipients)
        if not email_list:
            flash('Please enter valid email addresses', 'error')
            return render_template('index.html')

        if not current_app.config.get('MAIL_USERNAME') or not current_app.config.get('MAIL_PASSWORD'):
            flash('SMTP not configured. Please set MAIL_USERNAME and MAIL_PASSWORD in your .env file', 'error')
            return render_template('index.html')
        
        try:

            from flask_mail import Mail
            mail = Mail(current_app)
            
            success_count = 0
            failed_emails = []
            
            for email in email_list:
                try:
                    msg = Message(
                        subject=subject,
                        recipients=[email],
                        body=content,
                        sender=current_app.config.get('MAIL_DEFAULT_SENDER')
                    )
                    mail.send(msg)
                    success_count += 1
                except Exception as email_error:
                    failed_emails.append(f"{email}: {str(email_error)}")
            
            if failed_emails:
                flash(f'Partially successful: {success_count}/{len(email_list)} emails sent. Failed: {", ".join(failed_emails)}', 'warning')
            else:
                flash(f'Successfully sent email to {success_count} recipients!', 'success')
            
        except Exception as e:
            flash(f'Error sending email: {str(e)}', 'error')
        
        return redirect(url_for('main.index'))
    
    return render_template('index.html')


@bp.route('/send-emails', methods=['POST'])
def send_emails():
    if request.is_json:
        data = request.get_json()
        recipients = data.get('recipients', '')
        subject = data.get('subject', '')
        content = data.get('content', '')
        attachments = []
    else:
        recipients = request.form.get('recipients', '')
        subject = request.form.get('subject', '')
        content = request.form.get('content', '')
        attachments = get_uploaded_files()
    
    email_list = parse_emails(recipients)
    results = []
    
    if not current_app.config.get('MAIL_USERNAME') or not current_app.config.get('MAIL_PASSWORD'):
        return jsonify({'error': 'SMTP not configured'})
    
    try:
        from flask_mail import Mail
        mail = Mail(current_app)
        
        for email in email_list:
            try:
                msg = Message(
                    subject=subject,
                    recipients=[email],
                    body=content,
                    sender=current_app.config.get('MAIL_DEFAULT_SENDER')
                )
                
                for attachment in attachments:
                    filename = secure_filename(attachment.filename)
                    msg.attach(
                        filename=filename,
                        content_type=attachment.content_type,
                        data=attachment.read()
                    )
                    attachment.seek(0)
                
                mail.send(msg)
                results.append({'email': email, 'status': 'success'})
            except Exception as email_error:
                results.append({'email': email, 'status': 'error', 'error': str(email_error)})
    
    except Exception as e:
        return jsonify({'error': str(e)})
    
    return jsonify({'results': results})


