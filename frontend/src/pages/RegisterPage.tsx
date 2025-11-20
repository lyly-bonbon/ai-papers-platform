import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Card, 
  CardContent, 
  Fade 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password || !email) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setError('');
      await axios.post('/auth/register', { username, password, email });
      alert('Registration successful, please log in');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  // Unified blue-purple gradient
        position: 'relative',
        overflow: 'hidden',
        '&::before': {  // Unified blue wave pattern
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 40% 60%, rgba(120,119,198,0.3) 0%, transparent 50%), 
                            radial-gradient(circle at 60% 40%, rgba(102,126,234,0.3) 0%, transparent 50%)`,
          animation: 'float 6s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Card sx={{ 
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" align="center" gutterBottom color="primary">
                Register New Account
              </Typography>
              <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
                Join us to explore the world of AI papers
              </Typography>
              <TextField 
                label="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                fullWidth 
                sx={{ mt: 2 }} 
                variant="outlined"
                placeholder="Enter username"
              />
              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                fullWidth 
                sx={{ mt: 2 }} 
                variant="outlined"
                placeholder="Enter password"
              />
              <TextField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                fullWidth 
                sx={{ mt: 2 }} 
                variant="outlined"
                placeholder="Enter email"
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Button 
                variant="contained" 
                onClick={handleRegister} 
                fullWidth 
                sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                color="primary"
              >
                Register Now
              </Button>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account? <a href="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>Log in now</a>
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default RegisterPage;