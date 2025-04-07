import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Stage, Layer, Rect, Transformer, Image } from 'react-konva';
import Plot from '../components/Plot'
import { retrieveGarden } from '../utilities/FirebaseUtils';

// Component Imports
import AppContainer from '../components/AppContainer';

const plant_species = [
  {
    id: 1473,
    name: "Marigold",
    src: 'marigold.png',
    color: 'orange'
  },
  {
    id: 324,
    name: 'Magnolia',
    src: 'magnolia.png',
    color: 'beige'
  },
  {
    id: 1194,
    name: 'Begonia',
    src: 'begonia.png',
    color: 'pink'
  },
  {
    id: 6791,
    name: 'Rose',
    src: 'rose.png',
    color: 'red'
  }
]

const Konva = window.Konva;

const Outdoor = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [garden, setGarden] = useState(null);

  const plotRefs = useRef(new Map());
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [sceneWidth, setSceneWidth] = useState(0);
  const [sceneHeight, setSceneHeight] = useState(0);

  const navigate = useNavigate();

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

  }, [id, setGarden, navigate])

  // Responsive canvas
  const [stageSize, setStageSize] = useState({
    width: 1,
    height: 1,
    scale: 1
  });

  const updateSize = useCallback(() => {
    if (!stageRef.current) return;

    // Get container width
    const containerWidth = containerRef.current.offsetWidth;

    // Calculate scale
    const scale = containerWidth / sceneWidth;

    // Update state with new dimensions
    setStageSize({
      width: sceneWidth * scale,
      height: sceneHeight * scale,
      scale: scale
    });
  }, [sceneWidth, sceneHeight]);

  useEffect(() => {
    if (garden) {
      setSceneWidth(garden.stage.width);
      setSceneHeight(garden.stage.height);
      setStageSize({
        width: garden.stage.width,
        height: garden.stage.height,
        scale: 1
      })
      garden.plants = plant_species;
    }
  }, [garden]);

  // Update stage size on window resize
  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [garden, updateSize]);

  return (
    <AppContainer>
      {garden && (
        <div ref={containerRef}  style={{ margin: '0 auto', width: '100%', maxWidth: '600px', height: 'auto', backgroundColor: 'white' }}>
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            scaleX={stageSize.scale}
            scaleY={stageSize.scale}
            ref={stageRef}

          >
            <Layer>
              {garden.plots.map((plot) => {
                const { id, shape, plant, draggable, ...restProps } = plot;
                return (
                  <Plot
                    key={id}
                    id={id}
                    shape={shape}
                    shapeProps={restProps}
                    plant={plant}
                    plant_species={plant_species}
                    onDragEnd={() => { }}
                    plotRefs={plotRefs}
                    draggable='false' />
                )
              })}
            </Layer>
          </Stage>
        </div>
      )}
      <div className="plant-info">
        <h2>🌿 Lavender</h2>
        <p><strong>Lavandula angustifolia</strong> is a fragrant perennial herb, loved for its scent and pollinator-friendly blooms.</p>
        <div className="icons">
          <span>💧</span>
          <span>☀️</span>
        </div>
      </div>
    </AppContainer>
  );
};

export default Outdoor;