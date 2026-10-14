import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../../components/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
    showItemsPerPage: false
  };

  it('renders pagination with correct page numbers', () => {
    render(<Pagination {...defaultProps} />);
    const pageButtons = screen.getAllByRole('button');
    const pageNumbers = pageButtons.map(b => b.textContent).filter(t => /^\d+$/.test(t));
    expect(pageNumbers).toContain('1');
    expect(pageNumbers).toContain('5');
  });

  it('calls onPageChange when clicking a page button', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    const prevButton = screen.getByTitle('Page précédente');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    const nextButton = screen.getByTitle('Page suivante');
    expect(nextButton).toBeDisabled();
  });
});
