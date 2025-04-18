import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Stage, Layer } from 'react-konva';
import Plot from '../components/Plot';
import { retrieveGarden, deleteGarden } from '../utilities/FirebaseUtils';
import AppContainer from '../components/AppContainer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import { Trash } from 'react-bootstrap-icons';
import { getAuth } from 'firebase/auth';
import AppModal from '../components/AppModal';

const plant_species = [
  { id: 1473, name: "Marigold", src: 'marigold.png', color: 'orange', waterFrequency: 'every 2 days' },
  { id: 324, name: 'Magnolia', src: 'magnolia.png', color: 'beige', waterFrequency: 'weekly' },
  { id: 1194, name: 'Begonia', src: 'begonia.png', color: 'pink', waterFrequency: 'every 3 days' },
  { id: 6791, name: 'Rose', src: 'rose.png', color: 'red', waterFrequency: 'every 2 days' }
];

const PlantToast = ({ plants, navigate, id }) => (
  <div style={{ textAlign: 'center' }}>
    <p>🌼 Now your beautiful garden has: <strong>{plants.join(', ')}</strong></p>
    <p>Your garden calendar is updated with these plants' watering schedules!</p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
      <Button size="sm" variant="success" onClick={() => navigate(`/calendar/${id}`)}>Check Water Schedule</Button>
      <Button size="sm" variant="secondary" onClick={() => toast.dismiss()}>Remain Here</Button>
    </div>
  </div>
);

const Outdoor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [sceneWidth, setSceneWidth] = useState(0);
  const [sceneHeight, setSceneHeight] = useState(0);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const plotRefs = useRef(new Map());

  const [stageSize, setStageSize] = useState({ width: 1, height: 1, scale: 1 });

  useEffect(() => {
    if (id) {
      retrieveGarden(id)
        .then((data) => {
          data.plants = plant_species;
          setGarden(data);
        })
        .catch((e) => {
          console.error(`Outdoor: Failure to retrieve garden with ID: ${id}: `, e);
          navigate('/');
        });
    }
  }, [id, navigate]);

  useEffect(() => {
    if (garden) {
      setSceneWidth(garden.stage.width);
      setSceneHeight(garden.stage.height);
      setStageSize({ width: garden.stage.width, height: garden.stage.height, scale: 1 });

      const recent = JSON.parse(localStorage.getItem('recentlyAddedPlants') || '[]');
      if (recent.length > 0) {
        toast.info(<PlantToast plants={recent} navigate={navigate} id={id} />, {
          position: 'top-center',
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        });
        localStorage.removeItem('recentlyAddedPlants');
      }
    }
  }, [garden]);

  const updateSize = useCallback(() => {
    if (!stageRef.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const scale = containerWidth / sceneWidth;
    setStageSize({ width: sceneWidth * scale, height: sceneHeight * scale, scale: scale });
  }, [sceneWidth, sceneHeight]);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteGardenClose = () => setShowDeleteModal(false);

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

      {garden && (
        <>
          <div
            ref={containerRef}
            style={{
              margin: '0 auto',
              width: '100%',
              maxWidth: '600px',
              height: 'auto',
              backgroundColor: 'white'
            }}
          >
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              scaleX={stageSize.scale}
              scaleY={stageSize.scale}
              ref={stageRef}
            >
              <Layer>
                {garden.plots.map((plot) => {
                  const { id, shape, x, y, plant, draggable, ...restProps } = plot;
                  return (
                    <Plot
                      key={id}
                      id={id}
                      x={x}
                      y={y}
                      shape={shape}
                      shapeProps={restProps}
                      plant={plant}
                      plant_species={plant_species}
                      onDragEnd={() => { }}
                      plotRefs={plotRefs}
                      draggable='false'
                    />
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </>
      )}
      <ToastContainer />
    </AppContainer>
  );
};

export default Outdoor;