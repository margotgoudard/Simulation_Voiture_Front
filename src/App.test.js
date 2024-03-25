import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import App, { FuelBar, generateRandomNumber, getRotationAngle } from './App';

// TEST UNITAIRES 


beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ newPosition: { positionX: 1, positionY: 1, carburant: 55 } }),
    })
  );

  global.EventSource = jest.fn(() => ({
    onmessage: jest.fn(),
    onerror: jest.fn(),
    close: jest.fn(),
  }));
});


describe('FuelBar Component', () => {
  test('renders correctly with initial fuel', () => {
    render(<FuelBar carburant={30} />);
    const fuelBarFill = screen.getByTestId('fuel-bar-fill');
    expect(fuelBarFill).toHaveStyle('width: 50%');
  });

  test('calculates the fuel bar width correctly', () => {
    const { rerender } = render(<FuelBar carburant={60} />);
    let fuelBarFill = screen.getByTestId('fuel-bar-fill');
    expect(fuelBarFill).toHaveStyle('width: 100%');

    rerender(<FuelBar carburant={15} />);
    fuelBarFill = screen.getByTestId('fuel-bar-fill');
    expect(fuelBarFill).toHaveStyle('width: 25%');

    rerender(<FuelBar carburant={45} />);
    fuelBarFill = screen.getByTestId('fuel-bar-fill');
    expect(fuelBarFill).toHaveStyle('width: 75%');
  });

  test('has correct styles applied', () => {
    render(<FuelBar carburant={60} />);
    const fuelBarFill = screen.getByTestId('fuel-bar-fill');
    const fuelBarContainer = screen.getByTestId('fuel-bar-container');
    expect(fuelBarContainer).toHaveStyle('width: 300px; height: 30px; background-color: grey; border-radius: 15px; overflow: hidden;');
    expect(fuelBarFill).toHaveStyle('height: 100%; background-color: orange; transition: width 0.5s ease-in-out;');
  });
});

test('FuelBar width adjusts correctly', () => {
  render(<FuelBar carburant={30} />);
  const fuelBarFill = screen.getByTestId('fuel-bar-fill');
  expect(fuelBarFill.style.width).toBe('50%');
});

describe('getRotationAngle function', () => {
  test('returns correct angle for direction', () => {
    expect(getRotationAngle('h')).toBe('180deg');
    expect(getRotationAngle('b')).toBe('0deg');
    expect(getRotationAngle('g')).toBe('90deg');
    expect(getRotationAngle('d')).toBe('-90deg');
    expect(getRotationAngle('')).toBe('0deg');
  });
});

test('generateRandomNumber returns a number within the expected range', () => {
  const max = 10;
  for (let i = 0; i < 100; i++) {
    const number = generateRandomNumber(max);
    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThan(max);
  }
});


describe('Vehicle Movement and Fuel Consumption', () => {
  test('Vehicle moves and consumes fuel on arrow key press', async () => {
    render(<App />);
    
    const startButton = screen.getByText('Commencer à jouer');
    fireEvent.click(startButton);
    
    const initialFuelBarFill = await screen.findByTestId('fuel-bar-fill');
    
    expect(initialFuelBarFill).toHaveStyle('width: 100%');
    
    fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });

    await waitFor(() => {
      const updatedFuelBarFill = screen.getByTestId('fuel-bar-fill');
      
      expect(updatedFuelBarFill.style.width).toBe('100%');
    });

    const vehicle = screen.getByTestId('voiture');
    expect(vehicle.style.left).not.toBe('0px');
  });
});

describe('User Journey: Starting and Playing the Game', () => {
  test('User starts the game, moves the vehicle, and recharges fuel', async () => {
    render(<App />);
    
    // L'utilisateur voit le bouton pour commencer à jouer et clique dessus
    const startButton = screen.getByRole('button', { name: /commencer à jouer/i });
    fireEvent.click(startButton);

    // Attendre que le bouton de démarrage disparaisse, indiquant que le jeu a commencé
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /commencer à jouer/i })).not.toBeInTheDocument();
    });

    // Simuler l'appui sur la touche droite pour déplacer la voiture
    fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });

    // Attendre que le carburant soit consommé et vérifier que la barre de carburant a diminué
    await waitFor(() => {
      const fuelBarFill = screen.getByTestId('fuel-bar-fill');
      expect(fuelBarFill).not.toHaveStyle('width: 100%');
    }, { timeout: 3000 }); // Augmenter le délai si nécessaire pour permettre l'animation

    // Supposons que le véhicule approche d'une station et se recharge
    // NOTE: Ce scénario nécessite que le mock de fetch dans le beforeEach gère la rechargement
    await waitFor(() => {
      const fuelBarFill = screen.getByTestId('fuel-bar-fill');
      expect(fuelBarFill).toHaveStyle('width: 100%');
    });

    // Vérifier que le message de crash n'est pas affiché, indiquant que le joueur n'a pas rencontré d'obstacle
    expect(screen.queryByText(/Vous êtes rentré dans un obstacle!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vous vous êtes fait écraser!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Vous n'avez plus d'essence!/i)).not.toBeInTheDocument();
  });
});