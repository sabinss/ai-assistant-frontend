import { create } from "zustand";

type NavBarStore = {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    setCollapse: () => void;
    setOpen: () => void;
    greeting: string;
    setGreeting: (greeting: string) => void;
    botName: string;
    setBotName: (botName: string) => void;
};

const useNavBarStore = create<NavBarStore>((set) => ({
    isCollapsed: true,
    toggleCollapse: () => {
        set((state) => {
            return ({ isCollapsed: !state.isCollapsed });
        })
    },
    setCollapse: () => {
        set((state) => {
            return ({ isCollapsed: true });
        })
    },
    setOpen: () => {
        set((state) => {
            return ({ isCollapsed: false });
        })
    },
    greeting: "Hello X",
    setGreeting: (greeting: string) => {
        set((state) => {
            return ({ greeting });
        })
    },
    botName: "Bot X",
    setBotName(botName: string) {
        set((state) => {
            return ({ botName });
        })
    },

}));

export default useNavBarStore;
