import { api } from "./api";

export interface LoginResponse {
  message: string;
  home_page?: string;
  full_name?: string;
}

/**
 * Validate user credentials without creating a session
 * We use token-based authentication, not session cookies
 */
export const validateCredentials = async (email: string, password: string) => {
  try {
    // Use a lightweight endpoint to validate credentials
    const res = await api.post('/api/method/frappe.auth.get_logged_user', {
      usr: email,
      pwd: password
    });
    
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    }
    throw error;
  }
};

/**
 * Fetch user details with roles
 * Explicitly request the roles field to ensure it's included
 */
export const fetchUser = async (email: string) => {
  try {
    // Fetch user with roles field explicitly
    const res = await api.get(`/api/resource/User/${email}`, {
      params: {
        fields: JSON.stringify([
          "name",
          "email", 
          "full_name",
          "phone",
          "company",
          "roles"
        ])
      }
    });
    
    console.log('✅ User data fetched:', res.data.data);
    return res.data.data;
  } catch (error) {
    console.error('❌ Failed to fetch user:', error);
    throw error;
  }
};

/**
 * Check if there's an active session
 * Note: In production, we rely on token auth, not sessions
 */
export const checkSession = async () => {
  try {
    const res = await api.get("/api/method/frappe.auth.get_logged_user");
    return res.data.message; // Returns email if logged in, or "Guest" if not
  } catch (error) {
    return null;
  }
};
