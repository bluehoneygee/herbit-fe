"use client";

import { createContext, useContext } from "react";

const ProfileSummaryContext = createContext(undefined);

export function ProfileSummaryProvider({ value, children }) {
  return (
    <ProfileSummaryContext.Provider value={value}>
      {children}
    </ProfileSummaryContext.Provider>
  );
}

export function useProfileSummaryContext() {
  const context = useContext(ProfileSummaryContext);
  if (!context) {
    throw new Error(
      "useProfileSummaryContext harus dipanggil di dalam ProfileSummaryProvider"
    );
  }
  return context;
}
