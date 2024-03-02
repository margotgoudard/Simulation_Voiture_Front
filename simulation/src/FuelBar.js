function FuelBar({ carburant }) {
    // Calculez la largeur de la barre de carburant en pourcentage
    const fuelWidth = `${(carburant / 100) * 100}%`;
  
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