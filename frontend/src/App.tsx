import React, { useState, useEffect } from 'react';
import { signup, login, logout, getCurrentUser, onAuthChange } from './auth';
import { getProfile, healthCheck } from './api';
import './App.css';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface Profile {
  message: string;
  user: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Unknown');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Image preview effect
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const checkBackendHealth = async () => {
    try {
      await healthCheck();
      setBackendStatus('Connected');
    } catch (error) {
      setBackendStatus('Disconnected');
      console.error('Backend health check failed:', error);
    }
  };

  const handleAuth = async (authFunction: () => Promise<any>, action: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authFunction();
      setSuccess(`${action} successful!`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    handleAuth(
      () => signup(email, password),
      'Signup'
    );
  };

  const handleLogin = () => {
    handleAuth(
      () => login(email, password),
      'Login'
    );
  };

  const handleLogout = () => {
    handleAuth(
      () => logout(),
      'Logout'
    );
  };

  const handleGetProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const profileData = await getProfile();
      setProfile(profileData);
      setSuccess('Profile retrieved successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Image upload and analyze handler
  const handleImageUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzeResult(null);
    setAnalyzeError(null);
    if (!selectedFile) {
      setAnalyzeError('Please select an image.');
      return;
    }
    setAnalyzeLoading(true);
    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append('image', selectedFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Image upload failed');
      const { filename } = await uploadRes.json();
      // 2. Analyze image
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath: filename }),
      });
      if (!analyzeRes.ok) throw new Error('Image analysis failed');
      const data = await analyzeRes.json();
      setAnalyzeResult(data.analysis);
    } catch (err: any) {
      setAnalyzeError(err.message || 'Unknown error');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Firebase Auth Demo</h1>
        <div className="status-bar">
          <span className={`status ${backendStatus === 'Connected' ? 'connected' : 'disconnected'}`}>
            Backend: {backendStatus}
          </span>
          {user && (
            <span className="user-status">
              Logged in as: {user.email}
            </span>
          )}
        </div>
      </header>

      <main className="App-main">
        {!user ? (
          <div className="auth-form">
            <h2>Sign In / Sign Up</h2>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="button-group">
              <button 
                onClick={handleSignup} 
                disabled={loading || !email || !password}
                className="btn btn-primary"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
              <button 
                onClick={handleLogin} 
                disabled={loading || !email || !password}
                className="btn btn-secondary"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        ) : (
          <div className="user-panel">
            <h2>Welcome, {user.email}!</h2>
            <div className="button-group">
              <button 
                onClick={handleGetProfile} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Loading...' : 'Get Profile from Backend'}
              </button>
              <button 
                onClick={handleLogout} 
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}

        <section className="analyze-section">
          <h2>Analyze a Receipt Image</h2>
          <form onSubmit={handleImageUploadAndAnalyze}>
            <input
              type="file"
              accept="image/*"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              disabled={analyzeLoading}
            />
            {previewUrl && (
              <div style={{ margin: '1em 0' }}>
                <img src={previewUrl} alt="Preview" style={{ maxWidth: 300, maxHeight: 300 }} />
              </div>
            )}
            <button type="submit" disabled={analyzeLoading || !selectedFile} className="btn btn-primary">
              {analyzeLoading ? 'Analyzing...' : 'Upload & Analyze'}
            </button>
          </form>
          {analyzeError && <div className="error-message">{analyzeError}</div>}
          {analyzeResult && (
            <div className="analyze-result">
              <h3>Analysis Result</h3>
              <pre>{analyzeResult}</pre>
            </div>
          )}
        </section>

        {profile && (
          <div className="profile-section">
            <h3>Backend Profile Response</h3>
            <pre className="profile-data">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <strong>Success:</strong> {success}
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 