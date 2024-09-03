"use client";
import useAuth from "@/store/user";
import * as React from "react";

const Hydration = () => {
    React.useEffect(() => {
        useAuth.persist.rehydrate();
    }, []);

    return null;
};

export default Hydration;