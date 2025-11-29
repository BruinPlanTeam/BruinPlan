import { createContext, useContext, useState, useEffect } from 'react';

const MajorContext = createContext();
const STORAGE_KEY = 'storedMajor'

function getMajor(){
    const storedMajor = localStorage.getItem(STORAGE_KEY);
    return storedMajor ? JSON.parse(storedMajor) : null
}

export function MajorProvider({ children }) {
    const [major, setMajor] = useState(getMajor);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(major));
    }, [major]);

    const handleMajorSelect = (selectedMajor) => {
        setMajor(selectedMajor);
        console.log("major: ", selectedMajor)
    };

    const value = { major, handleMajorSelect };

    return (
        <MajorContext.Provider value={value}>
            {children}
        </MajorContext.Provider>
    );
}

export const useMajor = () => {
    return useContext(MajorContext);
};