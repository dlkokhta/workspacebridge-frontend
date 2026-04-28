import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { RegistrationPage } from '../pages/registerPage/RegisterPage';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegistrationPage />
    </MemoryRouter>,
  );
}

const VALID_FORM = {
  firstName: 'John',
  lastName: 'Doee',
  email: 'john@example.com',
  password: 'Password1!',
  repeatPassword: 'Password1!',
};

async function fillForm(overrides: Partial<typeof VALID_FORM> = {}) {
  const data = { ...VALID_FORM, ...overrides };
  await userEvent.type(screen.getByPlaceholderText('Enter your first name'), data.firstName);
  await userEvent.type(screen.getByPlaceholderText('Enter your last name'), data.lastName);
  await userEvent.type(screen.getByPlaceholderText('Enter your email'), data.email);
  await userEvent.type(screen.getByPlaceholderText('Enter your password'), data.password);
  await userEvent.type(screen.getByPlaceholderText('Repeat your password'), data.repeatPassword);
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields and a submit button', () => {
    renderRegisterPage();
    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting an empty form', async () => {
    renderRegisterPage();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter your first name/i)).toBeInTheDocument();
    });
  });

  it('shows the RegistrationSuccess modal on successful submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Registration successful!' } });

    renderRegisterPage();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please check your email to verify your account/i),
      ).toBeInTheDocument();
    });
  });

  it('navigates to /login when the modal is closed', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Registration successful!' } });

    renderRegisterPage();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => screen.getByText(/Please check your email/i));

    const closeButton = screen.getByRole('button', { name: /^close$/i });
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows a string API error message', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'User already exists' } },
    });

    renderRegisterPage();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
    });
  });

  it('shows the first item when the API error message is an array', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: ['Email is invalid', 'Password too weak'] } },
    });

    renderRegisterPage();
    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is invalid/i)).toBeInTheDocument();
    });
  });
});
