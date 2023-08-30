import { render, screen } from '@testing-library/react';
import Mixnodes from './Mixnodes';

test('renders learn react link', () => {
  render(<Mixnodes />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
