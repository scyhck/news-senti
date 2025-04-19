// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container,Row,Col } from 'react-bootstrap';
import { AuthProvider } from './components/AuthContext';
import Navigation from './components/Navigation';
import Home from './components/Home';
import About from './components/About';
import Register from './components/Register';
import Login from './components/Login';
import PostNews from './components/PostNews';
import MyPosts from './components/MyPosts';
import AllPosts from './components/AllPosts';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post-news" element={<PostNews />} />
          <Route path="/view-news" element={<AllPosts />} />
          <Route path="/my-posts/:userId" element={<MyPosts />} />
        </Routes>
        <footer className="bg-dark text-light py-4">
          <Container>
            <Row className="mt-3">
              <Col className="text-center">
                <p>&copy; 2025 Sentiment Analysis. All rights reserved.</p>
              </Col>
            </Row>
          </Container>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;