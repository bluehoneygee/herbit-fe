// src/hooks/useAuth.js
"use client";
import { useState, useEffect } from "react";
import { meApi } from "@/lib/auth";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await meApi();
        setUser(userData);
      } catch (err) {
        console.warn("User not logged in or session expired");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}