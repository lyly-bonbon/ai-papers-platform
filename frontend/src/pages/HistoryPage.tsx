import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Fade,
  CircularProgress,
  Alert,
  Link,
  TableSortLabel,
} from '@mui/material';
import { ThumbUp, GitHub, AccessTime } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  id: number;
  arxiv_id: string;
  title: string;
  like_num: number;
  github_num: string;
  img_link: string;
  access_time: string;
}

const HistoryPage: React.FC = () => {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderBy, setOrderBy] = useState<'access_time' | 'like_num'>('access_time');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await axios.get('/api/history');
        setHistories(resp.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleSort = (column: 'access_time' | 'like_num') => {
    const isAsc = orderBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  const sortedHistories = [...histories].sort((a, b) => {
    if (orderBy === 'access_time') {
      const dateA = new Date(a.access_time).getTime();
      const dateB = new Date(b.access_time).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return order === 'asc' ? a.like_num - b.like_num : b.like_num - a.like_num;
    }
  });

  const handleTitleClick = (arxivId: string) => {
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
        <Fade in timeout={600}>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom align="center">
                Reading History
              </Typography>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Fade>

        <Fade in={!loading} timeout={800}>
          <Card variant="outlined">
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : histories.length > 0 ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                          Paper Title
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                          arXiv ID
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                          <TableSortLabel
                            active={orderBy === 'like_num'}
                            direction={orderBy === 'like_num' ? order : 'asc'}
                            onClick={() => handleSort('like_num')}
                          >
                            Likes
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                          GitHub
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.50' }}>
                          <TableSortLabel
                            active={orderBy === 'access_time'}
                            direction={orderBy === 'access_time' ? order : 'desc'}
                            onClick={() => handleSort('access_time')}
                          >
                            Access Time
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedHistories.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                          onClick={() => handleTitleClick(item.arxiv_id)}
                        >
                          <TableCell component="th" scope="row">
                            <Link
                              component="button"
                              variant="body2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTitleClick(item.arxiv_id);
                              }}
                              sx={{
                                textAlign: 'left',
                                fontWeight: 500,
                                color: 'primary.main',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {item.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.arxiv_id}
                              size="small"
                              color="default"
                              sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<ThumbUp sx={{ fontSize: 14 }} />}
                              label={item.like_num}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {item.github_num ? (
                              <Chip
                                icon={<GitHub sx={{ fontSize: 14 }} />}
                                label={item.github_num}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {item.access_time}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <AccessTime sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6">No reading records yet</Typography>
                  <Typography variant="body2">After using the "Assist Reading" feature, your history will be displayed here</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default HistoryPage;