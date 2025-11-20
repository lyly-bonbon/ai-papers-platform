import React, { useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  Chip,
  Fade,
} from '@mui/material';
import { ThumbUp, GitHub, Star, AccessTime } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Paper {
  arxiv_id: string;
  title: string;
  suggest_score: number;
  img_link: string;
  like_num: number | string;
  github_num: string;
  publish_time: string;
}

const RecommendPage: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRecommend = async () => {
    if (!keywords.trim()) return;
    try {
      setLoading(true);
      setError('');
      const resp = await axios.post('/api/recommend', { keywords });
      setPapers(resp.data as Paper[]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (arxivId: string) => {
    // Navigate to /assist and pass arxiv_id parameter
    navigate(`/assist?arxiv_id=${arxivId}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f4fd 0%, #d1e8ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(25,118,210,0.02) 50px, rgba(25,118,210,0.02) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(25,118,210,0.02) 50px, rgba(25,118,210,0.02) 51px)',
          animation: 'gridMove 30s linear infinite',
        },
        '@keyframes gridMove': {
          '0%': { transform: 'translate(0,0)' },
          '100%': { transform: 'translate(-50px,-50px)' },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Input Area */}
        <Fade in timeout={600}>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom align="center">
                Intelligent Paper Recommendation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Keywords (e.g., AI image generation)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  sx={{ flex: 1, minWidth: 280 }}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleRecommend}
                  disabled={loading || !keywords.trim()}
                  sx={{
                    px: 4,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Recommendations'}
                </Button>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Fade>

        {/* Recommendation Results - Latest Grid size API */}
        <Fade in={papers.length > 0 || loading} timeout={800}>
          <Box>
            {loading ? (
              <Grid container spacing={3}>
                {[...Array(8)].map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <Box sx={{ pt: '60%', position: 'relative', bgcolor: 'grey.200' }} />
                      <CardContent>
                        <Box sx={{ height: 60, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                        <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1, width: '60%' }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : papers.length > 0 ? (
              <Grid container spacing={3}>
                {papers.map((paper) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={paper.arxiv_id}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleCardClick(paper.arxiv_id)}
                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                      >
                        {/* Cover Image - 3/5 */}
                        <Box sx={{ position: 'relative', width: '100%', pt: '60%' }}>
                          <CardMedia
                            component="img"
                            image={paper.img_link}
                            alt={paper.title}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>

                        {/* Info Area - 2/5 */}
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 'bold',
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {paper.title}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                            <Chip
                              icon={<Star sx={{ fontSize: 16 }} />}
                              label={paper.suggest_score}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Chip
                              icon={<ThumbUp sx={{ fontSize: 14 }} />}
                              label={paper.like_num}
                              size="small"
                              color="success"
                            />
                            {paper.github_num && (
                              <Chip
                                icon={<GitHub sx={{ fontSize: 14 }} />}
                                label={paper.github_num}
                                size="small"
                                color="secondary"
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption">{paper.publish_time}</Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : null}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default RecommendPage;