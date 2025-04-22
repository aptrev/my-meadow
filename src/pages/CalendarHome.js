import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ListGroup, Row, Col, Spinner, Placeholder } from 'react-bootstrap';
import { House, Flower1 } from 'react-bootstrap-icons';

import AppContainer from '../components/AppContainer';
import { AuthContext } from '../components/AuthProvider';
import { retrieveGardens } from '../utilities/FirebaseUtils';

const plant_species = [
  {
    id: 1473,
    name: 'Marigold',
    src: 'marigold.png',
    color: 'orange',
    waterFrequency: 'every 2 days',
  },
  {
    id: 324,
    name: 'Magnolia',
    src: 'magnolia.png',
    color: 'beige',
    waterFrequency: 'weekly',
  },
  {
    id: 1194,
    name: 'Begonia',
    src: 'begonia.png',
    color: 'pink',
    waterFrequency: 'every 3 days',
  },
  {
    id: 6791,
    name: 'Rose',
    src: 'rose.png',
    color: 'red',
    waterFrequency: 'every 2 days',
  },
];

const frequencyMap = {
  'every 2 days': 2,
  'every 3 days': 3,
  weekly: 7,
};

const CalendarHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [gardens, setGardens] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      retrieveGardens(user.uid).then((data) => {
        setGardens(data);
        const allEvents = generateAllGardenEvents(data);
        setEvents(allEvents);
        setLoading(false);
      });
    }
  }, [user]);

  const generateAllGardenEvents = (gardens) => {
    console.log("ALL GARDENS: ", gardens);
    const now = new Date();
    let allEvents = [];
  
    gardens.forEach((garden) => {
      if (!garden) return;
  
      // Normalize plant access
      let plants = [];
  
      if (garden.location === "outdoor") {
        plants = garden.plants || [];
      } else if (garden.location === "indoor") {
        plants = (garden.pots || [])
          .map(pot => pot.flower)
          .filter(Boolean);
      }
  
      plants.forEach((plant) => {
        const interval = frequencyMap[plant.waterFrequency] || 7; // Default to 7 days if undefined
        let current = new Date(now);
  
        for (let i = 0; i < 10; i++) {
          const date = new Date(current);
          date.setHours(8, 0, 0, 0); // 8am
          allEvents.push({
            title: `Water ${plant.name} (${garden.name})`,
            start: date.toISOString(),
            backgroundColor: garden.color || 'blue',
            borderColor: garden.color || 'blue',
            textColor: 'white',
          });
          current.setDate(current.getDate() + interval);
        }
      });
    });
  
    return allEvents;
  };
  
  const handleGoToGardenCalendar = (garden) => {
    const path = garden.location;
    const id = garden.id;
    navigate(`/${path}/${id}`);
  };

  return (
    <AppContainer>
      <h2 className="mb-4">All Gardens Calendar</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <div className="mb-5">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="auto"
            />
          </div>
          <p className="mt-4">Your Gardens</p>
          {gardens.length > 0 ? (
            <ListGroup className="home-garden-list mt-4 w-100" as="ol">
              {gardens.map((garden) => (
                <ListGroup.Item
                  key={garden.id}
                  onClick={() => handleGoToGardenCalendar(garden)}
                >
                  <Row>
                    <Col xs="auto">
                      {garden.location === 'indoor' ? (
                        <House color="currentColor" size="1.0em" />
                      ) : (
                        <Flower1 color="currentColor" size="1.0em" />
                      )}
                    </Col>
                    <Col>{garden.name}</Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <ListGroup className="mt-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <ListGroup.Item key={i}>
                  <Placeholder as="p" animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </>
      )}
    </AppContainer>
  );
};

export default CalendarHome;