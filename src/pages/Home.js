import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import db from '../firebase/FirebaseDB';
import { retrieveGardens } from '../utilities/FirebaseUtils';
import logo from '../assets/images/logos/plant-pot.PNG';
import "../App.css"

// Bootstrap Imports
import { House, Flower1 } from 'react-bootstrap-icons';
import Spinner from 'react-bootstrap/Spinner';
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
          <Container className="py-4 text-center">
            {/* Welcome Message */}
            {user && (
              <h1 
                className="mb-2" 
                style={{ 
                  fontFamily: '"Lucida Handwriting", "Cursive", sans-serif', 
                  fontSize: '3.5rem', 
                  color: '#3B6255' 
                }}
              >
                 Welcome to {user.displayName.split(' ')[0]}'s Garden 
              </h1>
            )}

            <div className="position-relative text-center" style={{ height: '300px', marginTop: '40px' }}>
              {/* Logo Image */}
              <img 
                src={logo} 
                alt="Plant Pot Logo" 
                style={{ 
                  maxWidth: '500px', 
                  position: 'absolute', 
                  bottom: 0, 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  zIndex: 1 
                }}
              />

              {/* Button - Overlapping the Image */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '70%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  zIndex: 2 
                }}
              >
              <Button 
                className="animated-grow-btn"
                variant="outline-success" 
                size="lg" 
                onClick={handleCreate} 
                style={{ 
                  borderRadius: '10px', 
                  padding: '10px 25px', 
                  backgroundColor: '#3B6255', 
                  color: '#f0fdf4',
                  border: 'none',
                  fontWeight: 'bold',
                  width: '300px'
                }}
              >
                🪴 Grow a New Garden 🪴
              </Button>


              </div>
            </div>


            {/* Inspirational Quote */}
            <p 
              className="fst-italic mb-5" 
              style={{ fontSize: '1.2rem', color: '#3B6255' }}
            >
              "To plant a garden is to believe in tomorrow"
            </p>

            <h4 className="mb-4 text-center" style={{ color: '#386641' }}> Your Gardens </h4>

            {loading ? (
              <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" variant="success" />
              </div>
            ) : gardens && gardens.length > 0 ? (
              <ListGroup className="home-garden-list mx-auto shadow-sm" style={{ maxWidth: "600px", borderRadius: "12px" }}>
                {gardens.map((garden) => (
                  <ListGroup.Item
                    key={garden.id}
                    action
                    onClick={() => handleGoToGarden(garden)}
                    className="d-flex align-items-center garden-list-item"
                    style={{
                      borderRadius: "10px",
                      marginBottom: "4px",
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #d6e9c6",
                    }}
                  >
                    <Col xs="auto" className="me-3">
                      {garden.location === 'indoor' ? (
                        <House size={22} color="#6a994e" />
                      ) : (
                        <Flower1 size={22} color="#f3722c" />
                      )}
                    </Col>
                    <Col className="text-capitalize fw-semibold" style={{ color: '#386641' }}>{garden.name}</Col>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted text-center mt-4" style={{ fontStyle: "italic" }}>
                🌱 No gardens yet… start planting your little paradise!
              </p>
            )}
          </Container>
        </AppContainer>
    )
}