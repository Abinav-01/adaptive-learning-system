import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Re-fetch user if token exists on load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get("/users/me");
          setUser(res.data);
        } catch (err) {
          console.error("Token verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    // FastAPI expects OAuth2PasswordRequestForm data (form-urlencoded) for login
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const res = await api.post("/users/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token } = res.data;
    setToken(access_token);
    localStorage.setItem("token", access_token);

    // Fetch the user data next
    const userRes = await api.get("/users/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    setUser(userRes.data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
