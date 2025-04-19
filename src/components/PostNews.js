// PostNews.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { getDatabase, ref, push, serverTimestamp, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNewspaper, 
  faUpload, 
  faTags, 
  faLink, 
  faList,
  faHeading,
  faChartBar,
  faFileAlt,
  faCheck,
  faSpinner,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import axios from 'axios';
import '../PostNews.css';

function PostNews() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    source: '',
    tags: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentSuccess, setSentimentSuccess] = useState(false);
  const [sentimentError, setSentimentError] = useState('');
  const [progress, setProgress] = useState(0);
  const [newsId, setNewsId] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const analyzeSentiment = async (newsData, newsKey) => {
    try {
      setSentimentLoading(true);
      setProgress(25);
      
      // Calling sentiment analysis API
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        text: newsData.description,
        title: newsData.title
      });
      
      setProgress(75);
      
      if (response.data && response.data.sentiment) {
        const sentimentData = {
          sentiment: response.data.sentiment, // e.g. 'positive', 'negative', 'neutral'
          sentimentScore: response.data.score, // e.g. 0.75
          entities: response.data.entities || [],
          keywords: response.data.keywords || [],
          sentimentAnalyzedAt: serverTimestamp()
        };
        
        // Update the news record with sentiment data
        const db = getDatabase();
        const newsRef = ref(db, `NewsSentimentAnalysis/news/${newsKey}`);
        await update(newsRef, sentimentData);
        
        setProgress(100);
        setSentimentSuccess(true);
      } else {
        throw new Error('Invalid sentiment analysis response');
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      setSentimentError(error.message || 'Failed to analyze sentiment');
      setProgress(100);
    } finally {
      setSentimentLoading(false);
      setTimeout(() => {
        navigate('/view-news');
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    setSentimentError('');
    setSentimentSuccess(false);

    try {
      if (!user) {
        throw new Error('You must be logged in to post news');
      }

      let imageUrl = '';
      if (image) {
        const storage = getStorage();
        const imageRef = storageRef(storage, `news-images/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const newsData = {
        ...formData,
        imageUrl,
        authorId: user.userId,
        authorEmail: user.email,
        authorType: user.userType,
        createdAt: serverTimestamp(),
        status: 'active',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        sentimentStatus: 'pending'
      };

      const db = getDatabase();
      const newsRef = ref(db, 'NewsSentimentAnalysis/news');
      const newNewsRef = await push(newsRef, newsData);
      const newsKey = newNewsRef.key;
      setNewsId(newsKey);

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'general',
        source: '',
        tags: ''
      });
      setImage(null);
      setPreviewUrl('');
      
      // Once the news is posted, analyze sentiment
      await analyzeSentiment(newsData, newsKey);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-news-page mt-5">
      <Container>
        <Card className="post-news-card">
          <Card.Header className="post-header">
            <FontAwesomeIcon icon={faNewspaper} className="header-icon" />
            <h2>Post News Article</h2>
          </Card.Header>

          <Card.Body className="p-4">
            {error && (
              <Alert variant="danger" className="animated fadeIn">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="animated fadeIn">
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                News posted successfully!
                
                {sentimentLoading && (
                  <div className="mt-3">
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faChartBar} spin={false} className="me-2" />
                      <span>Analyzing sentiment...</span>
                    </div>
                    <ProgressBar 
                      animated 
                      now={progress} 
                      variant={progress < 100 ? "info" : "success"} 
                      className="sentiment-progress" 
                    />
                  </div>
                )}
                
                {sentimentSuccess && (
                  <div className="mt-2">
                    <Badge bg="info" className="me-2">
                      <FontAwesomeIcon icon={faChartBar} className="me-1" />
                      Sentiment analyzed
                    </Badge>
                  </div>
                )}
                
                {sentimentError && (
                  <div className="mt-2 text-warning">
                    <small>
                      <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                      {sentimentError}
                    </small>
                  </div>
                )}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Left Column */}
                <Col lg={6}>
                  <div className="form-section">
                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon-wrapper">
                       
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className="custom-input"
                        />
                        <Form.Label>Title</Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon-wrapper">
                        
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="custom-input custom-textarea"
                        />
                        <Form.Label>Description</Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon-wrapper">
                       
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="custom-input"
                        >
                          <option value="general">General</option>
                          <option value="politics">Politics</option>
                          <option value="technology">Technology</option>
                          <option value="business">Business</option>
                          <option value="science">Science</option>
                          <option value="health">Health</option>
                          <option value="sports">Sports</option>
                          <option value="entertainment">Entertainment</option>
                        </Form.Select>
                        <Form.Label>Category</Form.Label>
                      </div>
                    </Form.Group>
                  </div>
                </Col>

                {/* Right Column */}
                <Col lg={6}>
                  <div className="form-section">
                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon-wrapper">
                       
                        <Form.Control
                          type="text"
                          name="source"
                          value={formData.source}
                          onChange={handleChange}
                          className="custom-input"
                        />
                        <Form.Label>Source</Form.Label>
                      </div>
                    </Form.Group>

                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon-wrapper">
                       
                        <Form.Control
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          className="custom-input"
                        />
                        <Form.Label>Tags</Form.Label>
                      </div>
                      <Form.Text className="text-muted">
                        Separate tags with commas (e.g., politics, economy, global)
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <div className="image-upload-container">
                        <div className={`upload-area ${previewUrl ? 'with-preview' : ''}`}>
                         
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                          />
                          <p>Drop your image here or click to browse</p>
                          <small className="text-muted">
                            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                          </small>
                        </div>
                        {previewUrl && (
                          <div className="image-preview">
                            <img src={previewUrl} alt="Preview" />
                            <Button 
                              variant="danger" 
                              size="sm" 
                              className="remove-image-btn"
                              onClick={() => {
                                setImage(null);
                                setPreviewUrl('');
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </div>
                </Col>
              </Row>

              <div className="submit-section">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="sentiment-info">
                    <FontAwesomeIcon icon={faChartBar} className="me-2 text-info" />
                    <span>Sentiment analysis will be performed automatically after posting</span>
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || sentimentLoading}
                    className="submit-button"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faNewspaper} className="me-2" />
                        Post News
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default PostNews;