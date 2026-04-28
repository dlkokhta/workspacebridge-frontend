import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { LoginPage } from '../pages/loginPage/LoginPage';
import { useAuth } from '../context/AuthContext';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

vi.mock('../context/AuthContext');
const mockedUseAuth = vi.mocked(useAuth);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSetAccessToken = vi.fn();

function renderLoginPage() {
  mockedUseAuth.mockReturnValue({
    accessToken: null,
    setAccessToken: mockSetAccessToken,
    isLoading: false,
  });
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields and a submit button', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderLoginPage();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByText(/email must be a valid email/i)).toBeInTheDocument();
    });
  });

  it('shows API error message below the email field on failed login', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'User not found. Please register first.' } },
    });

    renderLoginPage();
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/user not found. please register first./i),
      ).toBeInTheDocument();
    });
  });

  it('stores the token and navigates to /profile for regular users', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'access-token-123',
        user: { role: 'USER' },
      },
    });

    renderLoginPage();
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(mockSetAccessToken).toHaveBeenCalledWith('access-token-123');
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('navigates to /adminPanel for admin users', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'admin-token',
        user: { role: 'ADMIN' },
      },
    });

    renderLoginPage();
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'admin@example.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'Password1!');
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/adminPanel');
    });
  });
});
