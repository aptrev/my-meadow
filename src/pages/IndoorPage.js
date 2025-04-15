import React, { useEffect, useState } from 'react';
import shelf from '../assets/images/shelf.png';
import AppContainer from '../components/AppContainer';
import { useParams, useNavigate } from 'react-router-dom';
import { retrieveGarden, deleteGarden } from '../utilities/FirebaseUtils';
import { getAuth } from 'firebase/auth';
import Button from 'react-bootstrap/Button';
import { Trash } from 'react-bootstrap-icons';

const Indoor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteGardenClose = () => setShowDeleteModal(false);

  useEffect(() => {
    if (id) {
      retrieveGarden(id)
        .then((data) => {
          setGarden(data);
        });
    }
  }, [id]);

  const handleDeleteGarden = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to delete a garden.");
      return;
    }

    try {
      await deleteGarden(user.uid, id);
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      console.error("Error deleting garden:", err);
      alert("Failed to delete garden.");
    }
  };

  if (!garden) return <p>Loading garden...</p>;

  return (
    <AppContainer>
      <div style={{ position: 'absolute', top: '20px', right: '50px', zIndex: 10 }}>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          aria-label="Delete Garden"
        >
          <Trash />
        </Button>
      </div>

      {/* Always render the shelf */}
      <div className="shelf-wrapper">
        <img src={shelf} alt="Shelf" className="shelf-img" />
        <div className="plant-container">
          {garden.plants?.map((plant, idx) => (
            <div key={idx} style={{ position: 'absolute', left: plant.x, top: plant.y }}>
              🪴
            </div>
          ))}
        </div>
      </div>
{/* 
      <div className="plant-info">
        <h2>🌺 Begonia</h2>
        <p><strong>Begonia 'Art Hodes'</strong> is a resilient, easy-care flowering plant perfect for indoor gardens.</p>
        <div className="icons">
          <span>💧</span>
          <span>☀️</span>
        </div>
      </div> */}
    </AppContainer>
  );
};

export default Indoor;