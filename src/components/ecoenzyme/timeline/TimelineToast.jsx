"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react";

export function useToast() {
    const [toasts, setToasts] = useState([]);
    
    useEffect(() => {
        if (!toasts.length) return;
        const timers = toasts.map((t) =>
            setTimeout(() => {
                setToasts((prev) => prev.filter((pt) => pt.id !== t.id));
            }, t.duration || 3000));
        return () => timers.forEach((t) => clearTimeout(t));
    }, [toasts]);

    const push = useCallback((msg, opts = {}) => {
        const id = Math.random().toString(36).slice(2, 9);
        setToasts((t) => [...t, { id, message: msg, ...opts }]);
    }, []);

    const remove = useCallback((id) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    return useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);
}

export function ToastContainer({ toasts = [], remove = () => {} }) {
    return (
        <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div 
                    key={t.id} 
                    className="bg-white shadow-xl rounded-lg px-4 py-2 border-l-4 border-purple-600 w-80 pointer-events-auto"
                >
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-800">{t.message}</div>
                        <button 
                            className="text-xs text-gray-400 ml-2 p-1 hover:text-gray-800 transition-colors" 
                            onClick={() => remove(t.id)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
