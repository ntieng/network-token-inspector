// panel.js - Enhanced Token Inspector with Improved UI
class TokenInspector {
  constructor() {
    this.requests = new Map();
    this.autoRefresh = false;
    this.refreshInterval = null;
    this.lastUpdated = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    // Only start auto-refresh if it's enabled
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
    this.loadInitialRequests();
  }

  setupEventListeners() {
    // Auto-refresh toggle
    const autoRefreshToggle = document.getElementById('auto-refresh');
    
    // Sync checkbox with current autoRefresh state
    autoRefreshToggle.checked = this.autoRefresh;
    
    autoRefreshToggle.addEventListener('change', (e) => {
      this.autoRefresh = e.target.checked;
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    });

    // Manual refresh button
    const manualRefreshBtn = document.getElementById('manual-refresh');
    manualRefreshBtn.addEventListener('click', () => {
      this.showRefreshLoading();
      this.refreshRequests();
    });

    // Clear all button
    const clearAllBtn = document.getElementById('clear-all');
    clearAllBtn.addEventListener('click', () => {
      this.clearAllRequests();
    });

    // Listen for new network requests
    chrome.devtools.network.onRequestFinished.addListener((request) => {
      this.handleNewRequest(request);
    });
  }

  showRefreshLoading() {
    const refreshBtn = document.getElementById('manual-refresh');
    const originalText = refreshBtn.textContent;
    refreshBtn.innerHTML = '</div> Refreshing...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
      refreshBtn.textContent = originalText;
      refreshBtn.disabled = false;
    }, 1000);
  }

  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {
      this.refreshRequests();
    }, 5000); // Refresh every 5 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadInitialRequests() {
    chrome.devtools.network.getHAR((harLog) => {
      this.processHAREntries(harLog.entries);
      this.renderRequests();
      this.updateStats();
    });
  }

  refreshRequests() {
    chrome.devtools.network.getHAR((harLog) => {
      this.processHAREntries(harLog.entries);
      this.renderRequests();
      this.updateStats();
    });
  }

  handleNewRequest(request) {
    if (this.hasAuthorizationToken(request.request)) {
      this.processRequest(request);
      if (this.autoRefresh) {
        this.renderRequests();
        this.updateStats();
      }
    }
  }

  processHAREntries(entries) {
    entries.forEach(entry => {
      if (this.hasAuthorizationToken(entry.request)) {
        this.processRequest(entry);
      }
    });
  }

  processRequest(entry) {
    const requestId = this.generateRequestId(entry);
    const authHeader = this.getAuthorizationHeader(entry.request);
    
    if (authHeader) {
      this.requests.set(requestId, {
        id: requestId,
        url: entry.request.url,
        method: entry.request.method,
        status: entry.response?.status || 'pending',
        statusText: entry.response?.statusText || '',
        timestamp: new Date(entry.startedDateTime),
        authHeader: authHeader.value,
        request: entry.request,
        response: entry.response
      });
    }
  }

  hasAuthorizationToken(request) {
    return request.headers.some(header => 
      header.name.toLowerCase() === 'authorization'
    );
  }

  getAuthorizationHeader(request) {
    return request.headers.find(header => 
      header.name.toLowerCase() === 'authorization'
    );
  }

  generateRequestId(entry) {
    return `${entry.request.method}-${entry.request.url}-${entry.startedDateTime}`;
  }

  updateStats() {
    const statsBar = document.getElementById('stats-bar');
    const requestCount = document.getElementById('request-count');
    const lastUpdated = document.getElementById('last-updated');
    
    if (this.requests.size > 0) {
      statsBar.style.display = 'flex';
      requestCount.textContent = this.requests.size;
      lastUpdated.textContent = new Date().toLocaleTimeString();
    } else {
      statsBar.style.display = 'none';
    }
  }

  renderRequests() {
    const container = document.getElementById('requests-container');
    
    if (this.requests.size === 0) {
      container.innerHTML = `
        <div class="no-tokens">
          <div class="no-tokens-icon">🔍</div>
          <h3>No Token Requests Found</h3>
          <p>Make network requests with Authorization headers to see them here.<br>
          The inspector will automatically detect and analyze tokens in real-time.</p>
        </div>
      `;
      return;
    }

    const requestsArray = Array.from(this.requests.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = requestsArray.map(request => 
      this.renderRequest(request)
    ).join('');

    // Add event listeners for expand/collapse
    this.setupRequestEventListeners();
  }

  renderRequest(request) {
    const domain = new URL(request.url).hostname;
    const path = new URL(request.url).pathname + new URL(request.url).search;
    const statusClass = this.getStatusClass(request.status);
    const timeAgo = this.getTimeAgo(request.timestamp);
    
    return `
      <div class="network-request" data-request-id="${request.id}">
        <div class="request-header">
          <div class="request-info">
            <span class="request-method ${request.method}">${request.method}</span>
            <span class="request-url" title="${request.url}">${domain}${path}</span>
          </div>
          <div class="request-meta">
            <span class="request-time">${timeAgo}</span>
            <span class="request-status ${statusClass}">${request.status}</span>
            <span class="expand-icon">▶</span>
          </div>
        </div>
        <div class="request-details">
          ${this.renderTokenTabs(request)}
        </div>
      </div>
    `;
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  }

  renderTokenTabs(request) {
    const token = this.extractToken(request.authHeader);
    const isJWT = this.isJWT(token);
    const requestId = request.id.replace(/[^a-zA-Z0-9]/g, '');
    
    return `
      <div class="token-tabs">
        <button class="token-tab active" data-tab-target="raw-${requestId}">
          🔑 Raw Token
        </button>
        ${isJWT ? `<button class="token-tab" data-tab-target="decoded-${requestId}">
          🔓 Decoded JWT
        </button>` : ''}
        <button class="token-tab" data-tab-target="headers-${requestId}">
          📋 Headers
        </button>
      </div>
      
      <div class="token-content active" data-tab="raw-${requestId}">
        <div class="token-actions">
          <button class="btn btn-primary jwt-io-btn" data-token="${this.escapeHtml(token)}">
            🔍 Inspect in JWT.io
          </button>
          <button class="btn copy-token-btn" data-text="${this.escapeHtml(token)}">
            📋 Copy Token
          </button>
          <button class="btn copy-header-btn" data-text="${this.escapeHtml(request.authHeader)}">
            📋 Copy Full Header
          </button>
        </div>
        <div class="token-display">
          <div class="token-header">Token</div>
          ${this.escapeHtml(token)}
        </div>
      </div>
      
      ${isJWT ? this.renderJWTDecoded(token, requestId) : ''}
      
      <div class="token-content" data-tab="headers-${requestId}">
        <div class="token-display">
          <div class="token-header">Request Headers</div>
          ${request.request.headers.map(header => 
            `<strong>${this.escapeHtml(header.name)}:</strong> ${this.escapeHtml(header.value)}`
          ).join('<br>')}
        </div>
      </div>
    `;
  }

  renderJWTDecoded(token, requestId) {
    try {
      const decoded = this.decodeJWT(token);
      
      // Process payload to add human-readable timestamps
      const processedPayload = this.processJWTPayload(decoded.payload);
      
      return `
        <div class="token-content" data-tab="decoded-${requestId}">
          <div class="token-actions">
            <button class="btn btn-primary jwt-io-btn" data-token="${this.escapeHtml(token)}">
              🔍 Inspect in JWT.io
            </button>
            <button class="btn copy-token-btn" data-text="${this.escapeHtml(token)}">
              📋 Copy Token
            </button>
          </div>
          <div class="jwt-decoded">
            <div class="jwt-section">
              <h4>🔧 Header</h4>
              <div class="jwt-json">${JSON.stringify(decoded.header, null, 2)}</div>
            </div>
            <div class="jwt-section">
              <h4>📦 Payload</h4>
              <div class="jwt-json">${JSON.stringify(processedPayload, null, 2)}</div>
            </div>
            ${decoded.signature ? `
              <div class="jwt-section">
                <h4>✍️ Signature</h4>
                <div class="token-display">
                  <div class="token-header">Signature</div>
                  ${decoded.signature}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } catch (error) {
      return `
        <div class="token-content" data-tab="decoded-${requestId}">
          <div class="jwt-decoded">
            <div class="jwt-section">
              <h4>❌ Error</h4>
              <div class="jwt-json" style="color: #dc3545;">Error decoding JWT: ${error.message}</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  processJWTPayload(payload) {
    const processed = { ...payload };
    
    // Convert iat (issued at) timestamp
    if (payload.iat && typeof payload.iat === 'number') {
      const iatDate = new Date(payload.iat * 1000);
      processed.iat = `${payload.iat} (${iatDate.toLocaleString()})`;
    }
    
    // Convert exp (expiration) timestamp
    if (payload.exp && typeof payload.exp === 'number') {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      const timeStatus = isExpired ? '⚠️ EXPIRED' : '✅ Valid';
      processed.exp = `${payload.exp} (${expDate.toLocaleString()}) ${timeStatus}`;
    }
    
    // Convert nbf (not before) timestamp if present
    if (payload.nbf && typeof payload.nbf === 'number') {
      const nbfDate = new Date(payload.nbf * 1000);
      processed.nbf = `${payload.nbf} (${nbfDate.toLocaleString()})`;
    }
    
    return processed;
  }

  extractToken(authHeader) {
    // Remove 'Bearer ' prefix if present
    return authHeader.replace(/^Bearer\s+/i, '');
  }

  isJWT(token) {
    return token.split('.').length === 3;
  }

  decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signature = parts[2];

    return { header, payload, signature };
  }

  getStatusClass(status) {
    if (status >= 200 && status < 300) return 'status-200';
    if (status >= 400 && status < 500) return 'status-400';
    if (status >= 500) return 'status-500';
    return '';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupRequestEventListeners() {
    const container = document.getElementById('requests-container');
    
    // Remove existing event listeners to prevent duplicates
    container.removeEventListener('click', this.handleContainerClick);
    
    // Add event delegation for all interactive elements
    this.handleContainerClick = (event) => {
      const target = event.target;
      
      // Handle request header clicks for expanding/collapsing
      if (target.classList.contains('request-header') || target.closest('.request-header')) {
        const header = target.classList.contains('request-header') ? target : target.closest('.request-header');
        const requestElement = header.closest('.network-request');
        const detailsElement = requestElement.querySelector('.request-details');
        
        // Toggle expanded state
        requestElement.classList.toggle('expanded');
        detailsElement.classList.toggle('expanded');
        return;
      }
      
      // Handle JWT.io button clicks
      if (target.classList.contains('jwt-io-btn')) {
        const token = target.getAttribute('data-token');
        if (token) {
          // Visual feedback
          const originalText = target.textContent;
          target.textContent = '🚀 Opening JWT.io...';
          target.style.opacity = '0.7';
          
          const jwtUrl = `https://jwt.io/?token=${encodeURIComponent(token)}`;
          window.open(jwtUrl, '_blank');
          
          // Reset button after a short delay
          setTimeout(() => {
            target.textContent = originalText;
            target.style.opacity = '1';
          }, 1500);
        }
        return;
      }
      
      // Handle copy token button clicks
      if (target.classList.contains('copy-token-btn')) {
        const text = target.getAttribute('data-text');
        this.copyToClipboard(text, target);
        return;
      }
      
      // Handle copy header button clicks
      if (target.classList.contains('copy-header-btn')) {
        const text = target.getAttribute('data-text');
        this.copyToClipboard(text, target);
        return;
      }
      
      // Handle tab switching
      if (target.classList.contains('token-tab')) {
        const tabTarget = target.getAttribute('data-tab-target');
        const tabContainer = target.closest('.request-details');
        
        // Remove active class from all tabs and content
        tabContainer.querySelectorAll('.token-tab').forEach(tab => tab.classList.remove('active'));
        tabContainer.querySelectorAll('.token-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        target.classList.add('active');
        const targetContent = tabContainer.querySelector(`[data-tab="${tabTarget}"]`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
        return;
      }
    };
    
    container.addEventListener('click', this.handleContainerClick);
  }

  copyToClipboard(text, button) {
    const originalText = button.textContent;
    
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Select and copy the text
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        this.showCopySuccess(button, originalText);
      } else {
        this.showCopyError(button, originalText);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      this.showCopyError(button, originalText);
    }
  }

  showCopySuccess(button, originalText) {
    button.textContent = '✓ Copied!';
    button.style.background = '#28a745';
    button.style.color = 'white';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  }

  showCopyError(button, originalText) {
    button.textContent = '❌ Failed';
    button.style.background = '#dc3545';
    button.style.color = 'white';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  }

  clearAllRequests() {
    // Show visual feedback
    const clearBtn = document.getElementById('clear-all');
    const originalText = 'Clear All'; // Use the actual text without CSS icon
    clearBtn.textContent = 'Clearing...';
    clearBtn.style.opacity = '0.7';
    
    // Clear the requests
    this.requests.clear();
    
    // Update the UI
    this.renderRequests();
    this.updateStats();
    
    // Reset button after a short delay
    setTimeout(() => {
      clearBtn.textContent = originalText;
      clearBtn.style.opacity = '1';
    }, 1000);
  }
}

// Initialize the Token Inspector when the panel loads
let tokenInspector;

// Function to be called from devtools.js when panel is shown
window.initializeTokenInspector = function() {
  if (!tokenInspector) {
    tokenInspector = new TokenInspector();
  }
};

// Initialize immediately if the panel is already visible
document.addEventListener('DOMContentLoaded', () => {
  tokenInspector = new TokenInspector();
});
