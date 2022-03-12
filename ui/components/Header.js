import * as React from 'react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import styles from "../styles/Home.module.css"
import { LoadingButton } from '@mui/lab';
import { useAuth } from '../utils/auth'
import { useRoute } from '../utils/route';
import toast from "react-hot-toast";

export const Header = (props) => {
  const { sections, title } = props;

  const auth = useAuth()
  const route = useRoute();

  const [connected, isConnecting] = useState(false);

  async function login() {
    isConnecting(true);
    try {
      await auth.usePlug()
    } catch {

    }
    isConnecting(false);
  }

  async function logout() {
    auth.wallet.logOut();
  }

  useEffect(async () => {
    if (auth.principal !== null && auth.principal !== undefined) {

      // await update_balance();


      toast.success(auth.principal.toString())
    } else {
      // toast.error('login failed!')
    }
  }, [auth.principal])

  return (
    <React.Fragment>
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {/* <Button size="small">Subscribe</Button> */}
        <img
            src="/logo.png"
            alt="DFINITY logo"
            className={styles.logo}
        />
        <Typography
          component="h2"
          variant="h5"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1, marginLeft: 10 }}
        >
          {title}
        </Typography>
          {auth !== null && auth.principal !== null && auth.principal !== undefined ? <>
            <LoadingButton sx={{
              minWidth: 200,
            }} loading={connected} color="inherit" size="small" variant="outlined" onClick={logout}>Disconnect Wallet</LoadingButton>
          </> :
            <LoadingButton sx={{
              minWidth: 200,
            }} loading={connected} color="inherit" size="small" variant="outlined" onClick={login}>Connect Wallet</LoadingButton>
          }
      </Toolbar>
      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: 'space-between', overflowX: 'auto' }}
      >
        {sections.map((section) => (
          <Link
            color="inherit"
            noWrap
            key={section.title}
            variant="subtitle1"
            href={section.url}
            sx={{ p: 1, flexShrink: 0 }}
            onClick={() => {
              route.setPage(section.pageIndex);
            }}
          >
            {section.title}
          </Link>
        ))}
      </Toolbar>
    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    }),
  ).isRequired,
  title: PropTypes.string.isRequired,
};
