import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import CardActions from '@mui/material/CardActions';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { makeDip721Actor } from "../service/actor-locator"

export const AllCollection = (props) => {
  let { cards } = props;
  const [owner, setOwner] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [loadingShow, setLoadingShow] = useState(false);
  const [doAction, setDoAction] = useState(false);

  const dip721Actor = makeDip721Actor();

  async function showOwner(tokenid) {
    setLoadingShow(true);
    setDoAction(true);
    setToken(tokenid);
    let p = await dip721Actor.ownerOf(tokenid);
    setOwner(p.toString());
    setDialogOpen(true);
    setDoAction(false);
    setLoadingShow(false);
  }

  const handleClose = () => {
      setOwner(null);
      setToken(0);
      setDialogOpen(false);
    };

  return (
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {cards.map((card) => (
              <Grid item key={card} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    // sx={{
                    //   // 16:9
                    //   pt: '56.25%',
                    // }}
                    image={"https://hkxtw-gaaaa-aaaal-aaf6a-cai.ic0.app/token/" + card + ".png"}
                    alt="random"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                  <Link
                        color="primary"
                        noWrap
                        key={card}
                        variant="subtitle1"
                        href={"https://hkxtw-gaaaa-aaaal-aaf6a-cai.ic0.app/token/" + card + ".png"}
                    >
                        {"The Battery #" + card}
                    </Link>
                    {/* <Typography gutterBottom variant="h5" component="h2">
                      
                    </Typography> */}
                    {/* <Typography>
                      {tokenOwner[card]}
                    </Typography> */}
                  </CardContent>
                  <CardActions>
                    <LoadingButton fullWidth
                        loading={loadingShow} 
                        color="inherit" 
                        size="small" 
                        variant="outlined" 
                        disabled={doAction}
                        onClick={() => showOwner(card)}>Show owner</LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Dialog
              open={dialogOpen}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Owner of token #" + token}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {owner}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} autoFocus>
                  Close
                </Button>
              </DialogActions>
            </Dialog>
        </Container>
  );
}

AllCollection.propTypes = {
  cards: PropTypes.arrayOf(
      PropTypes.number.isRequired
  ).isRequired,
};
