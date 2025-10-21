# Flask Email Sender

simple flask app to send email to multiple applicants.

## Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python run.py
```

Visit: http://127.0.0.1:5000

## How to Use

1. Enter recipient email addresses (one per line)
2. Enter subject and message
3. Click "Send Email"

**Example:**
- Recipients: `john@example.com`, `jane@example.com`
- Subject: `Job Application Update`
- Message: `Thank you for your application. We'll be in touch soon.`

## Environment Variables

Copy `.env.example` to `.env` and fill in your SMTP settings:

```env
SECRET_KEY=
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=
MAIL_PASSWORD=
```
