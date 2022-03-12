import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Principal } from "@dfinity/principal";
import { useLocalState } from '../utils/state'
import toast from "react-hot-toast";

export const NftCollection = (props) => {
    let { cards } = props;

    const [tokenTransfer, setTokenTransfer] = useState(null);
    const [principalTo, setPrincipalTo] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    
    const state = useLocalState();

    async function transfer(tokenid) {
        setTokenTransfer(tokenid);
        setDialogOpen(true);
    }

    async function handlePrincipalChange(event) {
        setPrincipalTo(event.target.value);
    }

    async function sendNft() {
        setDialogOpen(false);

        let rs = await state.transferToken(Principal.fromText(principalTo), tokenTransfer);
        if (rs > 0) {
          const index = cards.indexOf(tokenTransfer);
          if (index > -1) {
            cards.splice(index, 1);
          }
          toast.success("Transfer token successfully!")
        } else {
          toast.error("Transfer token failed!")
        }
        setTokenTransfer(null);
        setPrincipalTo(null);
    }

    const handleClose = () => {
        setTokenTransfer(null);
        setPrincipalTo(null);
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
                      This is a media card. You can use this section to describe the
                      content.
                    </Typography> */}
                  </CardContent>
                  <CardActions>
                    <Button size="small" variant="outlined" onClick={() => transfer(card)}>Transfer</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
                <Dialog open={dialogOpen} onClose={handleClose}>
                <DialogTitle>Transfer The Battery #{tokenTransfer}</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    {"To transfer nft The Battery #" + tokenTransfer + ", please enter principal receive nft The Battery #" + tokenTransfer + " here. We will send instantly."}
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Principal ID"
                    fullWidth
                    variant="standard"
                    onChange={handlePrincipalChange}
                />
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={sendNft}>Send</Button>
                </DialogActions>
            </Dialog>
        </Container>
  );
}

NftCollection.propTypes = {
  cards: PropTypes.arrayOf(
      PropTypes.number.isRequired
  ).isRequired,
};