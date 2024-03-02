import React, { useEffect, useState } from 'react';

function App() {

  function generateRandomNumber(maxX) {
    const x = Math.floor(Math.random() * maxX);
    return x;
  }

  const squareSize = 50;
  const squareEdge = Math.min(window.innerWidth, window.innerHeight) * (squareSize / 100);


  const [position, setPosition] = useState({ carburant: 60 });
  const [stations, setStations] = useState([{ x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }]);
  const [obstacles, setObstacles] = useState([{ x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10)) }, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}, { x: generateRandomNumber(Math.floor(squareEdge / 10)), y: generateRandomNumber(Math.floor(squareEdge / 10))}]); 

  const [showStartPopup, setShowStartPopup] = useState(true); // État pour le popup de démarrage
  const [showCrashPopup, setShowCrashPopup] = useState(false); 

  const [voitures, setVoitures] = useState([
    { id: 1, positionX: 5, positionY: 5, couleur: 'red', direction: 'd', carburant: 60, estDetruite: false },
    { id: 2, positionX: 10, positionY: 10, couleur: 'blue', direction: 'g', carburant: 60, estDetruite: false }
  ]);
  

  

  useEffect(() => {

    const squareEdgeInPositions = squareEdge / 10; // Convertir en unités de position

    const centerX = squareEdge / 2 / 10;
    const centerY = squareEdge / 2 / 10;

    setPosition({
      x: centerX,
      y: centerY,
      direction: 'd',
      carburant: 60
    });

    const handleKeyPress = async (event) => {
      const keyMap = { ArrowUp: 'h', ArrowDown: 'b', ArrowLeft: 'g', ArrowRight: 'd' };
      const direction = keyMap[event.key];
      if (direction) {
        console.log(`Touche pressée: ${event.key}, Direction envoyée: ${direction}`);
        const response = await fetch(`http://localhost:8080/voiture/deplacer/${direction}`, { method: 'POST' });
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
          await fetch(`http://localhost:8080/voiture/recharger`, { method: 'POST' })
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
        
        if (hitObstacle) {
          console.log('Collision avec un obstacle!');
          setShowCrashPopup(true);
          return; // Prevent further execution to simulate the stop or destruction
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
  }, [squareSize, stations]);

  const startGame = () => {
    setShowStartPopup(false); // Cache le popup de démarrage
  };

  const restartGame = () => {
    setShowCrashPopup(false); // Cache le popup de crash
  
    // Calculer le centre du carré de jeu
    const squareEdge = Math.min(window.innerWidth, window.innerHeight) * (squareSize / 100);
    const centerX = squareEdge / 2 / 10; // Diviser par 10 pour convertir en unités de position
    const centerY = squareEdge / 2 / 10;
  
    // Réinitialiser la position de la voiture et son carburant
    setPosition({
      x: centerX,
      y: centerY,
      direction: 'd', // Vous pouvez choisir la direction initiale qui vous convient
      carburant: 60
    });
  };

  const handleCrash = () => {
    setShowCrashPopup(true); // Affiche le popup de crash
    // Autres logiques en cas de crash
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };

  const squareStyle = {
    position: 'relative',
    width: `${squareSize}vw`,
    height: `${squareSize}vh`,
    border: '3px solid black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0', // Couleur de fond douce
      border: '2px solid #ddd', // Bordure fine
      borderRadius: '10px', // Coins arrondis
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Ombre légère
      transition: 'transform 0.3s ease', // Transition pour l'animation
    
      // Animation : légère augmentation de taille au survol
      ':hover': {
        transform: 'scale(1.02)',
      },
    
      // Utilisez @keyframes pour une animation subtile de fond ou d'ombre
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
    
      animation: 'pulse 2s infinite ease-in-out', // Appliquer l'animation d'ombre pulsante
    
  };

  const voitureStyle = {
    position: 'absolute',
    top: `${position.y * 10}px`,
    left: `${position.x * 10}px`,
    transition: 'all 0.5s ease',
  };

  const carburantStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '20px',
    fontWeight: 'bold',
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
          <button onClick={restartGame}>Recommencer</button>
        </div>
      )}

      {!showStartPopup && !showCrashPopup && (
        <div style={containerStyle}>
          <div style={squareStyle}>
          {voitures.map((voiture, index) => (
            !voiture.estDetruite && (
             <div key={index} style={{ ...voitureStyle, top: `${voiture.positionY * 10}px`, left: `${voiture.positionX * 10}px`, backgroundColor: voiture.couleur }}>
              🚗
            </div>
            )
          ))}
            {obstacles.map((obstacle, index) => (
              <div key={`obstacle-${index}`} style={{ position: 'absolute', top: `${obstacle.y * 10}px`, left: `${obstacle.x * 10}px` }}>🏠</div>
            ))}
            {stations.map((station, index) => (
              <div key={index} style={{ position: 'absolute', top: `${station.y * 10}px`, left: `${station.x * 10}px` }}>⛽</div>
            ))}
            <div style={voitureStyle}>🚗</div>
            <div style={carburantStyle}>Carburant: {position.carburant}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
