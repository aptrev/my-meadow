import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../components/AuthProvider";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ReactSVG } from 'react-svg'
import { retrieveGarden, retrieveGardens, updateGarden } from '../../utilities/FirebaseUtils';
import Sidebar from "../Sidebar/Sidebar";
import logo from '../../assets/images/logos/title-logo-white.svg'

// Bootstrap Imports
import { Navbar, Dropdown, Button, Row, Col } from "react-bootstrap";
import { BoxArrowRight, List, Floppy2Fill, PencilSquare } from 'react-bootstrap-icons';

// CSS
import './Header.css';

function Logo({ onClick }) {
    return (
        <div className="svg-wrapper mx-auto">
            <ReactSVG
                className='d-none d-md-block'
                style={{ color: 'white' }}
                src={logo}
                beforeInjection={(svg) => {
                    svg.classList.add('svg-header-logo')
                }}
                onClick={onClick}
                title='My Meadow'
                fallback={() => { return <h1 className='logo-header' style={{ color: 'inherit' }}>My Meadow</h1> }}
            />
        </div>
    );
}

const Header = () => {
    const { pathname } = useLocation();
    const { id } = useParams();
    const { user, logOut } = useContext(AuthContext);
    const [showSidebar, setShowSidebar] = useState(false);
    const [garden, setGarden] = useState(null);
    const [gardens, setGardens] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (pathname.includes('indoor') || pathname.includes('outdoor') || pathname.includes('calendar')) {
            if (user && id) {
                retrieveGarden(id)
                    .then((data) => { setGarden(data) })
                    .catch((e) => {
                        console.error(`Header: Failure to retrieve garden: ${id}: `, e);
                        navigate('/');
                    });
                retrieveGardens(user.uid)
                    .then((data) => { setGardens(data) })
                    .catch((e) => {
                        console.error(`Header: Failure to retrieve gardens: ${user.uid}: `, e);
                        navigate('/');
                    });
            }
        }
    }, [pathname, user, id, navigate]);

    const handleGoHome = () => {
        navigate("/");
    }

    function DefaultElements() {
        return (
            <>
                <div></div>
                <Logo onClick={handleGoHome} />
                <div></div>
            </>
        );
    }

    const handleSignOut = () => {
        logOut()
            .then(() => {
                console.log("User logged out successfully");
                localStorage.clear();
                navigate("/login");
            })
            .catch((error) => console.error(error));
    }

    const handleSave = async () => {
        const savedGarden = JSON.parse(localStorage.getItem('savedGarden'));
        updateGarden(id, savedGarden)
            .catch((e) => {
                console.error(`Error saving garden: ${savedGarden.name}`, e);
            })
        navigate(`${garden.location}/${id}`);
    }

    const handleEdit = () => {
        navigate(`${garden.location}/${id}/edit`);
    }

    const getRightElement = () => {
        if (pathname.includes('edit') || pathname.includes('edit')) {
            return (
                <Button
                    className='d-flex align-items-center'
                    variant="bar"
                    onClick={handleSave}
                    aria-label="Save Garden">
                    <span>Save</span>
                    <Floppy2Fill className='ms-2 d-none d-md-block' color='currentColor' size='1.0em' />
                </Button>
            );
        } else if (pathname.includes('indoor') || pathname.includes('outdoor')) {
            return (
                <Button
                    className='d-flex align-items-center'
                    variant="bar"
                    onClick={handleEdit}
                    aria-label="Edit Garden">
                    <span>Edit</span>
                    <PencilSquare className='ms-2 d-none d-md-block' color='currentColor' size='1.0em' />
                </Button>
            );
        }
    }

    const handleGardenSwitch = (gardenId) => {
        retrieveGarden(gardenId)
            .then((data) => {
                setGarden(data);
                if (pathname.includes('edit')) {
                    navigate(`${garden.location}/${gardenId}/edit`)
                } else {
                    navigate(`${garden.location}/${gardenId}`)
                }
            });
    };

    const handleHideSidebar = () => {
        setShowSidebar(false);
    };


    function HomeElements() {
        return (
            <Row className="w-100 container-fluid m-0 p-0">
                {/* Left Bar Element: Sidebar */}
                {/* <Col xs={2} className='d-flex justify-content-start'>
                    <Button
                        className='mr-auto'
                        variant="bar"
                        onClick={handleGoToProfile}
                        aria-label="Go to Profile"
                    >
                        <PersonCircle color='currentColor' size={24} />
                    </Button>
                </Col> */}
                {/* Left Bar Element: Sidebar Toggle instead of Profile */}
                <Col xs={2} className='d-flex justify-content-start'>
                    <Sidebar show={showSidebar} handleClickLink={handleHideSidebar} onClose={() => setShowSidebar(false)} />
                    <Button
                        variant="bar"
                        onClick={() => setShowSidebar(true)}
                        aria-label="Show Sidebar"
                    >
                        <List color='currentColor' size={24} />
                    </Button>
                </Col>

                {/* Middle Bar Elemenet: Logo */}
                <Col xs='auto'>
                    <Logo onClick={handleGoHome} />
                </Col>

                {/* Right Bar Elemenet: Sign Out */}
                <Col xs={2} className='d-flex justify-content-end m-0'>
                    <Button
                        className='ml-auto d-flex align-items-center'
                        variant="bar"
                        onClick={handleSignOut}
                        aria-label="Sign Out (Return to Login Screen)">
                        <span className='text-nowrap'>Sign Out</span>
                        <BoxArrowRight className='ms-2 d-none d-md-block' color='currentColor' size='1.0em' />
                    </Button>
                </Col>
            </Row>
        );
    }

    function GardenElements() {
        return (
            <Row className="w-100 container-fluid m-0 p-0">

                <Col xs={2} className='d-flex justify-content-start'>
                    <Sidebar show={showSidebar} handleClickLink={handleHideSidebar} onClose={() => setShowSidebar(false)} />
                    <Button
                        variant="bar"
                        onClick={() => setShowSidebar(true)}
                        aria-label="Show Sidebar">
                        <List className='' color='currentColor' size={24} />
                    </Button>
                </Col>


                <Col xs='auto'>
                    <Dropdown className="mx-auto">
                        <Dropdown.Toggle variant="light">
                            {garden ? garden.name : "Select Garden"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {gardens ? gardens.map((garden) => (
                                <Dropdown.Item key={garden.id} onClick={() => handleGardenSwitch(garden.id)}>
                                    {garden.name}
                                </Dropdown.Item>
                            )) : <p>No Gardens</p>}
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => navigate('/')}>
                                All Gardens
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col xs={2} className='d-flex justify-content-end m-0'>
                    {getRightElement()}
                </Col>
            </Row>
        );
    }

    const getBarElements = () => {
        if (!user) {
            return <DefaultElements />;
        }

        if (pathname.includes('indoor') || pathname.includes('outdoor')) {
            return <GardenElements />;
        }

        return <HomeElements />;
    }

    return (
        <Navbar className='site-header p-3 flex-shrink-0' style={{ backgroundColor: "#3B6255" }} variant="dark">
            <div
                className='tool-overlay'>
            </div>
            {getBarElements()}
        </Navbar>
    );
};

export default Header;