import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module before importing AuthContext
vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { AuthProvider, useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

function TestConsumer() {
  const { user, login, logout, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <button onClick={() => login('test@test.com', 'pass123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides user state (initially null)', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
      expect(screen.getByTestId('auth').textContent).toBe('no');
    });
  });

  it('login updates user state', async () => {
    api.post.mockResolvedValue({
      success: true,
      data: {
        token: 'tok123',
        refreshToken: 'ref123',
        user: { name: 'Jean' },
        tenants: [{ id: 1, name: 'Clinic A' }]
      }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Jean');
      expect(screen.getByTestId('auth').textContent).toBe('yes');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'pass123'
    });
  });

  it('logout clears user state', async () => {
    api.post.mockResolvedValue({
      success: true,
      data: {
        token: 'tok123',
        refreshToken: 'ref123',
        user: { name: 'Jean' },
        tenants: []
      }
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Login first
    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Jean');
    });

    // Then logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
      expect(screen.getByTestId('auth').textContent).toBe('no');
    });
  });
});
