// About.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNewspaper, 
  faChartLine, 
  faUsers, 
  faGlobe,
  faRobot,
  faLightbulb,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import '../About.css';

function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="hero-section text-center">
        <Container>
          <h1 className="display-4 fw-bold text-gradient">About News Sentiment Analysis</h1>
          <p className="lead hero-subtitle">
            Transforming how we understand and interact with news through AI-powered sentiment analysis
          </p>
        </Container>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="justify-content-center g-4">
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="icon-wrapper blue">
                    <FontAwesomeIcon icon={faNewspaper} className="feature-icon" />
                  </div>
                  <Card.Title className="mt-4">News Aggregation</Card.Title>
                  <Card.Text>
                    We collect and curate news from diverse sources to provide a comprehensive view of current events, ensuring you never miss important updates.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="icon-wrapper green">
                    <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
                  </div>
                  <Card.Title className="mt-4">Sentiment Analysis</Card.Title>
                  <Card.Text>
                    Our state-of-the-art ML algorithms analyze the emotional tone of news articles, providing valuable insights into media coverage.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <div className="icon-wrapper purple">
                    <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                  </div>
                  <Card.Title className="mt-4">User Collaboration</Card.Title>
                  <Card.Text>
                    Join our community to contribute, share perspectives, and engage with news in a meaningful way through collaborative features.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mission-content">
              <h2 className="section-title">Our Mission</h2>
              <p className="mission-text">
                We're dedicated to revolutionizing how people consume and understand news through advanced sentiment analysis technology. Our platform empowers readers to:
              </p>
              <ul className="mission-list">
                <li>
                  <FontAwesomeIcon icon={faGlobe} className="list-icon" />
                  Access diverse perspectives from global news sources
                </li>
                <li>
                  <FontAwesomeIcon icon={faRobot} className="list-icon" />
                  Leverage AI-powered sentiment analysis for deeper insights
                </li>
                <li>
                  <FontAwesomeIcon icon={faLightbulb} className="list-icon" />
                  Make informed decisions based on comprehensive analysis
                </li>
              </ul>
            </Col>
            <Col lg={6}>
              <div className="stats-container">
                <div className="stat-card">
                  <FontAwesomeIcon icon={faChartBar} className="stat-icon" />
                  <div className="stat-content">
                    <h3>99.9%</h3>
                    <p>Analysis Accuracy</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FontAwesomeIcon icon={faNewspaper} className="stat-icon" />
                  <div className="stat-content">
                    <h3>10K+</h3>
                    <p>Articles Analyzed Daily</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                  <div className="stat-content">
                    <h3>50K+</h3>
                    <p>Active Users</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default About;