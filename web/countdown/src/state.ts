import { create } from "zustand";
import { persist } from "zustand/middleware";

type Countdown = {
    variant: "countdown";
    end: number;
    label: string;
    units: Unit[];
    enabled: boolean;
};

type Duration = Omit<Countdown, "variant"> & {
    variant: "duration";
    start: number;
};

export type Unit = "year" | "month" | "day" | "hour" | "minute" | "second";
export const ALL_UNITS: Unit[] = ["year", "month", "day", "hour", "minute", "second"];
export const DEFAULT_UNITS: Unit[] = ["day", "hour", "minute", "second"];

type State = {
    id: number;
    countdowns: Record<number, Countdown | Duration>;
};

type Actions = {
    createCountdown: (variant: "countdown" | "duration") => void;
    addCountdown: (id: number, countdown: Countdown | Duration) => void;
    removeCountdown: (id: number) => void;
    changeVariant: (id: number, variant: "countdown" | "duration") => void;
    setLabel: (id: number, label: string) => void;
    setUnits: (id: number, units: Unit[]) => void;
    setStart: (id: number, start: number) => void;
    setEnd: (id: number, end: number) => void;
    setEnabled: (id: number, enabled: boolean) => void;
};

export const useAppState = create(
    persist<State & Actions>(
        set => ({
            id: 0,
            countdowns: {},

            createCountdown: variant => {
                let countdown: Countdown | Duration = {
                    variant: "countdown",
                    end: Date.now(),
                    label: "",
                    units: DEFAULT_UNITS,
                    enabled: true,
                };
                if (variant === "duration") {
                    countdown = {
                        ...countdown,
                        variant: "duration",
                        start: Date.now(),
                    };
                }

                set(state => ({ countdowns: { ...state.countdowns, [state.id]: countdown }, id: state.id + 1 }));
            },

            addCountdown: (id, countdown) => {
                set(state => ({ countdowns: { ...state.countdowns, [id]: countdown } }));
            },

            removeCountdown: id => {
                set(state => {
                    const { [id]: _, ...countdowns } = state.countdowns;
                    return { countdowns };
                });
            },

            setLabel: (id, label) => {
                set(state => ({ countdowns: { ...state.countdowns, [id]: { ...state.countdowns[id], label } } }));
            },

            changeVariant: (id, newVariant) => {
                set(state => {
                    const countdown = state.countdowns[id];
                    if (countdown.variant === newVariant) return state;

                    let newCountdown: Countdown | Duration;
                    if (countdown.variant === "duration") {
                        const { start: _, ...rest } = countdown;
                        newCountdown = {
                            ...rest,
                            variant: "countdown",
                        };
                    } else {
                        newCountdown = {
                            ...countdown,
                            variant: "duration",
                            start: countdown.end,
                        };
                    }

                    return { countdowns: { ...state.countdowns, [id]: newCountdown } };
                });
            },

            setUnits: (id, units) => {
                if (units.length === 0) {
                    units = ["second"];
                } else {
                    units.sort((a, b) => ALL_UNITS.indexOf(a) - ALL_UNITS.indexOf(b));
                }
                set(state => ({ countdowns: { ...state.countdowns, [id]: { ...state.countdowns[id], units } } }));
            },

            setStart: (id, start) => {
                set(state => {
                    const countdown = state.countdowns[id];
                    if (countdown.variant === "countdown") {
                        return state;
                    }

                    return { countdowns: { ...state.countdowns, [id]: { ...state.countdowns[id], start } } };
                });
            },

            setEnd: (id, end) => {
                set(state => ({ countdowns: { ...state.countdowns, [id]: { ...state.countdowns[id], end } } }));
            },

            setEnabled: (id, enabled) => {
                set(state => ({ countdowns: { ...state.countdowns, [id]: { ...state.countdowns[id], enabled } } }));
            },
        }),
        { name: "countdowns" }
    )
);

export const useDarkMode = create(
    persist<{ darkMode: boolean; toggleDarkMode: () => void }>(
        set => ({
            darkMode: false,
            toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
        }),
        { name: "dark-mode" }
    )
);
