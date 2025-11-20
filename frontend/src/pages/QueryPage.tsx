import React, { useState } from 'react';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Chip, 
  Alert, 
  Card, 
  CardContent, 
  Skeleton, 
  Fade, 
  IconButton, 
  Tooltip,
  Stack
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Search, Download } from '@mui/icons-material';
import axios from 'axios';

const QueryPage: React.FC = () => {
  const [fields, setFields] = useState<string[]>(['title', 'authors']);
  const [limit, setLimit] = useState(100);
  const [where, setWhere] = useState<{ [key: string]: number | string }>({ year: 2025 });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuery = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await axios.post('/api/query', { fields, limit, where });
      setResults(resp.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const addField = (field: string) => setFields([...fields, field]);
  const removeField = (field: string) => setFields(fields.filter(f => f !== field));
  const updateWhere = (key: string, value: string) => setWhere({ ...where, [key]: value });

  const columns: GridColDef[] = fields.map(field => ({
    field,
    headerName: field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' '),  // Beautify header (e.g., like_num → Like Num)
    width: 150,
    flex: 1,
    type: 'string',  // Unified string type handling
    renderCell: (params: GridRenderCellParams) => (
      <Tooltip title={params.value || 'N/A'}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.value}
        </span>
      </Tooltip>
    ),
  }));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f4fd 0%, #d1e8ff 100%)',  // Light blue gradient
        position: 'relative',
        overflow: 'hidden',
        '&::before': {  // Subtle grid pattern
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(25, 118, 210, 0.02) 50px, rgba(25, 118, 210, 0.02) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(25, 118, 210, 0.02) 50px, rgba(25, 118, 210, 0.02) 51px)',
          animation: 'gridMove 30s linear infinite',
        },
        '@keyframes gridMove': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-50px, -50px)' },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
        {/* Configuration Card: Add field buttons */}
        <Fade in timeout={600}>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Query Configuration</Typography>
                <Tooltip title="Export CSV">
                  <IconButton color="primary">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <TextField 
                  label="Limit" 
                  type="number" 
                  value={limit} 
                  onChange={(e) => setLimit(Number(e.target.value))} 
                  size="small" 
                  sx={{ minWidth: 120 }} 
                />
                <TextField 
                  label="Year Filter" 
                  value={where.year || ''} 
                  onChange={(e) => updateWhere('year', e.target.value)} 
                  size="small" 
                  sx={{ minWidth: 120 }} 
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>Query Fields:</Typography>
                {fields.map(f => (
                  <Chip 
                    key={f} 
                    label={f} 
                    onDelete={() => removeField(f)} 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontSize: '0.8rem' }}
                  />
                ))}
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>  {/* Beautified button group */}
                {/* Core fields */}
                <Button 
                  variant="outlined" 
                  onClick={() => addField('title')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Title
                </Button>
                {/* Added fields: string type, unified color */}
                <Button 
                  variant="outlined" 
                  onClick={() => addField('like_num')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Like Num
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => addField('author_num')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Author Num
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => addField('github_num')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Github Num
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => addField('publish_time')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Publish Time
                </Button>
                {/* Added fields: id and link, string format, unified color */}
                <Button 
                  variant="outlined" 
                  onClick={() => addField('id')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Id
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => addField('link')} 
                  size="small"
                  color="primary"
                  sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  + Link
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleQuery} 
                  disabled={loading || fields.length === 0} 
                  startIcon={<Search />}
                  sx={{ ml: 'auto', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  {loading ? 'Querying...' : 'Execute Query'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Results Card */}
        <Fade in={results.length > 0 || loading} timeout={600}>
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Query Results ({results.length} records)</Typography>
                <Tooltip title="Export CSV">
                  <IconButton color="primary">
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
              {loading ? (
                <Box sx={{ pt: 2 }}>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ) : results.length > 0 ? (
                <Box sx={{ height: 500, width: '100%' }}>
                  <DataGrid 
                    rows={results} 
                    columns={columns} 
                    pageSizeOptions={[10, 25, 50]} 
                    disableRowSelectionOnClick 
                    sx={{ 
                      '& .MuiDataGrid-cell': { 
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                      },
                      '& .MuiDataGrid-columnHeaders': { 
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        borderBottom: '2px solid #1976d2'
                      },
                      '& .MuiDataGrid-row:hover': { 
                        backgroundColor: 'rgba(25, 118, 210, 0.04)' 
                      },
                    }}
                    getRowId={(row) => row.id || Math.random()}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <Search sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6">No results</Typography>
                  <Typography variant="body2">Try adjusting fields or filter conditions</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default QueryPage;