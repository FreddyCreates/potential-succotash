/**
 * Fake Admin Panel - Synthetic Host
 * 
 * Simulates a generic admin panel for credential harvesting detection.
 * Mimics various admin interfaces (generic, Firebase, AWS-style).
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Admin panel styles
 */
const PANEL_STYLES = {
  generic: 'Generic Admin Panel',
  dashboard: 'Dashboard Console',
  firebase: 'Database Console',
  cloud: 'Cloud Management'
};

/**
 * Fake Admin Panel Host
 */
export class FakeAdminPanel {
  constructor(config = {}) {
    this.id = `admin-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      style: config.style || 'generic',
      requireMFA: config.requireMFA || false,
      sessionTimeout: config.sessionTimeout || 3600,
      ...config
    };
    
    this.state = {
      requestCount: 0,
      loginAttempts: [],
      mfaAttempts: [],
      sessionCreations: 0,
      credentialsHarvested: []
    };
  }
  
  /**
   * Handle incoming request
   */
  async handle(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    this.state.requestCount++;
    
    // Route handling
    if (path === '/' || path === '/admin' || path === '/admin/') {
      return this.serveLoginPage();
    }
    
    if (path === '/admin/login' && method === 'POST') {
      return this.handleLogin(request);
    }
    
    if (path === '/admin/mfa' && method === 'POST') {
      return this.handleMFA(request);
    }
    
    if (path === '/admin/dashboard') {
      return this.serveDashboard();
    }
    
    if (path === '/admin/api/session') {
      return this.serveSessionInfo();
    }
    
    if (path === '/admin/logout') {
      return this.handleLogout();
    }
    
    return this.serve404();
  }
  
  /**
   * Serve login page
   */
  serveLoginPage() {
    const title = PANEL_STYLES[this.config.style];
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 400px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
      font-size: 24px;
      color: #1a1a2e;
    }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 5px; color: #666; font-size: 14px; }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    input:focus { outline: none; border-color: #4a90d9; }
    button {
      width: 100%;
      padding: 12px;
      background: #4a90d9;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #357abd; }
    .forgot { text-align: center; margin-top: 20px; }
    .forgot a { color: #4a90d9; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="logo">🔐 ${title}</div>
    <form action="/admin/login" method="POST">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" name="email" required placeholder="admin@example.com">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required placeholder="••••••••">
      </div>
      <button type="submit">Sign In</button>
    </form>
    <div class="forgot">
      <a href="/admin/forgot-password">Forgot password?</a>
    </div>
  </div>
</body>
</html>`;
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
  
  /**
   * Handle login attempt (credential harvesting)
   */
  async handleLogin(request) {
    let email = '';
    let password = '';
    
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const body = await request.json();
        email = body.email || body.username || '';
        password = body.password || '';
      } else {
        const formData = await request.formData();
        email = formData.get('email') || formData.get('username') || '';
        password = formData.get('password') || '';
      }
    } catch (e) {
      // Form parsing failed
    }
    
    // Record harvested credentials
    const attempt = {
      email,
      password: password ? '[CAPTURED]' : '[EMPTY]',
      timestamp: Date.now(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    this.state.loginAttempts.push(attempt);
    this.state.credentialsHarvested.push({ email, passwordLength: password.length });
    
    // If MFA is required, redirect to MFA page
    if (this.config.requireMFA) {
      return this.serveMFAPage();
    }
    
    // Always fail with generic error (honeypot behavior)
    return this.serveLoginError();
  }
  
  /**
   * Serve MFA page
   */
  serveMFAPage() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Two-Factor Authentication</title>
  <style>
    body { font-family: sans-serif; background: #f5f5f5; padding: 50px; }
    .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
    input { width: 100%; padding: 12px; margin: 10px 0; }
    button { width: 100%; padding: 12px; background: #4a90d9; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔐 Two-Factor Authentication</h2>
    <p>Enter the code from your authenticator app:</p>
    <form action="/admin/mfa" method="POST">
      <input type="text" name="code" placeholder="000000" maxlength="6" pattern="[0-9]{6}" required>
      <button type="submit">Verify</button>
    </form>
  </div>
</body>
</html>`;
    
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  /**
   * Handle MFA attempt
   */
  async handleMFA(request) {
    const formData = await request.formData();
    const code = formData.get('code') || '';
    
    this.state.mfaAttempts.push({
      code,
      timestamp: Date.now()
    });
    
    // Always fail
    return this.serveLoginError('Invalid verification code');
  }
  
  /**
   * Serve login error
   */
  serveLoginError(message = 'Invalid credentials') {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><title>Login Failed</title></head>
<body style="font-family: sans-serif; padding: 50px; text-align: center;">
  <h2>⚠️ Authentication Failed</h2>
  <p>${message}</p>
  <p><a href="/admin">Try again</a></p>
</body>
</html>`;
    
    return new Response(html, {
      status: 401,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  /**
   * Serve dashboard (should never actually be reached in honeypot)
   */
  serveDashboard() {
    return new Response('Dashboard - Access Denied', { status: 403 });
  }
  
  /**
   * Serve session info
   */
  serveSessionInfo() {
    return Response.json({
      authenticated: false,
      mfaRequired: this.config.requireMFA
    });
  }
  
  /**
   * Handle logout
   */
  handleLogout() {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/admin' }
    });
  }
  
  /**
   * Serve 404
   */
  serve404() {
    return new Response('Not Found', { status: 404 });
  }
  
  /**
   * Get host state
   */
  getState() {
    return {
      id: this.id,
      type: 'fake-admin-panel',
      style: this.config.style,
      requestCount: this.state.requestCount,
      loginAttempts: this.state.loginAttempts.length,
      mfaAttempts: this.state.mfaAttempts.length,
      credentialsHarvested: this.state.credentialsHarvested.length
    };
  }
}

export default FakeAdminPanel;
