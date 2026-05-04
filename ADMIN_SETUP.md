# Admin TOTP Setup Guide

This guide will help you set up Two-Factor Authentication (2FA) for the Serviqo admin panel.

## Prerequisites

- Node.js installed
- Access to a TOTP authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)

## Step 1: Generate Your 2FA Secret

1. Navigate to the project root directory
2. Run the 2FA generation script:

```bash
node src/scripts/generate2FA.js
```

3. The script will output:
   - A **SECRET** (base32 encoded string) - Save this securely
   - A **QR Code** (data URL) - You can open this in a browser or scan it

## Step 2: Configure Your Authenticator App

### Option A: Scan QR Code
1. Copy the QR code data URL from the terminal
2. Open it in a web browser
3. Scan the QR code with your authenticator app

### Option B: Manual Entry
1. Open your authenticator app
2. Choose "Enter a setup key" or "Manual entry"
3. Enter the following:
   - **Account name**: Serviqo Admin
   - **Secret key**: [The base32 secret from Step 1]
   - **Type**: Time-based

## Step 3: Update Environment Variables

1. Open `frontend/.env`
2. Update the following variables:

```env
ADMIN_EMAIL=admin@serviqo.com
ADMIN_PASSWORD_HASH=[Your bcrypt hashed password]
ADMIN_2FA_SECRET=[Your base32 secret from Step 1]
JWT_SECRET=[Your secure random string]
```

### Generating a Password Hash

To generate a bcrypt hash for your password:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10, (err, hash) => console.log(hash));"
```

Replace `'your-password'` with your actual password.

### Generating a JWT Secret

Generate a secure random string for JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

## Step 4: Test Your Setup

1. Start the development server:

```bash
cd frontend
npm run dev
```

2. Navigate to `http://localhost:3000/admin/login`

3. Enter your credentials:
   - **Email**: The email you set in ADMIN_EMAIL
   - **Password**: The password you hashed
   - **Access Code**: The 6-digit code from your authenticator app

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Store your 2FA secret securely** - If you lose it, you'll need to regenerate
3. **Use a strong password** - At least 12 characters with mixed case, numbers, and symbols
4. **Rotate your JWT secret periodically** - Especially after any security incidents
5. **Keep your authenticator app backed up** - Most apps support cloud backup

## Troubleshooting

### "Invalid or expired 2FA code"
- Ensure your device's time is synchronized (TOTP is time-based)
- The code expires every 30 seconds - try a fresh code
- Check that you entered the correct secret in your authenticator app

### "Invalid credentials"
- Verify your email matches ADMIN_EMAIL in `.env`
- Ensure your password hash was generated correctly
- Check for typos in your `.env` file

### "Network error"
- Ensure the API route is accessible at `/api/admin/login`
- Check browser console for detailed error messages
- Verify all required npm packages are installed

## Production Deployment

Before deploying to production:

1. **Remove demo credentials** from the login page (already conditional on NODE_ENV)
2. **Use strong, unique values** for all environment variables
3. **Enable HTTPS** - The session cookie uses `secure` flag in production
4. **Set up proper logging** - Monitor failed login attempts
5. **Consider rate limiting** - Prevent brute force attacks
6. **Backup your 2FA secret** - Store it in a secure password manager

## Additional Security Measures

Consider implementing:

- **IP whitelisting** for admin access
- **Login attempt rate limiting**
- **Email notifications** for successful logins
- **Session timeout** after inactivity
- **Audit logging** for all admin actions
- **Multi-admin support** with individual credentials

## Support

For issues or questions, contact the development team.
