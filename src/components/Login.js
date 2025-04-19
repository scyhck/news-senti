// Login.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignInAlt, 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faUserCircle,
  faNewspaper,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from './AuthContext';
import '../Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const db = getDatabase();
      const usersRef = ref(db, 'NewsSentimentAnalysis/users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        let userFound = false;
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          if (
            userData.email === email &&
            userData.password === password &&
            userData.userType === userType
          ) {
            userFound = true;
            login({
              email: userData.email,
              userType: userData.userType,
              userId: childSnapshot.key
            });
            navigate('/post-news');
            return;
          }
        });

        if (!userFound) {
          setError('Invalid email, password, or user type');
        }
      } else {
        setError('No users found');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={9} lg={7} xl={6}>
            <Card className="login-card">
              <Row className="g-0">
                {/* Left side - Login Form */}
                <Col md={7}>
                  <Card.Body className="login-form-container">
                    <div className="text-center mb-4">
                      <h3 className="welcome-text">Welcome Back!</h3>
                      <p className="text-muted">Please login to your account</p>
                    </div>

                    {error && (
                      <Alert variant="danger" className="animated fadeIn">
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                    <label>
                          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                          Email address
                        </label>
                      <Form.Group className="form-floating mb-3">
                        <Form.Control
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="custom-input"
                        />
                        
                      </Form.Group>

                      <label>
                      <FontAwesomeIcon icon={faLock} className="me-2" />
                      Password
                    </label>

                      <Form.Group className="form-floating mb-3">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="custom-input"
                        />
                     
                        <Button
                          variant="link"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </Button>
                      </Form.Group>

                      <label>
                      <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                      User Type
                    </label>
                      <Form.Group className="form-floating mb-4">
                        <Form.Select
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          className="custom-input"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </Form.Select>
                       
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        className="login-btn w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" />
                        ) : (
                          <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                        )}
                        {loading ? 'Logging in...' : 'Login'}
                      </Button>

                      <div className="text-center mt-4">
                        <span className="text-muted">Don't have an account? </span>
                        <a href="/register" className="register-link">
                          <FontAwesomeIcon icon={faUserPlus} className="me-1" />
                          Sign up
                        </a>
                      </div>
                    </Form>
                  </Card.Body>
                </Col>

                {/* Right side - Banner */}
                <Col md={5} className="d-none d-md-block">
                  <div className="login-banner">
                    <div className="banner-content">
                      <FontAwesomeIcon icon={faNewspaper} className="banner-icon" />
                      <h2>News Sentiment Analysis</h2>
                      <p>Discover insights through AI-powered news analysis</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;