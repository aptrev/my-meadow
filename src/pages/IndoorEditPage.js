// Updated IndoorEditPage with pot tab toggle and interactive pot slot placement

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group } from 'react-konva';
import useImage from "use-image";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import { useNavigate, useParams } from "react-router-dom";
import shelf from "../assets/images/shelf.png";
import potImg from "../assets/images/pot1.png";
import trashIcon from '../assets/images/trash.png';
// import marigold from '../assets/images/marigold.png';
// import magnolia from '../assets/images/magnolia.png';
// import begonia from '../assets/images/begonia.png';
// import rose from '../assets/images/rose.png';
import LeftSidebarIndoor from '../components/LeftSidebarIndoor';
import ElementPicker from '../components/ElementPicker';
import PlantInfo from '../components/PlantInfo';
import { retrieveGarden } from '../utilities/FirebaseUtils';
import '../style/indooredit.css';


export default function IndoorEditPage() {
  const { id } = useParams();
  // const navigate = useNavigate();

  const [garden, setGarden] = useState(null);
  const [pots, setPots] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [tool, setTool] = useState(null);
  const [draggedFlower, setDraggedFlower] = useState(null);
  const [hoveredSlotId, setHoveredSlotId] = useState(null);


  const shelfImage = useImage(shelf)[0];
  const potImage = useImage(potImg)[0];
  const trashImg = useImage(trashIcon)[0];
  const stageRef = useRef();
  const containerRef = useRef();

  const stageSize = { width: 435, height: 435, scale: 1 };

  const potSlots = [
    { id: 0, x: 105, y: 85 }, { id: 1, x: 195, y: 85 }, { id: 2, x: 285, y: 85 },
    { id: 3, x: 105, y: 209 }, { id: 4, x: 195, y: 209 }, { id: 5, x: 285, y: 209 },
    { id: 6, x: 105, y: 328 }, { id: 7, x: 195, y: 328 }, { id: 8, x: 285, y: 328 }
  ];

  useEffect(() => {
    if (id) {
      retrieveGarden(id)
        .then((data) => {
          console.log(data);
          // setScene({
          //     width: data.stage.width,
          //     height: data.stage.height,
          // });
          setPots(data.pots);
          setPlants(data.plants);
          // setHistory([JSON.stringify(data.pots)]);
          setGarden(data);
        });
    }
  }, [id]);

  /**
       * Save garden to local on every change.
       * Used by Save button in Header component to update garden in Firestore.
       */
  const saveGarden = useCallback((pots) => {
    const newGarden = { ...garden, pots };
    localStorage.setItem('savedGarden', JSON.stringify(newGarden));
  }, [pots]);

  

  useEffect(() => {
    if (pots.length > 0) {
      saveGarden(pots); // Save whenever pots are updated
    }
  }, [pots]); // Trigger when `pots` changes
  

  const handleStageClick = (e) => {
    const pointer = stageRef.current.getPointerPosition();
    if (!pointer) return;

    if (tool === 'pot') {
      const clickedSlot = potSlots.find(slot =>
        pointer.x >= slot.x && pointer.x <= slot.x + 40 &&
        pointer.y >= slot.y && pointer.y <= slot.y + 40 &&
        !pots.some(p => p.x === slot.x && p.y === slot.y)
      );

      if (clickedSlot) {
        setPots(prev => [...prev, { id: Date.now(), x: clickedSlot.x, y: clickedSlot.y, flower: null }]);
        saveGarden(pots);
      }
    } else if (draggedFlower) {
      const clickedPot = pots.find(pot =>
        pointer.x >= pot.x && pointer.x <= pot.x + 40 &&
        pointer.y >= pot.y && pointer.y <= pot.y + 40
      );

      if (clickedPot) {
        const updated = pots.map((p) =>
          p.id === clickedPot.id ? { ...p, flower: draggedFlower } : p
        );
        setPots(updated);
        setDraggedFlower(null);
        saveGarden(pots);
      }
    }
  };

  const onChangeTool = (value) => {
    setTool(value === tool ? null : value);
  };

  const handleSelectPlant = (plantObj) => {
    setSelectedPlant(selectedPlant?.id === plantObj.id ? null : plantObj);
  };

  const handleAddPlant = (plant) => {
    if (!plants.some(p => p.id === plant.id)) {
      const newPlants = [...plants, plant];
      setPlants(newPlants);
      saveGarden(pots);
    }
  };

  const deletePot = (id) => {
    setPots(prev => prev.filter(p => p.id !== id));
    saveGarden(pots);
  };


  return (
    <Container fluid className='position-relative flex-grow-1 m-0 px-2 align-items-start' style={{ backgroundColor: 'var(--edit-background-color)' }}>
      <Row className='flex-nowrap'>
        <Col xs='auto' className='p-0'>
          <Stack direction="horizontal">
            <LeftSidebarIndoor tool={tool} onChangeTool={onChangeTool} />
            {(tool !== 'pots-edit') && (<ElementPicker
              tool={tool}
              onHide={onChangeTool}
              garden={garden}
              plants={plants}
              onAddPlant={handleAddPlant}
              onSelect={() => { }}
              onDrag={() => { }}
              onDragEnd={() => { }}
              onDragStart={() => { }}
              onPlantDrag={() => { }}
              onPlantDragEnd={() => { }}
              onPlantDragStart={(e, plant) => setDraggedFlower(plant)}
            />)}
          </Stack>
        </Col>
        <Col className='p-0 position-relative' style={{ minWidth: '0' }}>
          <div className='p-4' style={{ height: 'calc(100svh - 75px)' }}>
            <div className='w-100 h-100 my-2 d-flex flex-row justify-content-center align-items-center'>
              <div className='position-relative h-100' ref={containerRef} style={{ width: '100%' }}>
                <div className='white-canvas' style={{ margin: '0 auto', width: 'fit-content', height: 'fit-content' }}>
                  <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    scaleX={stageSize.scale}
                    scaleY={stageSize.scale}
                    ref={stageRef}
                    onClick={handleStageClick}
                  >
                    <Layer>
                      {shelfImage && (
                        <KonvaImage image={shelfImage} x={0} y={0} width={stageSize.width} height={stageSize.height} />
                      )}
                      {tool === 'pots-edit' && potSlots.map(slot => {
                        const occupied = pots.some(p => p.x === slot.x && p.y === slot.y);
                        return (
                          <Group key={slot.id}
                            onMouseEnter={() => setHoveredSlotId(slot.id)}
                            onMouseLeave={() => setHoveredSlotId(null)}
                            onClick={() => {
                              if (!occupied) {
                                setPots(prev => [...prev, { id: Date.now(), x: slot.x, y: slot.y, flower: null }]);
                                saveGarden(pots);
                              }
                            }}
                          >
                            <Rect
                              x={slot.x - 3}
                              y={slot.y - 3}
                              width={46}
                              height={46}
                              stroke={occupied ? 'transparent' : "#CBDED3"}
                              dash={[4, 4]}
                            />
                            {!occupied && hoveredSlotId === slot.id && potImage && (
                              <KonvaImage
                                image={potImage}
                                x={slot.x}
                                y={slot.y}
                                width={40}
                                height={40}
                                opacity={0.5}
                              />
                            )}
                          </Group>
                        );
                      })}

                      {pots.map(pot => (
                        <Group key={pot.id}>
                          <KonvaImage image={potImage} x={pot.x} y={pot.y} width={40} height={40} />
                          {pot.flower && (
                            <KonvaImage
                              image={(() => {
                                const img = new window.Image();
                                img.src = pot.flower.src;
                                return img;
                              })()}
                              x={pot.x} y={pot.y} width={40} height={40}
                            />
                          )}
                          {tool === 'pots-edit' && trashImg && (
                            <KonvaImage
                              image={trashImg}
                              x={pot.x + 37}
                              y={pot.y - 10}
                              width={12}
                              height={12}
                              onClick={() => deletePot(pot.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          )}

                        </Group>
                      ))}
                    </Layer>
                  </Stage>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col xs='auto'>
          <PlantInfo garden={garden} plants={plants} plant={selectedPlant} onSelect={handleSelectPlant} />
        </Col>
      </Row>
    </Container>
  );
}
