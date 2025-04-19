// Register.js
import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faLock, 
  faNewspaper, 
  faUserShield,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { register } from '../firebase';
import '../Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    secretKey: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.userType === 'admin' && !formData.secretKey) {
      setError('Secret key is required for admin registration');
      return;
    }

    try {
      await register(formData);
      setSuccess(true);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'user',
        secretKey: '',
      });
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container fluid className="register-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={10} lg={8} xl={7}>
          <Card className="register-card">
            <Row className="g-0">
              {/* Left Column - Image and Welcome Text */}
              <Col md={5} className="register-banner">
                <div className="banner-content">
                  <FontAwesomeIcon icon={faNewspaper} className="banner-icon" />
                  <h2>Welcome to News Sentiment Analysis</h2>
                  <p>Join our community and discover insights through AI-powered news analysis</p>
                </div>
              </Col>

              {/* Right Column - Registration Form */}
              <Col md={7}>
                <Card.Body className="form-section">
                  <h3 className="text-center mb-4">Create Account</h3>
                  
                  {error && <Alert variant="danger" className="animated fadeIn">{error}</Alert>}
                  {success && <Alert variant="success" className="animated fadeIn">Registration successful! Please log in.</Alert>}
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                      <label><FontAwesomeIcon icon={faUser} className="me-2" />Name</label>
                        <Form.Group className="form-floating mb-3">
                       
                          <Form.Control
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="custom-input"
                          />
                         
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                      <label><FontAwesomeIcon icon={faPhone} className="me-2" />Phone Number</label>
                        <Form.Group className="form-floating mb-3">
                          <Form.Control
                            type="tel"
                            placeholder="Phone Number"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            className="custom-input"
                          />
                          
                        </Form.Group>
                      </Col>
                    </Row>

                    <label><FontAwesomeIcon icon={faEnvelope} className="me-2" />Email address</label>
                    <Form.Group className="form-floating mb-3">
                      <Form.Control
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="custom-input"
                      />
                      
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                      <label><FontAwesomeIcon icon={faLock} className="me-2" />Password</label>
                        <Form.Group className="form-floating mb-3">
                          <Form.Control
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="custom-input"
                          />
                         
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                      <label><FontAwesomeIcon icon={faLock} className="me-2" />Confirm</label>
                        <Form.Group className="form-floating mb-3">
                          <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="custom-input"
                          />
                          
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={formData.userType === 'admin' ? 6 : 12}>
                      <label><FontAwesomeIcon icon={faUserShield} className="me-2" />User Type</label>
                        <Form.Group className="form-floating mb-3">
                          <Form.Select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="custom-input"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </Form.Select>
                         
                        </Form.Group>
                      </Col>
                      
                      {formData.userType === 'admin' && (
                        <Col md={6}>
                        <label><FontAwesomeIcon icon={faLock} className="me-2" />Secret Key</label>
                          <Form.Group className="form-floating mb-3">
                            <Form.Control
                              type="password"
                              placeholder="Admin Secret Key"
                              name="secretKey"
                              value={formData.secretKey}
                              onChange={handleChange}
                              className="custom-input"
                            />
                            
                          </Form.Group>
                        </Col>
                      )}
                    </Row>

                    <Button variant="primary" type="submit" className="w-100 mt-3 register-btn">
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />Register
                    </Button>

                    <div className="text-center mt-4">
                      <p className="mb-0">
                        Already have an account?{' '}
                        <a href="/login" className="login-link">
                          <FontAwesomeIcon icon={faSignInAlt} className="me-1" />
                          Log In
                        </a>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;