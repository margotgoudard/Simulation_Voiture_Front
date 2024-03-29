import React, { useEffect, useState } from 'react';
import backgroundImage from './fond.png';
import voitureImage from './voiture.png';
import stationImage from './station.png';
import obstaclesImage from './obstacles.png';
import boulesImage from './boules.png';



export function FuelBar({ carburant }) {
  const fuelWidth = `${(carburant / 60) * 100}%`;

  const fuelBarContainerStyle = {
    width: '300px', 
    height: '30px', 
    backgroundColor: 'grey', 
    borderRadius: '15px', 
    overflow: 'hidden',
  };


  const fuelBarFillStyle = {
    width: fuelWidth,
    height: '100%',
    backgroundColor: 'orange', 
    transition: 'width 0.5s ease-in-out', 
  };

  return (
    <div style={fuelBarContainerStyle} data-testid="fuel-bar-container">
      <div style={fuelBarFillStyle} data-testid="fuel-bar-fill"></div>
    </div>
  );
}

export const getRotationAngle = (direction) => {
  switch (direction) {
    case 'h': return '180deg'; 
    case 'b': return '0deg'; 
    case 'g': return '90deg'; 
    case 'd': return '-90deg'; 
    default: return '0deg';
  }
};

export function generateRandomNumber(maxX) {
  const x = Math.floor(Math.random() * maxX);
  return x;
}


function App() {

  const [crashMessage, setCrashMessage] = useState('');
  
const serverUrl = 'https://polytech3.home.lange.xyz'; 
  const squareSize = 50;
  const squareEdge = Math.min(window.innerWidth, window.innerHeight) * (squareSize / 100);

  const centerX = squareEdge / 2 / 10;
    const centerY = squareEdge / 2 / 10;

  const [position, setPosition] = useState({ x: centerX, y: centerY, carburant: 60 });
  const [stations, setStations] = useState([{ x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }]);
  const [obstacles, setObstacles] = useState([{ x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}]); 
  const [boules, setBoules] = useState([
    { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, // Boule 1
  ]);

  const [showStartPopup, setShowStartPopup] = useState(true); 
  const [showCrashPopup, setShowCrashPopup] = useState(false); 
  

  useEffect(() => {

    const squareEdgeInPositions = squareEdge / 10; 

    const handleKeyPress = async (event) => {
      const keyMap = { ArrowUp: 'h', ArrowDown: 'b', ArrowLeft: 'g', ArrowRight: 'd' };
      const direction = keyMap[event.key];
      if (direction) {
        console.log(`Touche pressée: ${event.key}, Direction envoyée: ${direction}`);
        const response = await fetch(`${serverUrl}/voiture/deplacer/${direction}`, {
          mode: 'no-cors',
        method: 'POST' });
        const newPosition = await response.json();
        console.log(`Nouvelle position reçue:`, newPosition);

        // Empêcher la voiture de sortir du cadre
        const clampedX = Math.min(Math.max(newPosition.positionX, 0), squareEdgeInPositions);
        const clampedY = Math.min(Math.max(newPosition.positionY, 0), squareEdgeInPositions);

        const estProcheStation = stations.some(station =>
          Math.abs(station.x - clampedX) <= 1 &&
          Math.abs(station.y - clampedY) <= 1
        );

        if (estProcheStation) {
          console.log('Proche d\'une station, envoi de la requête de rechargement...');
          await fetch(`${serverUrl}/voiture/recharger`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
              console.log('Carburant rechargé:', data);
              newPosition.carburant = data.carburant;
            })
            .catch(error => console.error('Erreur lors du rechargement du carburant:', error));
        }

        const hitObstacle = obstacles.some(obstacle =>
          Math.abs(obstacle.x - clampedX) === 0 &&
          Math.abs(obstacle.y - clampedY) === 0
        );
        
        const hitBoule = boules.some(boule =>
          Math.abs(boule.x - clampedX) === 0 &&
          Math.abs(boule.y - clampedY) === 0
        );
  
        if (hitObstacle) {
      console.log('Collision avec un obstacle!');
      setCrashMessage('Vous êtes rentré dans un obstacle!');
      setShowCrashPopup(true);
      return; 
    }

    if (hitBoule) {
      console.log('Écrasé par une boule!');
      setCrashMessage('Vous vous êtes fait écraser!');
      setShowCrashPopup(true);
      return; 
    }

    if (newPosition.carburant <= 0) {
      console.log('Plus d\'essence!');
      setCrashMessage('Vous n\'avez plus d\'essence!');
      setShowCrashPopup(true);
      return; 
    }

        setPosition({
          x: clampedX,
          y: clampedY,
          direction: newPosition.direction,
          carburant: newPosition.carburant
        });
      }
    };
    window.addEventListener('keydown', handleKeyPress);

      return () => window.removeEventListener('keydown', handleKeyPress); 
    }, [boules, obstacles]);

    useEffect(() => {
      console.log("Setting up EventSource...");
      const eventSource = new EventSource("/voiture", 
        { withCredentials: true });
    
      eventSource.onopen = (event) => {
        console.log("Connection to server opened.", event);
      };
    
      eventSource.onmessage = (event) => {
        console.log("Event received:", event); 
        try {
          const data = JSON.parse(event.data);
          console.log("Data received from server:", data);
          setPosition({
            x: data.positionX,
            y: data.positionY,
            carburant: data.carburant,
            direction: data.direction
          });
          setBoules(data.boules);
        } catch (error) {
          console.error("Error parsing event data:", error);
        }
      };
    
      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
      };
    
      return () => {
        console.log("Closing EventSource...");
        eventSource.close();
      };
    }, []);

  
    

  const startGame = () => {
    setShowStartPopup(false); 
  };

  const restartGame = async () => {
    setShowCrashPopup(false); 

    try {
      await fetch('${serverUrl}/voiture/reinitialiser', { method: 'POST' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du jeu:', error);
    }

    setPosition({
      x: centerX,
      y: centerY,
      direction: 'd',
      carburant: 60
    });
  
    setStations([...Array(4)].map(() => ({
      x: generateRandomNumber(Math.floor(squareEdge / 10)),
      y: generateRandomNumber(Math.floor(squareEdge / 10))
    })));
  
    setObstacles([...Array(10)].map(() => ({
      x: generateRandomNumber(Math.floor(squareEdge / 10)),
      y: generateRandomNumber(Math.floor(squareEdge / 10))
    })));
  
    setBoules([...Array(2)].map(() => ({ 
      x: generateRandomNumber(Math.floor(squareEdge / 10)),
      y: generateRandomNumber(Math.floor(squareEdge / 10))
    })));
  };
  

  
  const containerStyle = {

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };

  const squareStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    position: 'relative',
    width: `35vw`,
    height: `${squareSize}vh`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
      transition: 'transform 0.3s ease', 
    
      ':hover': {
        transform: 'scale(1.02)',
      },
    
      '@keyframes pulse': {
        '0%': {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        '50%': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
        '100%': {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    
      animation: 'pulse 2s infinite ease-in-out', 
    
  };

  const voitureStyle = {
  backgroundImage: `url(${voitureImage})`,
   backgroundSize: '50% 50%',
   backgroundRepeat: 'no-repeat',

    backgroundPosition: 'center',
    width: '50px', 
    height: '50px',
    position: 'absolute',
    top: `${position.y * 10}px`,
    left: `${position.x * 10}px`,
    transition: 'all 0.5s ease',
    transform: `rotate(${getRotationAngle(position.direction)})`
  };

  const stationStyle = {
    backgroundImage: `url(${stationImage})`, 
    backgroundSize: 'contain', 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '30px',
    height: '30px',
    position: 'absolute',
    transition: 'all 0.5s ease',
  };

  const obstacleStyle = {
    backgroundImage: `url(${obstaclesImage})`, 
    backgroundSize: 'contain', 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '30px',
    height: '30px',
    position: 'absolute',
    transition: 'all 0.5s ease',
  };

  const bouleStyle = {
    backgroundImage: `url(${boulesImage})`, 
    backgroundSize: 'contain', 
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '30px', 
    height: '30px',
    position: 'absolute',
    transition: 'all 0.5s ease',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {showStartPopup && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <button onClick={startGame}>Commencer à jouer</button>
        </div>
      )}

    {showCrashPopup && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <p>{crashMessage}</p> {}
          <button onClick={restartGame}>Recommencer</button>
        </div>
      )}

      {!showStartPopup && !showCrashPopup && (
        <div style={containerStyle}>
          <FuelBar carburant={position.carburant} data-testid="fuel-bar-fill" />
          <div style={squareStyle}>
            {boules.map((boule, index) => (
              <div key={`boule-${index}`} style={{ ...bouleStyle, top: `${boule.y * 10}px`, left: `${boule.x * 10}px`, transition: 'all 0.5s ease' }}></div>
            ))}
            {obstacles.map((obstacle, index) => (
            <div key={index} style={{...obstacleStyle, top: `${obstacle.y * 10}px`, left: `${obstacle.x * 10}px` }}></div>
            ))}
            {stations.map((station, index) => (
            <div key={index} style={{...stationStyle, top: `${station.y * 10}px`, left: `${station.x * 10}px` }}></div>
            ))}
            <div style={voitureStyle} data-testid="voiture"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



    