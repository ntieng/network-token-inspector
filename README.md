# 🔐 Network Token Inspector

A powerful DevTools extension that provides comprehensive network request monitoring and token analysis. Built with a modern dark theme and real-time capabilities, it streamlines the inspection of authorization tokens from HTTP requests within DevTools.

## ✨ Key Features

### 🌐 **Network-Focused Token Monitoring**
- **Real-time Detection**: Automatically monitors and captures network requests with Authorization headers
- **DevTools-like Interface**: Familiar request display with method badges, URLs, status codes, and timestamps
- **Auto-refresh**: Optional automatic monitoring with 3-second intervals
- **Request Filtering**: Focuses specifically on requests containing authorization tokens

### 🔓 **Advanced JWT Analysis**
- **Smart JWT Detection**: Automatically identifies JWT tokens and provides detailed decoding
- **Timestamp Conversion**: Converts Unix timestamps (iat, exp, nbf) to human-readable local time
- **Expiration Validation**: Visual indicators for token validity (✅ Valid / ⚠️ EXPIRED)
- **Complete JWT Structure**: Displays header, payload, and signature sections with syntax highlighting

### 🎨 **Modern User Interface**
- **Dark Theme**: Professional cyberpunk-inspired design with gradient backgrounds
- **Expandable Cards**: Clean request cards with smooth expand/collapse animations
- **Tabbed Interface**: Organized tabs for Raw Token, Decoded JWT, and Request Headers
- **Visual Feedback**: Loading states, success/error indicators, and hover effects

### 🛠️ **Developer Tools**
- **Multiple Copy Options**: Copy raw tokens, full headers, or decoded content
- **JWT.io Integration**: Direct links to inspect tokens on jwt.io
- **Request Statistics**: Live count of monitored requests and last update time
- **Clear All**: Quick reset functionality to clear all stored requests

### 🔒 **Security & Privacy**
- **Local Processing**: All token analysis happens locally in your browser
- **No Data Collection**: Extension doesn't send data to external servers
- **Open Source**: Full source code available for security verification

## 🚀 How to Use

1. **Install the Extension**: Load the extension in Developer Mode
2. **Open DevTools**: Press F12 or right-click → Inspect Element
3. **Find Token Inspector**: Look for the "Token inspector" panel tab
4. **Monitor Requests**: 
   - Toggle auto-refresh for real-time monitoring
   - Or use manual refresh to capture current requests
5. **Analyze Tokens**:
   - Click on any request to expand details
   - Switch between Raw Token, Decoded JWT, and Headers tabs
   - Copy tokens or inspect them on JWT.io

## 📋 Request Display

Each captured request shows:
- **HTTP Method**: Color-coded badges (GET, POST, PUT, DELETE, etc.)
- **URL**: Full request URL with domain highlighting
- **Status Code**: Color-coded response status
- **Timestamp**: Relative time (e.g., "2m ago", "1h ago")
- **Expandable Details**: Click to reveal token analysis tabs

## 🔧 JWT Token Analysis

For JWT tokens, the extension provides:
- **Header Information**: Algorithm, token type, and other metadata
- **Payload Data**: Claims with automatic timestamp conversion
- **Signature**: Raw signature data
- **Validation**: Expiration status and time remaining

## 🎯 Use Cases

- **API Development**: Quickly inspect and copy authorization tokens
- **Debugging**: Analyze token expiration and claims
- **Security Testing**: Verify token structure and content
- **Integration Testing**: Monitor token flow across requests
- **Development Workflow**: Streamline token handling in applications

## 🌐 Browser Support

Currently optimized for **Chrome** and **Edge** with DevTools Extension API support.

## 🔄 Version 1.0.0 Features

- Complete UI redesign with modern dark theme
- Real-time network request monitoring
- Advanced JWT decoding with timestamp interpretation
- Tabbed interface for better organization
- Enhanced copy functionality with fallback methods
- Auto-refresh capabilities
- Request statistics and management
- Improved error handling and user feedback

---

**Save time and enhance your development workflow with Network Token Inspector. Perfect for developers working with JWT tokens, API authentication, and network request analysis.** 🛠️
