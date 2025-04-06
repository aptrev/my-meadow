import React, { useEffect, useState, useContext, useRef } from "react";
import { collection, addDoc, getDoc, updateDoc, doc, query, where, getDocs, setDoc } from "firebase/firestore";
import db from '../firebase/FirebaseDB'
import { AuthContext } from "./AuthProvider";
import { Navbar, Dropdown, Button } from "react-bootstrap";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { PersonCircle, BoxArrowRight, List, Floppy2Fill, PencilSquare } from 'react-bootstrap-icons';
import { ReactSVG } from 'react-svg'
import Sidebar from "./Sidebar";
import logo from '../assets/images/logos/title-logo-white.svg'
import '../style/home.css';
import 'bootstrap/dist/css/bootstrap.css';
import { ThemeContext } from "../components/ThemeProvider";

const gardenPaths = ['/indoor', '/outdoor', '/indoor/edit', '/outdoor/edit', '/calendar'];

function DefaultElements() {
    return (
        <>
            <div></div>;
            <ReactSVG
                className='d-none d-md-block'
                style={{ color: 'white' }}
                src={logo}
                beforeInjection={(svg) => {
                    svg.classList.add('svg-header-logo')
                }}
                title='My Meadow'
                fallback={() => { return <h1 className='logo-header' style={{ color: 'inherit' }}>My Meadow</h1> }}
            />
            <div></div>;
        </>
    );
}

const Header = () => {
    const { pathname, state } = useLocation();
    const { id } = useParams();
    const { user, logOut, loading } = useContext(AuthContext);
    const [showSidebar, setShowSidebar] = useState(false);
    const { selectedGardenId, setSelectedGardenId } = useState(null);
    const [garden, setGarden] = useState(null);
    const [gardens, setGardens] = useState(null);

    const navigate = useNavigate();

    const retrieveGarden = async (gardenId, isNewGarden = false) => {
        if (state && state.garden && !isNewGarden) {
            return state.garden;
        }
        try {
            const gardenRef = doc(db, 'gardens', gardenId);
            const gardenSnap = await getDoc(gardenRef);
            if (gardenSnap.exists()) {
                return gardenSnap.data();
            }
            throw new Error();
        } catch (e) {
            console.error(`Error retrieving garden with ID: ${gardenId}`, e);
            navigate('/');
        }
    }

    const retrieveGardens = async () => {
        if (state && state.gardens) {
            return state.gardens;
        }
        const storedGardens = localStorage.getItem('gardens');
        if (storedGardens) {
            return JSON.parse(storedGardens);
        }
        try {
            const gardensRef = collection(db, 'gardens');
            const userRef = doc(db, 'users', user.uid);
            const data = await getDoc(userRef);
            if (!data.exists) {
                throw new Error('User gardens snapshot not found.');
            } else {
                const q = query(gardensRef, where('id', 'in', data.data().gardens));
                const querySnapshot = await getDocs(q);
                const gardenData = querySnapshot.docs.map((doc) => ({...doc.data()}));
                return gardenData;
            }
        } catch (error) {
            console.error("Error fetching gardens:", error);
            return null;
        }
    }

    useEffect(() => {
 
        retrieveGarden(id)
        .then((data) => {
            setGarden(data);
        });

        retrieveGardens()
        .then((data) => {
            setGardens(data);
        });
        
    }, []);

    const handleGoHome = () => {
        navigate("/");
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
        const gardenRef = doc(db, 'gardens', id);
        await setDoc(gardenRef, savedGarden);
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
        retrieveGarden(id, true)
        .then((data) => {
            setGarden(data);
            if (pathname.includes('edit')) {
                navigate(`${garden.location}/${gardenId}/edit`, {state: {garden, gardens}})
            } else {
                navigate(`${garden.location}/${gardenId}`, {state: {garden, gardens}})
            }   
        });
    };

    function HomeElements() {
        return (
            <>
                {/* Left Bar Element: Profile */}
                <Button
                    variant="bar"
                    onClick={() => alert('Profile page not yet implemented.')}
                    aria-label="Go to Profile"
                >
                    <PersonCircle color='currentColor' size={24} />
                </Button>

                {/* Middle Bar Elemenet: Logo */}
                <ReactSVG
                    className='d-none d-md-block'
                    style={{ color: 'white' }}
                    src={logo}
                    beforeInjection={(svg) => {
                        svg.classList.add('svg-header-logo')
                    }}
                    title='My Meadow'
                    onClick={handleGoHome}
                    fallback={() => { return <h1 className='logo-header' style={{ color: 'inherit' }}>My Meadow</h1> }}
                />

                {/* Right Bar Elemenet: Sign Out */}
                <Button
                    className='d-flex align-items-center'
                    variant="bar"
                    onClick={handleSignOut}
                    aria-label="Sign Out (Return to Login Screen)">
                    <span>Sign Out</span>
                    <BoxArrowRight className='ms-2 d-none d-md-block' color='currentColor' size='1.0em' />
                </Button>
            </>
        );
    }

    function GardenElements() {
        return (
            <>
                <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
                <Button
                    variant="bar"
                    onClick={() => setShowSidebar(true)}
                    aria-label="Edit Garden">
                    <List className='' color='currentColor' size={24} />
                </Button>

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
                        <Dropdown.Item onClick={() => navigate('/home', { state: { screen: 'home' } })}>
                            All Gardens
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                {getRightElement()}
            </>
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
        <Navbar style={{ backgroundColor: "#3B6255" }} variant="dark" className="p-3 justify-content-between">
            {getBarElements()}
        </Navbar>
    );
};

export default Header;