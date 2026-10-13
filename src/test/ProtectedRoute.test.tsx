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

const CLIENT_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: '2', email: 'c@d.com', role: 'CLIENT' })) +
  '.sig';

const FREELANCER_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: '3', email: 'e@f.com', role: 'FREELANCER' })) +
  '.sig';

const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ userId: '1', email: 'a@b.com', role: 'ADMIN' })) +
  '.sig';

type Role = 'ADMIN' | 'CLIENT' | 'FREELANCER';

function renderProtectedRoute(requiredRole?: string, allowedRoles?: Role[]) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole} allowedRoles={allowedRoles}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/portal" element={<div>Portal Page</div>} />
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

  it('redirects to /dashboard when token role does not match requiredRole', () => {
    mockedUseAuth.mockReturnValue({ accessToken: USER_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute('ADMIN');
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirects a client to /portal when the route requires another role', () => {
    mockedUseAuth.mockReturnValue({ accessToken: CLIENT_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute('ADMIN');
    expect(screen.getByText('Portal Page')).toBeInTheDocument();
  });

  it('redirects a client to /portal from a freelancer-only route', () => {
    mockedUseAuth.mockReturnValue({ accessToken: CLIENT_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute(undefined, ['FREELANCER', 'ADMIN']);
    expect(screen.getByText('Portal Page')).toBeInTheDocument();
  });

  it('redirects a freelancer to /dashboard from a client-only route', () => {
    mockedUseAuth.mockReturnValue({ accessToken: FREELANCER_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute(undefined, ['CLIENT']);
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('renders children when token role is in allowedRoles', () => {
    mockedUseAuth.mockReturnValue({ accessToken: FREELANCER_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute(undefined, ['FREELANCER', 'ADMIN']);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when token role matches requiredRole', () => {
    mockedUseAuth.mockReturnValue({ accessToken: ADMIN_TOKEN, setAccessToken: vi.fn(), isLoading: false });
    renderProtectedRoute('ADMIN');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
