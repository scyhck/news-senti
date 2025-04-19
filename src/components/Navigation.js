// Navigation.js
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNewspaper, 
  faSignOutAlt, 
  faHome, 
  faInfoCircle, 
  faList, 
  faPlus, 
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import '../Navigation.css';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar 
      bg="light" 
      variant="light" 
      expand="lg" 
      fixed="top" 
      className={`custom-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
    >
      <Container>
        {/* Brand Logo and Name */}
        <Navbar.Brand as={Link} to="/" className="brand-container">
          <div className="logo-wrapper">
            <FontAwesomeIcon icon={faNewspaper} className="brand-icon" />
          </div>
          <span className="brand-text">Sentiment Analysis</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto nav-links">
            {!user && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/" 
                  className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faHome} className="nav-icon" />
                  &nbsp; <span>Home</span>
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/about"
                  className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="nav-icon" />
                  &nbsp; <span>About</span>
                </Nav.Link>
              </>
            )}
            
            {!user &&(
            <Nav.Link 
              as={Link} 
              to="/view-news"
              className={`nav-item ${location.pathname === '/view-news' ? 'active' : ''}`}
            >
              <FontAwesomeIcon icon={faList} className="nav-icon" />
              &nbsp;<span>Articles</span>
            </Nav.Link>
            )}

            {user ? (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/post-news"
                  className={`nav-item ${location.pathname === '/post-news' ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faPlus} className="nav-icon" />
                  &nbsp;  <span>Post News</span>
                </Nav.Link>
                
                <Nav.Link 
                  as={Link} 
                  to={`/my-posts/${user.userId}`}
                  className={`nav-item ${location.pathname.includes('/my-posts') ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faUser} className="nav-icon" />
                  &nbsp;    <span>My Posts</span>
                </Nav.Link>

                {user.userType === 'admin' && (
                  <Nav.Link 
                    as={Link} 
                    to="/view-news"
                    className={`nav-item ${location.pathname === '/all-posts' ? 'active' : ''}`}
                  >
                    <FontAwesomeIcon icon={faUsers} className="nav-icon" />
                    &nbsp;    <span>All Posts</span>
                  </Nav.Link>
                )}

                <Button 
                  variant="primary" 
                  onClick={handleLogout} 
                  className="logout-btn"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
                  &nbsp;    <span>Logout</span>
                </Button>
              </>
            ) : (
              <div className="auth-buttons">
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="outline-primary" 
                  className="register-btn"
                >
                  Register
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="primary" 
                  className="login-btn"
                >
                  Login
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;