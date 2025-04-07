import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import db from '../firebase/FirebaseDB';
import { retrieveGardens } from '../utilities/FirebaseUtils';

// Bootstrap Imports
import { House, Flower1 } from 'react-bootstrap-icons';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Placeholder from 'react-bootstrap/Placeholder';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.css';

// Component Imports
import { AuthContext } from "../components/AuthProvider";
import AppContainer from '../components/AppContainer';

export default function Home() {
    const { user, logOut } = useContext(AuthContext);
    const [gardens, setGardens] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate('/create');
    }

    const handleGoToGarden = (garden) => {
        const path = garden.location;
        const id = garden.id;
        navigate(`/${path}/${id}`);
    }

    useEffect(() => {
        if (user) {
            retrieveGardens(user.uid)
            .then((data) => {
                localStorage.setItem('gardens', JSON.stringify(data));
                setGardens(data);
                setLoading(false);
            });
        } 
    }, [user])

    return (
        <AppContainer>
            {user &&
                <>
                    <p>{`${user.displayName} (${user.email})`}</p>
                    <p>{user.uid}</p>
                </>
            }
            <p>Welcome to MyMeadow!</p>

            <Button
                variant='main'
                onClick={handleCreate}
            >Create New Garden</Button>

            {/* List of gardens */}
            <p className='mt-4'>Your Gardens</p>
            {gardens ?
                <ListGroup className='home-garden-list mt-4 w-100' as='ol'>
                    {gardens.map((garden) => {
                        return <ListGroup.Item 
                        key={garden.id}
                        onClick={() => handleGoToGarden(garden)}
                        >
                            <Row>
                                <Col xs='auto' >
                                    {garden.location === 'indoor' ?
                                        <House color='currentColor' size='1.0em'/>
                                        : <Flower1  color='currentColor' size='1.0em' />
                                    }
                                </Col>
                                <Col>{garden.name}</Col>
                            </Row>
                        </ListGroup.Item>
                    })}
                </ListGroup>
                :
                <ListGroup className='mt-4'>
                    {Array(10).map((i) => {
                        return (
                            <ListGroup.Item key={i}>
                                <p>a</p>
                                <Placeholder as='li' xs={6} >a</Placeholder>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            }
        </AppContainer>
    )
}