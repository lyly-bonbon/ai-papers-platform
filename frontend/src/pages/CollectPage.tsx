import React, { useState } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Alert,
  Card,
  CardContent,
  Stack,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoModeIcon from '@mui/icons-material/AutoMode';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(25, 118, 210, 0.12)',
  overflow: 'hidden',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 20px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.2)',
  },
}));

// Table column definitions
const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    flex: 2,
    minWidth: 280,
    renderCell: (params: GridRenderCellParams) => (
      <Tooltip title={params.value} arrow>
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      </Tooltip>
    ),
  },
  {
    field: 'like_num',
    headerName: 'Likes',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'author_num',
    headerName: 'Authors',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'github_num',
    headerName: 'GitHub',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'comment_num',
    headerName: 'Comments',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'link',
    headerName: 'Link',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams) => (
      <IconButton
        size="small"
        href={params.value as string}
        target="_blank"
        rel="noopener"
        color="primary"
      >
        <OpenInNewIcon fontSize="small" />
      </IconButton>
    ),
  },
  {
    field: 'img_link',
    headerName: 'Cover',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams) => {
      const src = params.value as string;
      return src ? (
        <Box
          component="img"
          src={src}
          alt="cover"
          sx={{
            width: 56,
            height: 56,
            objectFit: 'cover',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      ) : (
        <Typography variant="caption" color="text.secondary">
          None
        </Typography>
      );
    },
  },
];

const CollectPage: React.FC = () => {
  const [type, setType] = useState<'monthly' | 'daily'>('monthly');
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState<Date | null>(new Date(2025, 8, 1));
  const [day, setDay] = useState<Date | null>(new Date(2025, 8, 1));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [papers, setPapers] = useState<any[]>([]);

  const handleCollect = async () => {
    if (!month) return;
    const m = month.getMonth() + 1;
    const d = day?.getDate() || 1;
    const data = type === 'monthly' ? { year, month: m } : { year, month: m, day: d };

    try {
      setLoading(true);
      setMessage('');
      setPapers([]);

      const res = await axios.post(`/api/collect/${type}`, data);
      const result = res.data;

      if (result.info === 'Success') {
        const formatted = result.result.map((item: any, idx: number) => ({
          ...item,
          id: item.id || `row-${idx}`,
        }));
        setPapers(formatted);
        setMessage(`Collection successful! Total ${formatted.length} papers`);
      } else {
        setMessage(`Collection failed: ${result.info}`);
      }
    } catch (err: any) {
      setMessage(`Request error: ${err.response?.data?.info || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isValid = month && year > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e8f4fd 0%, #d1e8ff 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(25, 118, 210, 0.02) 50px, rgba(25, 118, 210, 0.02) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(25, 118, 210, 0.02) 50px, rgba(25, 118, 210, 0.02) 51px)',
            animation: 'gridMove 30s linear infinite',
          },
          '@keyframes gridMove': {
            '0%': { transform: 'translate(0, 0)' },
            '100%': { transform: 'translate(-50px, -50px)' },
          },
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
              <Fade in timeout={600}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                      <AutoModeIcon color="primary" />
                      <Typography variant="h5" fontWeight={600}>
                        Data Collection
                      </Typography>
                    </Box>

                    <Stack spacing={3}>
                      <FormControl>
                        <FormLabel sx={{ fontWeight: 500, mb: 1 }}>Collection Mode</FormLabel>
                        <RadioGroup
                          row
                          value={type}
                          onChange={(e) => setType(e.target.value as 'monthly' | 'daily')}
                        >
                          <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                          <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        label="Year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        size="small"
                        fullWidth
                      />

                      <DatePicker
                        views={['month']}
                        label="Month"
                        value={month}
                        onChange={setMonth}
                        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                      />

                      {type === 'daily' && (
                        <Fade in={type === 'daily'}>
                          <DatePicker
                            views={['day']}
                            label="Date"
                            value={day}
                            onChange={setDay}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                          />
                        </Fade>
                      )}

                      <StyledButton
                        variant="contained"
                        onClick={handleCollect}
                        disabled={loading || !isValid}
                        fullWidth
                        startIcon={loading ? <CircularProgress size={20} /> : <AutoModeIcon />}
                        sx={{ mt: 2 }}
                      >
                        {loading ? 'Collecting...' : 'Start Collection'}
                      </StyledButton>

                      {message && (
                        <Fade in={!!message}>
                          <Alert severity={message.includes('successful') ? 'success' : 'error'}>
                            {message}
                          </Alert>
                        </Fade>
                      )}
                    </Stack>
                  </CardContent>
                </StyledCard>
              </Fade>
            </Grid>

            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
              <Fade in={papers.length > 0 || loading} timeout={600}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" fontWeight={600}>
                        Collection Results {papers.length > 0 && `(${papers.length} papers)`}
                      </Typography>
                      {papers.length > 0 && (
                        <Tooltip title="Re-collect">
                          <IconButton onClick={handleCollect} disabled={loading}>
                            <AutoModeIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {papers.length > 0 ? (
                      <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                          rows={papers}
                          columns={columns}
                          pageSizeOptions={[10, 25, 50]}
                          disableRowSelectionOnClick
                          loading={loading}
                          sx={{
                            '& .MuiDataGrid-cell': {
                              borderBottom: '1px solid rgba(0,0,0,0.05)',
                              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' },
                            },
                            '& .MuiDataGrid-columnHeaders': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              borderBottom: '2px solid #1976d2',
                            },
                            '& .MuiDataGrid-row:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            },
                          }}
                          getRowId={(row) => row.id}
                        />
                      </Box>
                    ) : loading ? (
                      <Stack spacing={1} sx={{ pt: 2 }}>
                        {[...Array(6)].map((_, i) => (
                          <Paper
                            key={i}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              display: 'flex',
                              gap: 2,
                              alignItems: 'center',
                              bgcolor: 'grey.50',
                            }}
                          >
                            <Box sx={{ flex: 2 }}><Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                            <Box sx={{ width: 80 }}><Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                            <Box sx={{ width: 80 }}><Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                            <Box sx={{ width: 80 }}><Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                            <Box sx={{ width: 80 }}><Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                            <Box sx={{ width: 80 }}><Box sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                            <Box sx={{ width: 100 }}><Box sx={{ height: 56, bgcolor: 'grey.300', borderRadius: 1 }} /></Box>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
                        <AutoModeIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                        <Typography variant="h6">Waiting for Collection</Typography>
                        <Typography variant="body2">Select time and click "Start Collection"</Typography>
                      </Box>
                    )}
                  </CardContent>
                </StyledCard>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default CollectPage;