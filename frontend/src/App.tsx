import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import BookIcon from '@mui/icons-material/Book';
import RecommendIcon from '@mui/icons-material/Recommend';
import AccessTime from '@mui/icons-material/AccessTime';
import { Login, Logout } from '@mui/icons-material';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import ListItemButton from '@mui/material/ListItemButton';
import theme from './theme';
import CollectPage from './pages/CollectPage';
import QueryPage from './pages/QueryPage';
import AssistReadPage from './pages/AssistReadPage';
import RecommendPage from './pages/RecommendPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
axios.interceptors.request.use((config) => {
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cookies, , removeCookie] = useCookies(['token']);
  const isLoggedIn = !!cookies.token;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const logout = () => {
    axios.post('/auth/logout').then(() => {
      removeCookie('token');
      window.location.href = '/login';
    }).catch(() => removeCookie('token'));
  };

  const drawer = (
    <List sx={{ 
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      pl: 2
    }}>
      {isLoggedIn ? (
        <>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/collect'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><HomeIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/collect'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><DescriptionIcon color="secondary" /></ListItemIcon>
              <ListItemText primary="Data Collection" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/query'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><SearchIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Data Query" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/assist'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><BookIcon color="secondary" /></ListItemIcon>
              <ListItemText primary="Assist Reading" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/recommend'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><RecommendIcon color="primary" /></ListItemIcon>
              <ListItemText primary="Recommended Reading" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/history'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><AccessTime color="primary" /></ListItemIcon>
              <ListItemText primary="Reading History" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={logout} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><Logout color="error" /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </>
      ) : (
        <>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/login'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><Login color="primary" /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => window.location.href = '/register'} sx={{ alignItems: 'flex-start' }}>
              <ListItemIcon><Login color="secondary" /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItemButton>
          </ListItem>
          <Divider />
        </>
      )}
    </List>
  );

  const renderPage = (component: React.ReactNode, hideDrawer = false) => (
    <>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>AI Paper Reading Platform</Typography>
        </Toolbar>
      </AppBar>
      {!hideDrawer && (
        <>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ 
              display: { xs: 'block', sm: 'none' }, 
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, zIndex: 1200 } 
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240, zIndex: 1200 } 
            }}
            open
          >
            {drawer}
          </Drawer>
        </>
      )}
      <Toolbar sx={{ minHeight: 64 }} />
      <Box sx={{ 
        p: 3, 
        ml: hideDrawer ? 0 : { sm: 24 },  // Sidebar width offset
        backgroundColor: 'background.default', 
        minHeight: 'calc(100vh - 64px)' 
      }}>
        {component}
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/collect" /> : <Navigate to="/login" />} />
          <Route path="/login" element={renderPage(<LoginPage />, true)} />  {/* Hide sidebar */}
          <Route path="/register" element={renderPage(<RegisterPage />, true)} />  {/* Hide sidebar */}
          <Route path="/collect" element={isLoggedIn ? renderPage(<CollectPage />) : <Navigate to="/login" />} />
          <Route path="/query" element={isLoggedIn ? renderPage(<QueryPage />) : <Navigate to="/login" />} />
          <Route path="/assist" element={isLoggedIn ? renderPage(<AssistReadPage />) : <Navigate to="/login" />} />
          <Route path="/history" element={isLoggedIn ? renderPage(<HistoryPage />) : <Navigate to="/login" />} />
          <Route path="/recommend" element={isLoggedIn ? renderPage(<RecommendPage />) : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;