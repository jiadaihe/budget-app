// Example client-side usage of the authentication API

const API_BASE_URL = 'http://localhost:3001/api';

// Sign up a new user
async function signUp(email, password, displayName) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Signup successful:', data);
      // Store the custom token for authentication
      localStorage.setItem('authToken', data.customToken);
      return data;
    } else {
      console.error('Signup failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

// Login existing user
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Login successful:', data);
      // Store the custom token for authentication
      localStorage.setItem('authToken', data.customToken);
      return data;
    } else {
      console.error('Login failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get user profile (protected route)
async function getProfile() {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('Profile retrieved:', data);
      return data;
    } else {
      console.error('Profile retrieval failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
}

// Logout (clear stored token)
function logout() {
  localStorage.removeItem('authToken');
  console.log('Logged out successfully');
}

// Example usage
async function example() {
  try {
    // Sign up a new user
    console.log('=== Signing up new user ===');
    await signUp('test@example.com', 'password123', 'Test User');
    
    // Login with the same credentials
    console.log('\n=== Logging in ===');
    await login('test@example.com', 'password123');
    
    // Get user profile
    console.log('\n=== Getting profile ===');
    await getProfile();
    
    // Logout
    console.log('\n=== Logging out ===');
    logout();
    
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    signUp,
    login,
    getProfile,
    logout,
    example,
  };
} 