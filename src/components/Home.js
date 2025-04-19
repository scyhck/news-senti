// Home.js
import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BiLineChart, BiNews, BiGroup } from 'react-icons/bi';
import '../Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Hero Carousel with Gradients */}
      <Carousel fade className="custom-carousel">
        <Carousel.Item>
          <div className="gradient-slide gradient-1">
            <Carousel.Caption className="carousel-content">
              <h1 className="display-3 fw-bold text-white text-shadow">Stay Updated</h1>
              <p className="lead mb-4">Get the latest news with sentiment analysis</p>
             
            </Carousel.Caption>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="gradient-slide gradient-2">
            <Carousel.Caption className="carousel-content">
              <h1 className="display-3 fw-bold text-white text-shadow">Track Sentiment</h1>
              <p className="lead mb-4">Analyze trends and patterns in real-time</p>
              
            </Carousel.Caption>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5 display-4 fw-bold">Our Features</h2>
          <Row className="g-4">
            <Col lg={4} md={6}>
              <Card className="h-100 feature-card shadow-sm border-0 hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3 gradient-icon-bg">
                    <BiLineChart size={40} className="text-primary" />
                  </div>
                  <Card.Title className="h4 mb-3 fw-bold">Sentiment Analysis</Card.Title>
                  <Card.Text className="text-muted">
                    Leverage advanced AI to understand the emotional context of news articles and track sentiment over time.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6}>
              <Card className="h-100 feature-card shadow-sm border-0 hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3 gradient-icon-bg">
                    <BiNews size={40} className="text-success" />
                  </div>
                  <Card.Title className="h4 mb-3 fw-bold">News Aggregation</Card.Title>
                  <Card.Text className="text-muted">
                    Access curated news from multiple trusted sources in one place with smart categorization.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4} md={6} className="mx-auto">
              <Card className="h-100 feature-card shadow-sm border-0 hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3 gradient-icon-bg">
                    <BiGroup size={40} className="text-info" />
                  </div>
                  <Card.Title className="h4 mb-3 fw-bold">Community Insights</Card.Title>
                  <Card.Text className="text-muted">
                    Connect with others and share valuable perspectives on trending topics and news.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section with Gradient */}
      <section className="cta-section text-center py-5 text-white gradient-cta">
        <Container>
          <h2 className="display-4 mb-4 fw-bold">Ready to Get Started?</h2>
          <p className="lead mb-4">Join thousands of users analyzing news sentiment</p>
          <div className="d-flex justify-content-center gap-3">
           
          </div>
        </Container>
      </section>
    </div>
  );
}

export default Home;