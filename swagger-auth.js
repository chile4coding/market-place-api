console.log('Swagger auth script loaded');

let accessToken = localStorage.getItem('accessToken') || '';
let refreshToken = localStorage.getItem('refreshToken') || '';

function addTokenManager() {
  console.log('addTokenManager called');
  const container = document.querySelector('.topbar');
  console.log('Container found:', container);
  
  if (!container) {
    console.log('No container found, retrying...');
    setTimeout(addTokenManager, 1000);
    return;
  }
  
  if (document.getElementById('token-manager')) {
    console.log('Already added');
    return;
  }

  const tokenDiv = document.createElement('div');
  tokenDiv.id = 'token-manager';
  tokenDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-right: 20px;';
  tokenDiv.innerHTML = `
    <input type="text" id="access-token-input" placeholder="Access Token" value="${accessToken}" 
      style="padding: 5px; width: 200px; border: 1px solid #ccc; border-radius: 3px;">
    <button onclick="window.setToken()" style="padding: 5px 10px; cursor: pointer;">Set Token</button>
    <button onclick="window.loginAndSetToken()" style="padding: 5px 10px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 3px;">Login</button>
    <button onclick="window.refreshToken()" style="padding: 5px 10px; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 3px;">Refresh</button>
    <span id="token-status" style="font-size: 12px; color: #666;"></span>
  `;

  const style = document.createElement('style');
  style.textContent = '.swagger-ui .topbar { display: flex !important; }';
  document.head.appendChild(style);
  container.insertBefore(tokenDiv, container.firstChild);
  
  console.log('Token manager added to DOM');
}

window.setToken = function() {
  const input = document.getElementById('access-token-input');
  accessToken = input.value;
  localStorage.setItem('accessToken', accessToken);
  
  document.getElementById('token-status').textContent = 'Token set!';
  setTimeout(() => document.getElementById('token-status').textContent = '', 2000);
};

window.loginAndSetToken = async function() {
  const email = prompt('Enter email:');
  const password = prompt('Enter password:');
  
  if (!email || !password) return;

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success && data.data.accessToken) {
      accessToken = data.data.accessToken;
      refreshToken = data.data.refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      document.getElementById('access-token-input').value = accessToken;
      window.setToken();
      
      document.getElementById('token-status').textContent = 'Logged in!';
    } else {
      document.getElementById('token-status').textContent = 'Login failed: ' + data.message;
    }
  } catch (error) {
    document.getElementById('token-status').textContent = 'Error: ' + error.message;
  }
};

window.refreshToken = async function() {
  if (!refreshToken) {
    document.getElementById('token-status').textContent = 'No refresh token';
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();

    if (data.success && data.data.accessToken) {
      accessToken = data.data.accessToken;
      refreshToken = data.data.refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      document.getElementById('access-token-input').value = accessToken;
      window.setToken();
      
      document.getElementById('token-status').textContent = 'Token refreshed!';
    } else {
      document.getElementById('token-status').textContent = 'Refresh failed';
    }
  } catch (error) {
    document.getElementById('token-status').textContent = 'Error: ' + error.message;
  }
};

// Try to add on load
setTimeout(addTokenManager, 1500);
window.addEventListener('load', function() {
  setTimeout(addTokenManager, 1500);
});
