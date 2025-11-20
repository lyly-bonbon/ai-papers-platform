import React, { useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  TextField,
  Alert,
  Card,
  CardContent,
  Skeleton,
  Fade,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookIcon from '@mui/icons-material/Book';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import axios from 'axios';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AssistReadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [arxivId, setArxivId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [analysis, setAnalysis] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadInfo, setDownloadInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    const urlArxivId = searchParams.get('arxiv_id');
    if (urlArxivId && !arxivId.trim()) {
      setArxivId(urlArxivId);
      setTimeout(() => {
        if (urlArxivId && /^\d+\.\d+$/.test(urlArxivId)) {
          handleRead();
        }
      }, 100);
    }
  }, [searchParams, arxivId]);

  const handleRead = async () => {
    if (!arxivId.trim() || !/^\d+\.\d+$/.test(arxivId)) {
      setError('Please enter a valid arXiv ID (e.g., 2305.03048)');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const resp = await axios.post('/api/assist/read', { arxiv_id: arxivId });
      setPdfUrl(resp.data.pdf_url);
      setAnalysis(resp.data.analysis || {});
      setDownloadInfo(resp.data.download_info || {}); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed, please check ID or network');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisValue = (key: string) => {
    const val = analysis[key];
    if (val === undefined || val === null) return 'N/A';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join('; ');
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
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
      <Container maxWidth="lg" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
        {/* Input Card */}
        <Fade in timeout={600}>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom align="center">
                Assist Reading
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField 
                  label="arXiv ID (e.g., 2305.03048)" 
                  value={arxivId} 
                  onChange={(e) => setArxivId(e.target.value)} 
                  sx={{ flex: 1 }} 
                  size="small" 
                />
                <Button 
                  variant="contained" 
                  onClick={handleRead} 
                  disabled={loading || !arxivId.trim()}
                  sx={{ px: 4, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Analysis'}
                </Button>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Fade>

        {/* Vertical layout: Top AI analysis, bottom PDF */}
        <Fade in={pdfUrl.length > 0 || loading} timeout={800}>
          <Box sx={{ mb: 3 }}>
            {/* Top: AI analysis Card */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>AI Analysis</Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : Object.keys(analysis).length > 0 ? (
                  <Box sx={{ height: 300, overflow: 'auto' }}>
                    {[
                      { title: 'Abstract Summary', key: 'abstract_summary' },
                      { title: 'Research Problem', key: 'research_problem' },
                      { title: 'Core Contributions', key: 'core_contribution' },
                      { title: 'Method Name', key: 'method_name' },
                      { title: 'Datasets', key: 'datasets' },
                      { title: 'Experimental Results', key: 'experimental_results' },
                      { title: 'Conclusion and Future Work', key: 'conclusion_and_future_work' },
                    ].map((item) => (
                      <Accordion key={item.key} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{item.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2">{getAnalysisValue(item.key)}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Raw Data</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <pre
                          style={{
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.8rem',
                            color: 'text.secondary',
                          }}
                        >
                          {JSON.stringify(analysis, null, 2)}
                        </pre>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <LightbulbIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                    <Typography variant="h6">Analysis Results</Typography>
                    <Typography variant="body2">After analysis is complete, key information extracted by AI will be displayed here</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Bottom: PDF Preview Card */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>PDF Paper</Typography>
                {loading ? (
                  <Skeleton variant="rectangular" height={800} />
                ) : pdfUrl ? (
                  <Box
                    sx={{
                      height: 800,
                      overflow: 'auto',
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,  // Rounded border, looks good
                      boxShadow: 1,  // Slight shadow
                    }}
                  >
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="100%"
                      style={{
                        border: 'none',  // No border
                        borderRadius: '4px',  // Rounded corners
                        display: 'block',
                      }}
                      title="PDF Preview"
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <BookIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                    <Typography variant="h6">PDF Not Loaded</Typography>
                    <Typography variant="body2">Enter arXiv ID to start analysis</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default AssistReadPage;