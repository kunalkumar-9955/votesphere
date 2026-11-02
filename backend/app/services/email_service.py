"""
Real email delivery service for VoteSphere.
Supports SMTP (Gmail / any provider). Falls back to console logging in dev.
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)


def _build_otp_html(name: str, otp: str, expires_minutes: int) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>VoteSphere OTP</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border-radius:20px;
                      border:1px solid rgba(99,102,241,0.3);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;
                       background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
                            border-radius:10px;display:inline-block;line-height:40px;text-align:center;">
                  <span style="color:white;font-size:20px;">&#9654;</span>
                </div>
                <span style="font-size:22px;font-weight:800;
                             background:linear-gradient(135deg,#818cf8,#a78bfa);
                             -webkit-background-clip:text;color:#818cf8;">VoteSphere</span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="color:#f9fafb;font-size:20px;font-weight:700;margin:0 0 8px;">
                Hello, {name} 👋
              </h2>
              <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
                Use the verification code below to complete your sign-in.
                This code expires in <strong style="color:#f9fafb;">{expires_minutes} minutes</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:rgba(99,102,241,0.1);border:2px solid rgba(99,102,241,0.4);
                          border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="color:#9ca3af;font-size:12px;text-transform:uppercase;
                           letter-spacing:3px;margin:0 0 12px;">Your OTP Code</p>
                <div style="font-size:42px;font-weight:900;letter-spacing:12px;
                            color:#818cf8;font-family:monospace;">{otp}</div>
              </div>
              <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
                If you didn't request this code, you can safely ignore this email.
                Never share this code with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="color:#4b5563;font-size:11px;margin:0;">
                © 2024 VoteSphere · Secure Voting Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    """Send OTP email. Returns True on success, False on failure."""
    subject = f"{otp} is your VoteSphere verification code"
    html_body = _build_otp_html(name, otp, settings.OTP_EXPIRE_MINUTES)

    # Dev fallback — always log OTP
    logger.info(f"[VoteSphere OTP] {to_email} → {otp}")

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — OTP logged to console only.")
        return True  # Don't block registration in dev

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(f"Your VoteSphere OTP is: {otp}. Expires in {settings.OTP_EXPIRE_MINUTES} minutes.", "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())

        logger.info(f"OTP email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        return False


def send_welcome_email(to_email: str, name: str) -> bool:
    """Send welcome email after successful verification."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return True

    html = f"""
    <div style="font-family:Arial,sans-serif;background:#030712;color:#f9fafb;padding:40px;border-radius:16px;">
      <h2 style="color:#818cf8;">Welcome to VoteSphere, {name}!</h2>
      <p style="color:#9ca3af;">Your account is verified and ready. Start voting or create your organization today.</p>
    </div>
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to VoteSphere 🎉"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Welcome email failed: {e}")
        return False


def send_password_reset_email(to_email: str, name: str, reset_token: str) -> bool:
    """Send password reset email with token."""
    logger.info(f"[Password Reset] {to_email} → {reset_token}")
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — reset token logged to console only.")
        return True

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#030712;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
                   style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border-radius:20px;
                          border:1px solid rgba(99,102,241,0.3);overflow:hidden;">
              <tr>
                <td style="padding:32px 40px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));">
                  <span style="font-size:22px;font-weight:800;color:#818cf8;">VoteSphere</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;">
                  <h2 style="color:#f9fafb;font-size:20px;font-weight:700;margin:0 0 8px;">
                    Password Reset Request
                  </h2>
                  <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
                    Hi {name}, we received a request to reset your password. Use the code below to proceed.
                    This code expires in <strong>30 minutes</strong>.
                  </p>
                  <div style="background:rgba(99,102,241,0.1);border:2px solid rgba(99,102,241,0.4);
                              border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                    <p style="color:#9ca3af;font-size:12px;margin:0 0 12px;">RESET CODE</p>
                    <div style="font-size:36px;font-weight:900;letter-spacing:8px;
                                color:#818cf8;font-family:monospace;">{reset_token}</div>
                  </div>
                  <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                  <p style="color:#4b5563;font-size:11px;margin:0;">
                    © 2024 VoteSphere · Secure Voting Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset your VoteSphere password"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(f"Your password reset code: {reset_token}", "plain"))
        msg.attach(MIMEText(html, "html"))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
        return False


def send_contact_email(name: str, email: str, subject: str, message: str) -> bool:
    """Send contact inquiry to admin and confirmation to user."""
    logger.info(f"[Contact Inquiry] {email} - {subject}")
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP not configured — contact inquiry logged to console only.")
        return True

    # Send to admin
    admin_html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#030712;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
                   style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border-radius:20px;
                          border:1px solid rgba(99,102,241,0.3);overflow:hidden;">
              <tr>
                <td style="padding:32px 40px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));">
                  <span style="font-size:22px;font-weight:800;color:#818cf8;">VoteSphere</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;">
                  <h2 style="color:#f9fafb;font-size:20px;font-weight:700;margin:0 0 8px;">
                    New Contact Inquiry
                  </h2>
                  <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:16px;margin:16px 0;">
                    <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">
                      From:
                    </p>
                    <p style="color:#f9fafb;font-size:14px;font-weight:600;margin:0;">{name} ({email})</p>
                  </div>
                  <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:16px;margin:16px 0;">
                    <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">
                      Subject:
                    </p>
                    <p style="color:#f9fafb;font-size:14px;font-weight:600;margin:0;">{subject}</p>
                  </div>
                  <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:16px;margin:16px 0;">
                    <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">
                      Message:
                    </p>
                    <p style="color:#f9fafb;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">{message}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                  <p style="color:#4b5563;font-size:11px;margin:0;">
                    © 2024 VoteSphere
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    
    # Send to user (confirmation)
    user_html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#030712;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0"
                   style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border-radius:20px;
                          border:1px solid rgba(99,102,241,0.3);overflow:hidden;">
              <tr>
                <td style="padding:32px 40px;text-align:center;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15));">
                  <span style="font-size:22px;font-weight:800;color:#818cf8;">VoteSphere</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;">
                  <h2 style="color:#f9fafb;font-size:20px;font-weight:700;margin:0 0 8px;">
                    Thank you for contacting us! 👋
                  </h2>
                  <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 16px;">
                    Hi {name}, we received your inquiry about <strong>"{subject}"</strong>.
                    Our support team will get back to you within 24 hours.
                  </p>
                  <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
                    In the meantime, feel free to check our <a href="https://votesphere.com/security" 
                    style="color:#818cf8;text-decoration:none;">security documentation</a> or 
                    <a href="https://votesphere.com/features" style="color:#818cf8;text-decoration:none;">features page</a>.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                  <p style="color:#4b5563;font-size:11px;margin:0;">
                    © 2024 VoteSphere · Secure Voting Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    
    try:
        # Send to admin
        admin_msg = MIMEMultipart("alternative")
        admin_msg["Subject"] = f"[Contact] {subject}"
        admin_msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        admin_msg["To"] = settings.SMTP_USER
        admin_msg.attach(MIMEText(f"New contact from {name} ({email}):\n\n{message}", "plain"))
        admin_msg.attach(MIMEText(admin_html, "html"))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, settings.SMTP_USER, admin_msg.as_string())
        
        # Send confirmation to user
        user_msg = MIMEMultipart("alternative")
        user_msg["Subject"] = "We received your message"
        user_msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        user_msg["To"] = email
        user_msg.attach(MIMEText(f"Thank you for contacting VoteSphere, {name}!", "plain"))
        user_msg.attach(MIMEText(user_html, "html"))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, email, user_msg.as_string())
        
        logger.info(f"Contact inquiry emails sent for {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send contact emails: {e}")
        return False
