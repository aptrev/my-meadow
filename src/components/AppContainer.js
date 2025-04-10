import Container from 'react-bootstrap/Container'

const AppContainer = ({ theme, children }) => {

    return (
        <div className='app position-relative flex-grow-1 m-0 p-0' style={{ backgroundColor: 'var(--primaryLightGreen)' }}>
            <Container
                fluid
                className='w-100 m-auto p-4'
                style={{ height: 'calc(100dvh - 75px)', margin: '64px auto', scrollMarginTop: '75px' }}
            >
                <Container className='mx-auto d-flex flex-column align-items-center'>
                    {children}
                </Container>
            </Container>
        </div>
    );
};

export default AppContainer;