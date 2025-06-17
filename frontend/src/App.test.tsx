import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BGChat title', () => {
  render(<App />);
  const titleElement = screen.getByText(/BGChat/i);
  expect(titleElement).toBeInTheDocument();
});
