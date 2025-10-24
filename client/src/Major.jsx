import { createContext, useContext, useState } from 'react';

const MajorContext = createContext();

export function MajorProvider({ children }) {
    const [major, setMajor] = useState(null);

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