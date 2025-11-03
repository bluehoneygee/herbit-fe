"use client";

import { useState, useEffect } from "react";

export function useUserProject(userId) {
  const [isFinalClaimed, setIsFinalClaimed] = useState(false);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    // TODO: cek status claim dari backend
    // sementara dummy logic
    setCanClaim(true);
  }, [userId]);

  const handleFinalClaim = async () => {
    setIsFinalClaimed(true);
    alert("Klaim poin berhasil! 🎉");
    // TODO: request ke backend
  };

  return {
    canClaim,
    isFinalClaimed,
    handleFinalClaim,
  };
}
