import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext');
const mockedUseAuth = vi.mocked(useAuth);

const USER_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: '1', email: 'a@b.com', role: 'USER' })) +
  '.sig';

const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: '1', email: 'a@b.com', role: 'ADMIN' })) +
  '.sig';

function renderProtectedRoute(requiredRole?: string) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/items" element={<div>Items Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('renders nothing while loading', () => {
    mockedUseAuth.mockReturnValue({ accessToken: null, setAccessToken: vi.fn(), isLoading: true });
    const { container } = renderProtectedRoute();
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to /login when there is no access token', () => {
    mockedUseAuth.mockReturnValue({ accessToken: null, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when access token is present', () => {
    mockedUseAuth.mockReturnValue({ accessToken: USER_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to /items when token role does not match requiredRole', () => {
    mockedUseAuth.mockReturnValue({ accessToken: USER_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute('ADMIN');
    expect(screen.getByText('Items Page')).toBeInTheDocument();
  });

  it('renders children when token role matches requiredRole', () => {
    mockedUseAuth.mockReturnValue({ accessToken: ADMIN_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute('ADMIN');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
