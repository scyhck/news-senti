import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Badge, Row, Col, Button, Alert, Tooltip, OverlayTrigger, Modal, Form, ProgressBar } from 'react-bootstrap';
import { getDatabase, ref, get, update } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUser, 
  faTag, 
  faFolder, 
  faLink,
  faSearch,
  faBrain,
  faChartLine,
  faSync,
  faSmile,
  faMeh,
  faFrown,
  faInfoCircle,
  faListAlt,
  faFilter,
  faGlobe,
  faRss,
  faNewspaper,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from './AuthContext';
import '../AllPosts.css';

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzingPost, setAnalyzingPost] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const { user } = useAuth();
  
  // URL News Analyzer states
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [newsUrl, setNewsUrl] = useState('');
  const [urlProcessing, setUrlProcessing] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [urlStatus, setUrlStatus] = useState('');
  const [processingStep, setProcessingStep] = useState(0); // 0: not started, 1: fetching, 2: analyzing
  const [processingProgress, setProcessingProgress] = useState(0);
  const [newlyAddedPosts, setNewlyAddedPosts] = useState([]);
  const [showAnalyzeNewPosts, setShowAnalyzeNewPosts] = useState(false);

  // Function to analyze sentiment for a single post
  const analyzeSentiment = async (post) => {
    setAnalyzingPost(post.id);
    setAnalysisError(null);
    
    try {
      // Call the sentiment analysis API with the post content
      const response = await axios.post('http://127.0.0.1:5000/analyze', {
        text: post.description,
        title: post.title,
        tags: post.tags ? post.tags.join(',') : '',
        newsId: post.id
      });
      
      if (response.data.status === 'success') {
        // Update the post with sentiment analysis results
        const db = getDatabase();
        const postRef = ref(db, `NewsSentimentAnalysis/news/${post.id}`);
        await update(postRef, {
          sentiment: response.data.sentiment,
          sentimentScore: response.data.score * 100, // Convert decimal to percentage
          entities: response.data.entities || [],
          keyPhrases: response.data.keywords || [],
          analyzedAt: new Date().toISOString(),
          sentimentStatus: 'completed'
        });

        // Update local state to reflect changes
        setPosts(posts.map(p => 
          p.id === post.id 
            ? { 
                ...p, 
                sentiment: response.data.sentiment, 
                sentimentScore: response.data.score * 100,
                entities: response.data.entities || [],
                keyPhrases: response.data.keywords || [],
                analyzedAt: new Date().toISOString(),
                sentimentStatus: 'completed'
              } 
            : p
        ));
        
        setAnalysisSuccess(true);
        setTimeout(() => setAnalysisSuccess(false), 3000);
        return true;
      } else {
        throw new Error('Failed to analyze sentiment');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setAnalysisError(`Error analyzing sentiment: ${error.message}`);
      setTimeout(() => setAnalysisError(null), 5000);
      return false;
    } finally {
      setAnalyzingPost(null);
    }
  };

  // Function to process URL and fetch news
  const processNewsUrl = async () => {
    setUrlProcessing(true);
    setUrlError('');
    setUrlStatus('');
    setProcessingStep(1);
    setProcessingProgress(10);
    setNewlyAddedPosts([]);
    
    try {
      // Validate URL (basic check)
      if (!newsUrl || !newsUrl.startsWith('http')) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
      }
      
      setUrlStatus('Fetching and analyzing news content from URL...');
      setProcessingProgress(20);
      
      // Call the get-news API to process the URL
      const response = await axios.post('http://127.0.0.1:5000/get-news', {
        url: newsUrl
      });
      
      if (response.data.status === 'success') {
        setProcessingProgress(50);
        setUrlStatus('News articles extracted successfully! Refreshing data...');
        
        // Fetch the newly added posts
        await fetchLatestPosts();
        
        setProcessingProgress(70);
        setUrlStatus('News articles added to database successfully!');
        
        // Show success message and option to analyze sentiment
        setProcessingProgress(100);
        setShowAnalyzeNewPosts(true);
      } else {
        throw new Error('Failed to process news URL');
      }
    } catch (error) {
      console.error('Error processing news URL:', error);
      setUrlError(`Error: ${error.message || 'Failed to process URL'}`);
      setProcessingProgress(0);
      setProcessingStep(0);
    } finally {
      setUrlProcessing(false);
    }
  };
  
  // Function to fetch latest posts (including newly added ones)
  const fetchLatestPosts = async () => {
    try {
      const db = getDatabase();
      const postsRef = ref(db, 'NewsSentimentAnalysis/news');
      const snapshot = await get(postsRef);
      
      if (snapshot.exists()) {
        const postsData = [];
        const newPosts = [];
        const currentTime = Date.now();
        const fiveMinutesAgo = currentTime - (5 * 60 * 1000); // Posts added in the last 5 minutes
        
        snapshot.forEach((childSnapshot) => {
          const post = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          
          postsData.push(post);
          
          // Check if this is a newly added post (added in the last 5 minutes)
          if (post.createdAt && post.createdAt > fiveMinutesAgo) {
            newPosts.push(post);
          }
        });
        
        // Sort posts by creation date (newest first)
        const sortedPosts = postsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt - a.createdAt;
        });
        
        setPosts(sortedPosts);
        setNewlyAddedPosts(newPosts);
        
        return newPosts;
      }
    } catch (error) {
      console.error('Error fetching latest posts:', error);
      throw error;
    }
  };
  
  // Function to analyze newly added posts
  const analyzeNewPosts = async () => {
    setShowUrlModal(false);
    setAnalyzingAll(true);
    setProcessingStep(2);
    setAnalysisStatus('Analyzing newly added news articles...');
    setAnalysisError(null);
    
    try {
      // Get the latest posts again to ensure we have the most up-to-date list
      const newPosts = await fetchLatestPosts();
      const postsToAnalyze = newPosts.filter(post => !post.sentiment);
      
      if (postsToAnalyze.length === 0) {
        setAnalysisStatus('No new posts to analyze!');
        setTimeout(() => setAnalysisStatus(''), 3000);
        setAnalyzingAll(false);
        return;
      }
      
      setAnalysisStatus(`Analyzing ${postsToAnalyze.length} new articles...`);
      
      // Analyze each post sequentially
      let completed = 0;
      let successful = 0;
      
      for (const post of postsToAnalyze) {
        const success = await analyzeSentiment(post);
        completed++;
        if (success) successful++;
        
        setAnalysisStatus(`Analyzed ${completed} of ${postsToAnalyze.length} articles... (${successful} successful)`);
      }
      
      setAnalysisStatus(`Completed! Successfully analyzed ${successful} of ${postsToAnalyze.length} articles.`);
      setTimeout(() => setAnalysisStatus(''), 5000);
    } catch (error) {
      console.error('Error analyzing new posts:', error);
      setAnalysisError('Error during analysis. Some posts may not have been analyzed.');
      setTimeout(() => setAnalysisError(null), 5000);
    } finally {
      setAnalyzingAll(false);
      setProcessingStep(0);
      setProcessingProgress(0);
      setShowAnalyzeNewPosts(false);
      setNewsUrl('');
    }
  };

  // Function to analyze all posts
  const analyzeAllPosts = async () => {
    setAnalyzingAll(true);
    setAnalysisStatus('Analyzing all posts...');
    setAnalysisError(null);
    
    try {
      // Analyze each post sequentially
      let completed = 0;
      const postsToAnalyze = filteredPosts.filter(post => !post.sentiment);
      
      if (postsToAnalyze.length === 0) {
        setAnalysisStatus('All posts have already been analyzed!');
        setTimeout(() => setAnalysisStatus(''), 3000);
        setAnalyzingAll(false);
        return;
      }
      
      for (const post of postsToAnalyze) {
        await analyzeSentiment(post);
        completed++;
        setAnalysisStatus(`Analyzed ${completed} of ${postsToAnalyze.length} posts...`);
      }
      
      setAnalysisStatus('All posts have been analyzed successfully!');
      setTimeout(() => setAnalysisStatus(''), 5000);
    } catch (error) {
      console.error('Error in batch analysis:', error);
      setAnalysisError('Error during batch analysis. Some posts may not have been analyzed.');
      setTimeout(() => setAnalysisError(null), 5000);
    } finally {
      setAnalyzingAll(false);
    }
  };

  // Fetch posts from Firebase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const db = getDatabase();
        const postsRef = ref(db, 'NewsSentimentAnalysis/news');
        const snapshot = await get(postsRef);
        
        if (snapshot.exists()) {
          const postsData = [];
          snapshot.forEach((childSnapshot) => {
            postsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          // Sort posts by creation date (newest first)
          setPosts(postsData.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt - a.createdAt;
          }));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search term, category, and sentiment
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const matchesSentiment = selectedSentiment ? post.sentiment === selectedSentiment : true;
    return matchesSearch && matchesCategory && matchesSentiment;
  });

  // Extract unique categories for filter dropdown
  const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];
  
  // Sentiment options for filter
  const sentimentOptions = [
    { value: 'very positive', label: 'Very Positive' },
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
    { value: 'very negative', label: 'Very Negative' }
  ];
  
  // Get sentiment icon based on sentiment value
  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return faMeh;
    
    sentiment = sentiment.toLowerCase();
    if (sentiment.includes('positive')) return faSmile;
    if (sentiment.includes('negative')) return faFrown;
    return faMeh; // neutral or other
  };
  
  // Get sentiment color class
  const getSentimentColorClass = (sentiment) => {
    if (!sentiment) return '';
    
    sentiment = sentiment.toLowerCase();
    if (sentiment.includes('very positive')) return 'sentiment-very-positive';
    if (sentiment.includes('positive')) return 'sentiment-positive';
    if (sentiment.includes('very negative')) return 'sentiment-very-negative';
    if (sentiment.includes('negative')) return 'sentiment-negative';
    return 'sentiment-neutral';
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="posts-page mt-5">
      {/* Header Section */}
      <div className="page-header">
        <Container>
          <h1 className="text-center mb-3">News Articles</h1>
          <p className="text-center text-muted mb-5">
            Discover the latest news articles with sentiment analysis
          </p>

          {/* Admin Controls */}
          {user?.userType === 'admin' && (
            <div className="admin-controls mb-4">
              <div className="admin-buttons">
                <Button 
                  variant="primary"
                  className="analyze-btn me-3"
                  onClick={() => setShowUrlModal(true)}
                >
                  <FontAwesomeIcon icon={faGlobe} className="me-2" />
                  Add News from URL
                </Button>
                
                <Button 
                  variant="info"
                  className="analyze-all-btn"
                  onClick={analyzeAllPosts}
                  disabled={analyzingAll}
                >
                  <FontAwesomeIcon 
                    icon={analyzingAll ? faSync : faBrain} 
                    className={analyzingAll ? 'fa-spin me-2' : 'me-2'} 
                  />
                  {analyzingAll ? 'Analyzing All News...' : 'Analyze All News'}
                </Button>
              </div>
              
              {analysisStatus && (
                <Alert 
                  variant="info" 
                  className="analysis-status mt-3 animated fadeIn"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  {analysisStatus}
                </Alert>
              )}
              
              {analysisError && (
                <Alert 
                  variant="danger" 
                  className="analysis-status mt-3 animated fadeIn"
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  {analysisError}
                </Alert>
              )}
              
              {analysisSuccess && (
                <Alert 
                  variant="success" 
                  className="analysis-status mt-3 animated fadeIn"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Sentiment analysis completed successfully!
                </Alert>
              )}
            </div>
          )}
          
          {/* Search and Filter */}
          <div className="filters-container">
            <Row className="justify-content-center">
              <Col lg={4} md={6} className="mb-3">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </Col>
              
              <Col lg={4} md={6} className="mb-3">
                <div className="filter-box">
                  <FontAwesomeIcon icon={faFolder} className="filter-icon" />
                  <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </Col>
              
              <Col lg={4} md={6} className="mb-3">
                <div className="filter-box">
                  <FontAwesomeIcon icon={faChartLine} className="filter-icon" />
                  <select
                    className="filter-select"
                    value={selectedSentiment}
                    onChange={(e) => setSelectedSentiment(e.target.value)}
                  >
                    <option value="">All Sentiments</option>
                    {sentimentOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Col>
            </Row>
            
            <div className="filter-stats">
              <FontAwesomeIcon icon={faListAlt} className="me-2" />
              <span>Showing {filteredPosts.length} of {posts.length} articles</span>
              
              {(searchTerm || selectedCategory || selectedSentiment) && (
                <Button 
                  variant="link" 
                  className="clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedSentiment('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Posts Section */}
      <Container className="posts-container">
        {filteredPosts.length === 0 ? (
          <Card className="text-center p-4 no-posts-card">
            <Card.Body>
              <h4>No posts available</h4>
              <p>There are currently no posts matching your criteria.</p>
              {(searchTerm || selectedCategory || selectedSentiment) && (
                <Button 
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedSentiment('');
                  }}
                >
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Clear filters
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredPosts.map(post => (
              <Col key={post.id} lg={6} className="mb-4">
                <Card className={`post-card h-100 ${post.sentiment ? getSentimentColorClass(post.sentiment) + '-border' : ''}`}>
                  {post.imageUrl && (
                    <div className="post-image-container">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="post-image"
                      />
                      <div className="category-overlay">
                        <Badge bg="primary" className="category-badge">
                          <FontAwesomeIcon icon={faFolder} className="me-1" />
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <Card.Body>
                    <div className="post-meta">
                      {!post.imageUrl && (
                        <Badge bg="primary" className="category-badge">
                          <FontAwesomeIcon icon={faFolder} className="me-1" />
                          {post.category}
                        </Badge>
                      )}
                      <span className="post-date">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                    
                    <Card.Title className="post-title">{post.title}</Card.Title>
                    
                    <div className="post-author">
                      <FontAwesomeIcon icon={faUser} className="me-1" />
                      {post.authorEmail || 'Anonymous'}
                    </div>
                    
                    <Card.Text className="post-description">
                      {post.description}
                    </Card.Text>
                    
                    {post.source && (
                      <div className="post-source">
                        <FontAwesomeIcon icon={faLink} className="me-1" />
                        <a href={post.source} target="_blank" rel="noopener noreferrer">
                          Source
                        </a>
                      </div>
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        <FontAwesomeIcon icon={faTag} className="me-2" />
                        {post.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            bg="secondary"
                            className="tag-badge"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Sentiment Analysis Section */}
                    <div className="sentiment-section mt-3">
                      {post.sentiment ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-${post.id}`}>
                              {post.keyPhrases && post.keyPhrases.length > 0 && (
                                <div>
                                  <strong>Key phrases:</strong> {post.keyPhrases.slice(0, 3).join(', ')}
                                </div>
                              )}
                              {post.entities && post.entities.length > 0 && (
                                <div>
                                  <strong>Entities:</strong> {post.entities.slice(0, 3).join(', ')}
                                </div>
                              )}
                            </Tooltip>
                          }
                        >
                          <div className={`sentiment-result ${getSentimentColorClass(post.sentiment)}`}>
                            <FontAwesomeIcon icon={getSentimentIcon(post.sentiment)} className="me-2" />
                            <span>Sentiment: <strong>{post.sentiment}</strong></span>
                            <span className="sentiment-score">
  Score: <strong>{(typeof post.sentimentScore === 'number' ? post.sentimentScore : Number(post.sentimentScore) || 0).toFixed(1)}%</strong>
</span>
                          </div>
                        </OverlayTrigger>
                      ) : (
                        user?.userType === 'admin' && (
                          <Button
                            variant="outline-primary"
                            className="analyze-btn w-100"
                            onClick={() => analyzeSentiment(post)}
                            disabled={analyzingPost === post.id}
                          >
                            {analyzingPost === post.id ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faBrain} className="me-2" />
                                Analyze Sentiment
                              </>
                            )}
                          </Button>
                        )
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      
      {/* URL Analyzer Modal */}
      <Modal 
        show={showUrlModal} 
        onHide={() => {
          if (!urlProcessing) {
            setShowUrlModal(false);
            setNewsUrl('');
            setUrlError('');
            setUrlStatus('');
            setProcessingStep(0);
            setProcessingProgress(0);
            setShowAnalyzeNewPosts(false);
          }
        }}
        backdrop="static"
        keyboard={!urlProcessing}
        centered
        className="url-analyzer-modal"
      >
        <Modal.Header closeButton={!urlProcessing}>
          <Modal.Title>
            <FontAwesomeIcon icon={faGlobe} className="me-2" />
            Add News from URL
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {urlError && (
            <Alert variant="danger" className="mb-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {urlError}
            </Alert>
          )}
          
          <Form onSubmit={(e) => {
            e.preventDefault();
            processNewsUrl();
          }}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon icon={faLink} className="me-2" />
                News Website URL
              </Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/news-article"
                value={newsUrl}
                onChange={(e) => setNewsUrl(e.target.value)}
                disabled={urlProcessing || showAnalyzeNewPosts}
                required
              />
              <Form.Text className="text-muted">
                Enter the URL of a news article or news website to analyze
              </Form.Text>
            </Form.Group>
            
            {processingStep > 0 && (
              <div className="processing-info mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="processing-label">
                    {processingStep === 1 && (
                      <FontAwesomeIcon icon={faRss} className="me-2" />
                    )}
                    {processingStep === 2 && (
                      <FontAwesomeIcon icon={faBrain} className="me-2" />
                    )}
                    {urlStatus}
                  </span>
                  <span className="processing-percentage">
                    {processingProgress}%
                  </span>
                </div>
                <ProgressBar 
                  now={processingProgress} 
                  variant={
                    processingProgress < 33 ? "info" : 
                    processingProgress < 66 ? "primary" : 
                    "success"
                  } 
                  animated={processingProgress < 100}
                  className="mb-3"
                />
                
                {showAnalyzeNewPosts && (
                  <div className="mt-4">
                    <Alert variant="success">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                      Successfully added {newlyAddedPosts.length} new articles!
                    </Alert>
                    
                    <div className="news-items-preview">
                      {newlyAddedPosts.slice(0, 3).map((post, index) => (
                        <div key={index} className="news-item-preview">
                          <FontAwesomeIcon icon={faNewspaper} className="me-2" />
                          {post.title}
                        </div>
                      ))}
                      {newlyAddedPosts.length > 3 && (
                        <div className="news-item-more">
                          and {newlyAddedPosts.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="modal-actions mt-4">
              {!showAnalyzeNewPosts ? (
                <Button
                  variant="primary"
                  type="submit"
                  disabled={urlProcessing || !newsUrl}
                  className="w-100"
                >
                  {urlProcessing ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faRss} className="me-2" />
                      Process News URL
                    </>
                  )}
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowUrlModal(false);
                      setNewsUrl('');
                      setUrlError('');
                      setUrlStatus('');
                      setProcessingStep(0);
                      setProcessingProgress(0);
                      setShowAnalyzeNewPosts(false);
                    }}
                    className="flex-grow-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="success"
                    onClick={analyzeNewPosts}
                    className="flex-grow-1"
                  >
                    <FontAwesomeIcon icon={faBrain} className="me-2" />
                    Analyze New Articles
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AllPosts;