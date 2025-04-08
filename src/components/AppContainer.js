import Container from 'react-bootstrap/Container'
import React, { useEffect, useState, useCallback } from 'react';

const AppContainer = ({ theme, children }) => {

    const [appHeight, setAppHeight] = useState(window.innerHeight);

    const updateSize = useCallback(() => {
        const headerHeight = Math.ceil(document.getElementById('siteHeader').getBoundingClientRect().height);
        setAppHeight(window.innerHeight - headerHeight);
    }, []);

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    }, [updateSize]);

    return (
        <div className='app' style={{ backgroundColor: 'var(--primaryLightGreen)', height: `${appHeight}px` }}>
            <Container className='d-flex flex-column justify-content-center align-items-center m-4 mx-auto px-4'>
                {children}
            </Container>
        </div>
    );
};

export default AppContainer;