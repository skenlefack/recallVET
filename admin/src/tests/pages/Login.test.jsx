import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/auth/Login';

const mockLogin = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null
  })
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

function getEmailInput() {
  return screen.getByRole('textbox', { type: 'email' }) || document.querySelector('input[type="email"]');
}

describe('Login', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders login form with email and password fields', () => {
    const { container } = renderLogin();
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('shows error when login fails', async () => {
    mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
    const { container } = renderLogin();

    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'test@test.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls login function on form submit', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { token: 't', user: {}, tenants: [] } });
    const { container } = renderLogin();

    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'test@test.com' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });
});
