// Import React and testing utilities
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components and functions from your application
import App, { FuelBar, generateRandomNumber, getRotationAngle } from './App';

// Mock EventSource globally before any test runs
beforeAll(() => {
  global.EventSource = jest.fn(() => ({
    onmessage: jest.fn(),
    onerror: jest.fn(),
    close: jest.fn(),
  }));
});

// Describe block for the FuelBar component tests
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

// Single test block for FuelBar width adjustment
test('FuelBar width adjusts correctly', () => {
  render(<FuelBar carburant={30} />);
  const fuelBarFill = screen.getByTestId('fuel-bar-fill');
  expect(fuelBarFill.style.width).toBe('50%');
});

// Describe block for the getRotationAngle function tests
describe('getRotationAngle function', () => {
  test('returns correct angle for direction', () => {
    expect(getRotationAngle('h')).toBe('180deg');
    expect(getRotationAngle('b')).toBe('0deg');
    expect(getRotationAngle('g')).toBe('90deg');
    expect(getRotationAngle('d')).toBe('-90deg');
    expect(getRotationAngle('')).toBe('0deg'); // Default case
  });
});

// Test block for the generateRandomNumber function
test('generateRandomNumber returns a number within the expected range', () => {
  const max = 10;
  for (let i = 0; i < 100; i++) {
    const number = generateRandomNumber(max);
    expect(number).toBeGreaterThanOrEqual(0);
    expect(number).toBeLessThan(max);
  }
});
