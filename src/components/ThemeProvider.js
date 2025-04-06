import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDoc, updateDoc, doc } from "firebase/firestore";
import db from '../firebase/FirebaseDB'

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
    const [colorMode, setColorMode] = useState('light');

    const onSelectGarden = (id) => {

        localStorage.setItem('selectedGardenId', id);

        return id;
    }

    const onColorModeChange = (color) => {
        if (color === 'light' || color === 'dark') {
            setColorMode(color);
            return color;
        } else {
            setColorMode('system');
            return 'system';
        }
    }

    // useEffect(() => {
        
        
    // }, [selectedGardenId]);

    const themeValue = {
        colorMode,
        onColorModeChange,
    };

    return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ThemeProvider;