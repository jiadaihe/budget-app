import { getIdToken } from "./auth";

const API_BASE_URL = "http://localhost:3001/api";

// Generic function to make authenticated requests to the backend
async function authenticatedRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const token = await getIdToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Get user profile from backend
export async function getProfile() {
  return await authenticatedRequest("/profile");
}

// Health check
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return await response.json();
} 