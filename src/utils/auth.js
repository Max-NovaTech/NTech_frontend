// Authentication utility functions

export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
  };
  
  export const isValidAuth = () => {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('role');
    
    return token && 
           isLoggedIn === 'true' && 
           role && 
           token.trim() !== '' && 
           role.trim() !== '';
  };
  
  export const logout = () => {
    clearAuthData();
    window.location.href = '/login';
  };
  