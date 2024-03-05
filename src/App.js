import React, { useEffect, useState } from 'react';
import backgroundImage from './fond.png';
import voitureImage from './voiture.png';
import stationImage from './station.png';
import obstaclesImage from './obstacles.png';
import boulesImage from './boules.png';



function FuelBar({ carburant }) {
  // Calculez la largeur de la barre de carburant en pourcentage
  const fuelWidth = `${(carburant / 60) * 100}%`;

  // Style pour le conteneur de la barre de carburant
  const fuelBarContainerStyle = {
    width: '300px', // ou la largeur que vous souhaitez
    height: '30px', // ou la hauteur que vous souhaitez
    backgroundColor: 'grey', // Couleur de fond pour la partie non remplie
    borderRadius: '15px', // Rayon pour les coins arrondis
    overflow: 'hidden',
  };


  // Style pour la barre de carburant remplie
  const fuelBarFillStyle = {
    width: fuelWidth,
    height: '100%',
    backgroundColor: 'orange', // Couleur de remplissage pour le carburant
    transition: 'width 0.5s ease-in-out', // Transition pour animer le changement de carburant
  };

  return (
    <div style={fuelBarContainerStyle}>
      <div style={fuelBarFillStyle}></div>
    </div>
  );
}

const getRotationAngle = (direction) => {
  switch (direction) {
    case 'h': return '180deg'; // Haut
    case 'b': return '0deg'; // Bas
    case 'g': return '90deg'; // Gauche
    case 'd': return '-90deg'; // Droite
    default: return '0deg';
  }
};


function App() {

  const [crashMessage, setCrashMessage] = useState('');

  function generateRandomNumber(maxX) {
    const x = Math.floor(Math.random() * maxX);
    return x;
  }

  

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

  const [showStartPopup, setShowStartPopup] = useState(true); // État pour le popup de démarrage
  const [showCrashPopup, setShowCrashPopup] = useState(false); 
  

  useEffect(() => {

    const squareEdgeInPositions = squareEdge / 10; // Convertir en unités de position

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
        
        const hitBoule = boules.some(boule =>
          Math.abs(boule.x - clampedX) === 0 &&
          Math.abs(boule.y - clampedY) === 0
        );
  
        if (hitObstacle) {
      console.log('Collision avec un obstacle!');
      setCrashMessage('Vous êtes rentré dans un obstacle!');
      setShowCrashPopup(true);
      return; // Arrêtez la fonction ici pour éviter de définir la position après un crash
    }

    if (hitBoule) {
      console.log('Écrasé par une boule!');
      setCrashMessage('Vous vous êtes fait écraser!');
      setShowCrashPopup(true);
      return; // Arrêtez la fonction ici pour éviter de définir la position après un crash
    }

    if (newPosition.carburant <= 0) {
      console.log('Plus d\'essence!');
      setCrashMessage('Vous n\'avez plus d\'essence!');
      setShowCrashPopup(true);
      return; // Arrêtez la fonction ici pour éviter de définir la position après un crash
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
      const eventSource = new EventSource("http://localhost:8080/voiture");
    
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Data received from server:", data);
        setPosition({
          x: data.positionX,
          y: data.positionY,
          carburant: data.carburant,
          direction: data.direction
        });
        setBoules(data.boules);
      };
    
      return () => {
        eventSource.close();
      };
    }, []);
    

  const startGame = () => {
    setShowStartPopup(false); // Cache le popup de démarrage
  };

  const restartGame = async () => {
    setShowCrashPopup(false); // Cache le popup de crash

    try {
      await fetch('http://localhost:8080/voiture/reinitialiser', { method: 'POST' });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du jeu:', error);
    }
  
    // Réinitialiser les positions de départ et le carburant
    setPosition({
      x: centerX,
      y: centerY,
      direction: 'd',
      carburant: 60
    });
  
    // Réinitialiser les positions des stations
    setStations([...Array(4)].map(() => ({
      x: generateRandomNumber(Math.floor(squareEdge / 10)),
      y: generateRandomNumber(Math.floor(squareEdge / 10))
    })));
  
    // Réinitialiser les positions des obstacles
    setObstacles([...Array(10)].map(() => ({
      x: generateRandomNumber(Math.floor(squareEdge / 10)),
      y: generateRandomNumber(Math.floor(squareEdge / 10))
    })));
  
    // Réinitialiser les positions des boules
    setBoules([...Array(2)].map(() => ({ // Supposons que vous avez 2 boules, ajustez selon le nombre réel
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
    
      animation: 'pulse 2s infinite ease-in-out', // Appliquer l'animation d'ombre pulsante
    
  };

  const voitureStyle = {
  backgroundImage: `url(${voitureImage})`,// Chemin de votre image
   backgroundSize: '50% 50%', // Couvrir l'ensemble de la div
   backgroundRepeat: 'no-repeat',

    backgroundPosition: 'center', // Centrer l'image dans la div
    width: '50px', // Ajustez selon la taille de votre image
    height: '50px',
    position: 'absolute',
    top: `${position.y * 10}px`,
    left: `${position.x * 10}px`,
    transition: 'all 0.5s ease',
    transform: `rotate(${getRotationAngle(position.direction)})`
  };

  const stationStyle = {
    backgroundImage: `url(${stationImage})`, // Utilisez l'image de station importée
    backgroundSize: 'contain', // Cela assure que l'image s'adapte à la taille de la div sans être déformée
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '30px', // Définissez la taille que vous souhaitez pour les images de station
    height: '30px',
    position: 'absolute',
    transition: 'all 0.5s ease',
  };

  const obstacleStyle = {
    backgroundImage: `url(${obstaclesImage})`, // Utilisez l'image de station importée
    backgroundSize: 'contain', // Cela assure que l'image s'adapte à la taille de la div sans être déformée
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '30px', // Définissez la taille que vous souhaitez pour les images de station
    height: '30px',
    position: 'absolute',
    transition: 'all 0.5s ease',
  };

  const bouleStyle = {
    backgroundImage: `url(${boulesImage})`, // Utilisez l'image de station importée
    backgroundSize: 'contain', // Cela assure que l'image s'adapte à la taille de la div sans être déformée
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '30px', // Définissez la taille que vous souhaitez pour les images de station
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
          <p>{crashMessage}</p> {/* Ajouté pour afficher le message de crash */}
          <button onClick={restartGame}>Recommencer</button>
        </div>
      )}

      {!showStartPopup && !showCrashPopup && (
        <div style={containerStyle}>
          <FuelBar carburant={position.carburant} />
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
            <div style={voitureStyle}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
