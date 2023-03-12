import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Dialog,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import AdbIcon from '@mui/icons-material/Adb';
import MenuIcon from '@mui/icons-material/Menu';
import GoogleIcon from '@mui/icons-material/Google';
import { useTheme } from '@mui/material';

const pages = ['Products', 'Pricing', 'Blog'];
const settings = ['Home', 'Settings', 'Account', 'Logout'];


const Header = () => {
  const theme = useTheme()
  const router = useRouter();

  const fetchCalData = async () => {
    try {
      const req = await fetch('/api/get-google-data');
      const newData = await req.json();
      console.log(newData.results);
      return;
    } catch (error) {
      console.log(error)
    }

  };


  const isActive: (pathname: string) => boolean = (pathname) => (router.pathname === pathname);

  const { data: session, status } = useSession();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElSignup, setAnchorElSignup] = useState(false);

  const handleOpenNavMenu: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = (): void => {
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = (): void => {
    setAnchorElUser(null);
  };
  const handleOpenSignupMenu: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
    setAnchorElSignup(true);
  };
  const handleCloseSignupMenu = (): void => {
    setAnchorElSignup(false);
  };

  //reminder that this is not yet complete

  if (status === 'loading') {
    const right = (
      <div className="right">
        <p>Validating session ...</p>
        <style jsx>{`
          .right {
            margin-left: auto;
          }
        `}</style>
      </div>
    );
  }


  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex', color: 'primary' }, mr: 1 }} />
          <Typography
            color="secondary"
            variant="h3"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              letterSpacing: '.3rem',
              textDecoration: 'none',
            }}
          >
            GCal-2-SMS
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                >
                  <Typography textAlign="center" color="secondary">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              letterSpacing: '.3rem',
              textDecoration: 'none',
            }}
          >
            GCAL-2-SMS
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          {session &&
            <Box sx={{ flexGrow: 0 }}>
              <Button onClick={() => fetchCalData()}>Get Calendar Data</Button>
              <Tooltip title="Open settings">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="../../../public/smilecal.jpeg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => {
                  if (setting === 'Logout') {
                    return (
                      <MenuItem key={setting}
                        onClick={() => signOut()}
                      >
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                    )
                  }
                  if (setting === 'Settings') {
                    return (
                      <Link href="/settings" key={"link" + setting}>
                        <MenuItem key={setting}>
                          <Typography textAlign="center">{setting}</Typography>
                        </MenuItem>
                      </Link>
                    )
                  }
                  else return (
                    <MenuItem key={setting}
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  )
                })}
              </Menu>
            </Box>
          }
          {!session &&
            <Box sx={{ flexGrow: 0 }}>
              <div>
                <Link href="/auth/signin">
                  <Button
                    aria-haspopup="true"
                    color='secondary'
                    variant="contained"
                    onClick={() => signIn()}
                    startIcon={<GoogleIcon />}
                  >
                    Login To GCAL-2-SMS
                  </Button>
                </Link >
                <Dialog open={anchorElSignup} onClose={handleCloseSignupMenu}>
                  <DialogTitle>Please Login with Your Google Acount</DialogTitle>
                  <Button>Authorize Goggle Account</Button>
                  <DialogContentText>
                    Or, Click Here to register your google calendar account with us
                  </DialogContentText>
                  <Button>Sign Up for Gcal2SMS</Button>
                </Dialog>
              </div>
            </Box>
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;