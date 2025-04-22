import React, { useEffect, useState } from 'react';
import shelf from '../assets/images/shelf.png';
import AppContainer from '../components/AppContainer';
import { useParams, useNavigate } from 'react-router-dom';
import { retrieveGarden, deleteGarden } from '../utilities/FirebaseUtils';
import { getAuth } from 'firebase/auth';
import Button from 'react-bootstrap/Button';
import { Trash } from 'react-bootstrap-icons';
import useImage from "use-image";
import potImg from "../assets/images/pot1.png";
import sproutedImg from "../assets/images/sprouted.png";
import AppModal from "../components/AppModal";

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
      <AppModal
        title="Delete this garden?"
        body="This action cannot be undone."
        show={showDeleteModal}
        onHide={handleDeleteGardenClose}
        options={[
          {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDeleteGarden,
          },
          {
            label: 'Cancel',
            variant: 'outline-primary',
            onClick: handleDeleteGardenClose,
          }
        ]}
      />
      <div className="shelf-wrapper" style={{ position: 'relative', width: '435px', height: '435px', margin: '0 auto' }}>
        <img src={shelf} alt="Shelf" className="shelf-img" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
        {garden.pots?.map((pot, idx) => (
          <img
            key={idx}
            src={pot.flower ? sproutedImg : potImg}
            alt={pot.flower ? "Sprouted Pot" : "Pot"}
            style={{
              position: 'absolute',
              left: `${pot.x + (pot.flower ? -15 : 0)}px`,
              top: `${pot.y + (pot.flower ? -31 : 0)}px`,
              width: pot.flower ? '69px' : '40px',
              height: pot.flower ? '72px' : '40px',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </AppContainer>
  );
};

export default Indoor;