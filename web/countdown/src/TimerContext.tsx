import React, { createContext, useState, useEffect, useContext } from "react";

const TimerContext = createContext(0);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    return <TimerContext.Provider value={time}>{children}</TimerContext.Provider>;
}

export function useTimer() {
    return useContext(TimerContext);
}
