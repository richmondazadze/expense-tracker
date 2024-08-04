"use client";

import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";

export const authContext = createContext({
  user: null,
  loading: false,
  googleLoginHandler: async () => {},
  logout: async () => {},
});

export default function AuthContextProvider({ children }) {
  const [user, loading] = useAuthState(auth);
  const [isNewUser, setIsNewUser] = useState(false);

  const googleProvider = new GoogleAuthProvider(auth);

  useEffect(() => {
    if (user) {
      checkIfNewUser(user.uid);
    }
  }, [user]);

  const checkIfNewUser = async (uid) => {
    try {
      const response = await axios.get(`/api/check-user?uid=${uid}`);
      setIsNewUser(response.data.isNewUser);
      if (response.data.isNewUser) {
        sendWelcomeEmail(user.email, user.displayName);
      }
    } catch (error) {
      console.error("Error checking if user is new:", error);
    }
  };

  const sendWelcomeEmail = async (email, displayName) => {
    try {
      await axios.post("/api/send-email", {
        email,
        displayName,
        isNewUser: true,
      });
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  };

  const googleLoginHandler = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The checkIfNewUser function will be called automatically due to the useEffect hook
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const values = {
    user,
    loading,
    googleLoginHandler,
    logout,
  };

  return <authContext.Provider value={values}>{children}</authContext.Provider>;
}