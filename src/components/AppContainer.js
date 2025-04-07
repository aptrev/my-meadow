import Container from 'react-bootstrap/Container'

const AppContainer = ({ theme, children }) => {

    return (
        <div className='app' style={{backgroundColor: 'var(--primaryLightGreen)'}}>
            <Container className='d-flex flex-column justify-content-center align-items-center m-4 mx-auto px-4'>
                {children}
            </Container>
        </div>
    );
};

export default AppContainer;