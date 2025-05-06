// utils/auth.js
export const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return !!user;
    }
    return false;
  };
  
  export const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  };