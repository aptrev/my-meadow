import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Stage, Layer } from 'react-konva';
import Plot from '../components/Elements/Plot';
import Object from '../components/Elements/Object'
import { retrieveGarden, deleteGarden } from '../utilities/FirebaseUtils';
import AppContainer from '../components/AppContainer/AppContainer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import { Trash } from 'react-bootstrap-icons';
import { getAuth } from 'firebase/auth';
import AppModal from '../components/AppModal';
import { Col, Container, Row } from 'react-bootstrap';
import PlantInfo from '../components/PlantInfo';

import '../style/outdooredit.css';

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

export default function Outdoor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [elements, setElements] = useState(null);
  const [plants, setPlants] = useState(null); // Garden plants
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const elementRefs = useRef(new Map());
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [position, setPosition] = useState(null) // Stage pointer position
  const [overCanvas, setOverCanvas] = useState(false);

  const [scene, setScene] = useState({}); // The initial size of the stage
  const [stageSize, setStageSize] = useState({
    width: 0,
    height: 0,
    scale: 1
  });

  // Set initial stage size after garden data loaded to scene
  useEffect(() => {
    setStageSize({
      ...scene,
      scale: 1
    })
  }, [scene])

  useEffect(() => {
    if (id) {
      retrieveGarden(id)
        .then((data) => {
          setScene({
            width: data.stage.width,
            height: data.stage.height,
          });
          const elements = {
            plots: data.plots,
            paths: data.paths,
            objects: data.objects,
            text: data.text,
          }
          setElements(elements);
          setPlants(data.plants);
          setGarden(data);
        })
        .catch((e) => {
          console.error(`Outdoor: Failure to retrieve garden with ID: ${id}: `, e);
          navigate('/');
        });
    }
  }, [id, navigate]);

  // Use to resize stage
  const updateSize = useCallback(() => {
    if (!stageRef.current) return;

    if (scene && scene.width) {

      // Get width and scale of containerRef
      const containerWidth = containerRef.current.offsetWidth;
      const scale = containerWidth / scene.width;

      // Update stage with new dimensions
      setStageSize({
        width: scene.width * scale,
        height: scene.height * scale,
        scale: scale
      });
    }

  }, [scene]);

  // Update stage size on parent container (containerRef) resize
  useEffect(() => {

    // Initial resize on page load
    updateSize();

    // Create and add resize observer to containerRef
    const resizeObserver = new ResizeObserver(entries => {
      updateSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Clean-up logic
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [updateSize]);

  useEffect(() => {
    if (garden) {
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

  // For displaying coordinates using actual garden dimensions
  const handleMouseOver = (e) => {
    const pos = stageRef.current.getPointerPosition();
    setPosition({
      x: Math.trunc(pos.x * (1 / stageSize.scale)) / 100,
      y: Math.trunc(pos.y * (1 / stageSize.scale)) / 100,
    });
  }

  // Handles stage click selection events
  const handleStageClick = (e) => {
    // Return if selection rectangle already initialized
    // if (selectionRectangle.visible) {
    //     return;
    // }

    // // Deselect on stage click
    // if (e.target === e.target.getStage()) {
    //     handleDeselect();
    //     return;
    // }

    // // Do nothing if currently selected plot 
    // if (!e.target.hasName('plot') && !e.target.hasName('path') && !e.target.hasName('object') && !e.target.hasName('text')) {
    //     return;
    // }

    // // Id of clicked on element
    // const clickedId = e.target.id();

    // // Different behavior on key pressed
    // const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    // const isSelected = selectedIds.includes(clickedId);

    // // Concat element on meta press select if not already selected, remove if already selected
    // if (!metaPressed && !isSelected) {
    //     const newShapes = new Set([]);
    //     setSelectedIds([clickedId]);
    //     newShapes.add(e.target.getClassName().toLowerCase());
    //     setSelectedShapes(newShapes);
    // } else if (metaPressed && isSelected) {
    //     setSelectedIds(selectedIds.filter(id => id !== clickedId));
    //     const newShapes = selectedShapes;
    //     newShapes.delete(e.target.getClassName().toLowerCase());
    // } else if (metaPressed && !isSelected) {
    //     setSelectedIds([...selectedIds, clickedId]);
    //     const newShapes = selectedShapes;
    //     newShapes.add(e.target.getClassName().toLowerCase());
  }

  // Plant being dragged for assignment to a plot
  const handleSelectPlant = (plantObj) => {
    setSelectedPlant((selectedPlant && selectedPlant.id === plantObj.id) ? null : plantObj);
  };

  return (
    <Container
      fluid
      className='position-relative flex-grow-1 m-0 px-2 align-items-start '
      style={{ backgroundColor: 'var(--edit-background-color)' }}>
      <Row className='flex-nowrap position-relative '>
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

        <Col className='p-0 position-relative' style={{ minWidth: '0' }}>
          {(garden && position) &&
            <p className='position-absolute bottom-0 left-0 ms-1'>
              {`(${position.x} ${garden.dimensions_units}, ${position.y} ${garden.dimensions_units})`}
            </p>}
          {(garden && elements && plants) && // Wait for garden data from Firestore
            // Make garden editing playground the height of visible viewport minus the header
            <div className='p-4' style={{ height: 'calc(100svh - 75px)' }}>
              <Button
                className='position-absolute'
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                aria-label="Delete Garden"
                style={{ top: '15px', right: '15px' }}
              >
                <Trash />
              </Button>
              {/* Center stage */}
              <div className='w-100 h-100 my-2 d-flex flex-row justify-content-center align-items-center'>
                {/* Facilitates stage canvas resizing */}
                <div className='position-relative h-100' ref={containerRef} style={{ width: '100%' }}>
                  <div
                    id='stage-wrapper'
                    className='h-100'
                    style={{ marginTop: '75px', width: '100%' }}>
                    {/* Adds white background to stage canvas */}
                    <div
                      className='background-canvas'
                      onMouseLeave={(e) => {
                        setOverCanvas(false);
                        setPosition(null);
                      }}
                      onDragLeave={() => {
                        setOverCanvas(false);
                        setPosition(null);
                      }}
                      onMouseMove={(e) => handleMouseOver(e)}
                      // onMouseOver={(e) => handleMouseOver(e)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        handleMouseOver(e);
                        setOverCanvas(true);
                      }}
                      style={{
                        backgroundColor: `${garden.background ? garden.background : 'white'}`,
                        margin: '0 auto',
                        width: 'fit-content',
                        height: 'fit-content'
                      }}>
                      <Stage
                        width={stageSize.width ? stageSize.width : 1}
                        height={stageSize.height ? stageSize.height : 1}
                        scaleX={stageSize.scale}
                        scaleY={stageSize.scale}
                        ref={stageRef}
                        onClick={handleStageClick}
                        onTap={handleStageClick}
                      // onPlantClick={handlePlantClick}
                      >
                        {/* Layer for elements */}
                        <Layer>
                          {elements.plots.map((plot) => {
                            const { id, shape, x, y, rotation, plant, draggable, ...restProps } = plot;
                            return (
                              <Plot
                                key={id}
                                id={id}
                                shape={shape}
                                x={x}
                                y={y}
                                rotation={rotation}
                                shapeProps={restProps}
                                plant={plant}
                                elementRefs={elementRefs}
                                draggable={false} />
                            )
                          })}
                          {elements.objects.map((object) => {
                            const { id, shape, x, y, rotation, draggable, ...restProps } = object;
                            return (
                              <Object
                                key={id}
                                id={id}
                                shape={shape}
                                x={x}
                                y={y}
                                rotation={rotation}
                                shapeProps={restProps}
                                elementRefs={elementRefs}
                                draggable={false}
                                stageRef={stageRef} />
                            )
                          })}
                        </Layer>
                      </Stage>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </Col>
        <Col xs='auto'>
          <PlantInfo
            garden={garden}
            plants={plants}
            plant={selectedPlant}
            onSelect={handleSelectPlant} />
        </Col>
      </Row>
    </Container >
  )
}