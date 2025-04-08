import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Group } from 'react-konva';
import useImage from "use-image";
import shelf from "../assets/images/shelf.png";
import potImg from "../assets/images/pot1.png";
import marigold from '../assets/images/marigold.png';
import magnolia from '../assets/images/magnolia.png';
import begonia from '../assets/images/begonia.png';
import rose from '../assets/images/rose.png';
import '../style/indooredit.css';
import "bootstrap/dist/css/bootstrap.min.css";
import AppContainer from '../components/AppContainer';
import { useNavigate, useParams } from "react-router-dom";
import { retrieveGarden } from '../utilities/FirebaseUtils';
import IndoorToolbar from '../components/IndoorToolbar';
import { Flower2, XLg, CircleSquare, Flower1 } from 'react-bootstrap-icons';

const plant_options = [
  { id: 1473, name: "Marigold", src: marigold, color: "orange", format: "png", value: 1473 },
  { id: 324, name: "Magnolia", src: magnolia, color: "beige", format: "png", value: 324 },
  { id: 1194, name: "Begonia", src: begonia, color: "pink", format: "png", value: 1194 },
  { id: 6791, name: "Rose", src: rose, color: "red", format: "png", value: 6791 },
];

export default function IndoorEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [garden, setGarden] = useState(null);
  const [pots, setPots] = useState([]);
  const [history, setHistory] = useState([JSON.stringify([])]);
  const [historyStep, setHistoryStep] = useState(0);
  const [draggedFlower, setDraggedFlower] = useState(null);
  const [template, setTemplate] = useState(null);
  const [shelfImage] = useImage(shelf);
  const [potImage] = useImage(potImg);
  const stageRef = useRef(null);
  const [stageSize] = useState({ width: 435, height: 435 });
  const [activeTool, setActiveTool] = useState(null);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState(null);

  const potSlots = [
    { x: 90, y: 50 }, { x: 180, y: 50 }, { x: 270, y: 50 },
    { x: 90, y: 160 }, { x: 180, y: 160 }, { x: 270, y: 160 },
    { x: 90, y: 270 }, { x: 180, y: 270 }, { x: 270, y: 270 },
    { x: 90, y: 370 }, { x: 180, y: 370 }, { x: 270, y: 370 },
  ];

  useEffect(() => {
    const selectedTemplate = localStorage.getItem("selectedTemplate");
    setTemplate(selectedTemplate);
  }, []);

  useEffect(() => {
    if (id) {
      retrieveGarden(id).then((data) => {
        setGarden(data);
        const initialPots = data?.pots || [];
        setPots(initialPots);
        setHistory([JSON.stringify(initialPots)]);
      });
    }
  }, [id]);

  const saveGarden = useCallback((newPots) => {
    if (!garden) return;
    const updatedGarden = { ...garden, pots: newPots };
    setGarden(updatedGarden);
    localStorage.setItem("savedGarden", JSON.stringify(updatedGarden));
  }, [garden]);

  const saveHistory = (newPots) => {
    const newHistory = history.slice(0, historyStep + 1);
    const serialized = JSON.stringify(newPots);
    newHistory.push(serialized);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    saveGarden(newPots);
  };

  const handleSlotClick = (slot) => {
    const newPot = {
      id: `pot-${Date.now()}`,
      x: slot.x,
      y: slot.y,
      flower: null,
    };
    const updated = [...pots, newPot];
    setPots(updated);
    saveHistory(updated);
  };

  const handleStageClick = (e) => {
    if (!draggedFlower) return;
    stageRef.current.setPointersPositions(e);
    const pointer = stageRef.current.getPointerPosition();
    if (!pointer) return;

    const clickedPot = pots.find(pot => {
      return (
        pointer.x >= pot.x &&
        pointer.x <= pot.x + 40 &&
        pointer.y >= pot.y &&
        pointer.y <= pot.y + 40
      );
    });

    if (clickedPot) {
      const updated = pots.map((p) =>
        p.id === clickedPot.id ? { ...p, flower: draggedFlower } : p
      );
      setPots(updated);
      saveHistory(updated);
      setDraggedFlower(null);
    }
  };

  const toolbarButtons = [
    {
      id: 'toolbar-pot-button',
      value: 'pot',
      type: 'toggle',
      name: 'Pots',
      options: [
        {
          id: 'indoor-pot',
          name: 'Pot',
          src: potImg,
          format: 'png',
          value: 'pot-img',
        },
      ],
      onSelect: () => {},
      iconActive: <Flower1 size={24} />, 
      iconDisabled: <CircleSquare size={24} />, 
    },
    {
      id: 'toolbar-plant-button',
      value: 'plant',
      type: 'radio',
      name: 'Plants',
      options: plant_options,
      onDragStart: () => {},
      onDrag: () => {},
      onDragEnd: () => {},
      onSelect: (plant) => setDraggedFlower(plant),
      iconActive: <XLg size={24} />, 
      iconDisabled: <Flower2 size={24} />, 
    }
  ];

  return (
    <AppContainer className="indooredit">
      <div className="d-flex justify-content-center mt-3 position-relative" style={{ zIndex: 10 }}>
        <IndoorToolbar
          onUndo={() => {
            if (historyStep > 0) {
              const prev = JSON.parse(history[historyStep - 1]);
              setHistoryStep(historyStep - 1);
              setPots(prev);
            }
          }}
          onRedo={() => {
            if (historyStep < history.length - 1) {
              const next = JSON.parse(history[historyStep + 1]);
              setHistoryStep(historyStep + 1);
              setPots(next);
            }
          }}
          onDelete={() => setPots([])}
          toolbarButtons={toolbarButtons}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
        />
      </div>

      <div className="d-flex justify-content-center mt-3" style={{ zIndex: 1 }}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          onClick={handleStageClick}
        >
          <Layer>
            {shelfImage && (
              <KonvaImage image={shelfImage} x={0} y={0} width={stageSize.width} height={stageSize.height} />
            )}

            {activeTool === 'pot' && potSlots.map((slot, i) => (
              <Group key={`highlight-${i}`}>
                <Rect
                  x={slot.x - 5}
                  y={slot.y - 5}
                  width={50}
                  height={50}
                  stroke={hoveredSlotIndex === i ? "lightgreen" : "green"}
                  dash={[4, 4]}
                  strokeWidth={2}
                  onClick={() => handleSlotClick(slot)}
                  onMouseEnter={() => setHoveredSlotIndex(i)}
                  onMouseLeave={() => setHoveredSlotIndex(null)}
                />
                {hoveredSlotIndex === i && (
                  <KonvaImage
                    image={potImage}
                    x={slot.x}
                    y={slot.y}
                    width={40}
                    height={40}
                    opacity={0.2}
                    listening={false}
                  />
                )}
              </Group>
            ))}

            {pots.map((pot) => (
              <React.Fragment key={pot.id}>
                <KonvaImage
                  image={potImage}
                  x={pot.x}
                  y={pot.y}
                  width={40}
                  height={40}
                />
                {pot.flower && (
                  <KonvaImage
                    image={(() => {
                      const img = new window.Image();
                      img.src = pot.flower.src;
                      return img;
                    })()}
                    x={pot.x}
                    y={pot.y}
                    width={40}
                    height={40}
                  />
                )}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </AppContainer>
  );
}
