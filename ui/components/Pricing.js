import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth'
import { useLocalState } from '../utils/state'
import { Principal } from "@dfinity/principal";
import { makeDip721Actor } from "../service/actor-locator"
import toast from "react-hot-toast";

export const Pricing = (props) => {
    const { tiers } = props;
    const [balance, setBalance] = useState(0);
    const [minting, isMinting] = useState(false);
    const [nftAvailable, setNftAvailable] = useState(0);

    const auth = useAuth()
    const state = useLocalState();
    const dip721Actor = makeDip721Actor();

    update_nft_available();

    async function update_balance() {
        let val = await state.getBalance(auth.principal);
        let val_icp = Number(val.e8s) / Math.pow(10, 8);
        setBalance(val_icp);
    }

    async function update_nft_available() {
        let val = await dip721Actor.mintRemain();
        setNftAvailable(val);
    }

    useEffect(async () => {
        if (auth.principal !== null && auth.principal !== undefined) {
    
          await update_balance();
          console.log('useEffect principal');
    
        //   toast.success(auth.principal.toString())
        } else {
          // toast.error('login failed!')
        }
      }, [auth.principal])

      useEffect(async () => {
          console.log('useEffect balance');
      }, [balance])

      async function mint(price, mintNum) {
        isMinting(true);
        try {
            let blockHeight = await state.sendToken(Principal.fromText("qgcnp-i5ptu-cdoew-yxuoz-3qgnq-yf5m2-6joaf-luxe5-xanvv-kaqqd-uae"), price);
            await update_balance();
            if (blockHeight > 0) {
                toast.success("Payment successfully!")
                let tokenid = await state.mint(mintNum);
                if (tokenid[0] > 0) {
                    update_nft_available();
                    toast.success("Mint successfully!")
                } else {
                    toast.error("Mint failed!")
                }
            } else {
                toast.error("Payment failed!")
            }
        } catch (e) {
            console.log(e);
        }
        isMinting(false);
      }

    return (
        <React.Fragment>
        <Container maxWidth="md" component="main">
            <Grid container spacing={5} alignItems="flex-end">
            {tiers.map((tier) => (
                // Enterprise card is full width at sm breakpoint
                <Grid
                item
                key={tier.title}
                xs={12}
                sm={6}
                md={4}
                >
                <Card>
                    <CardHeader
                    title={tier.title}
                    // subheader={tier.subheader}
                    titleTypographyProps={{ align: 'center' }}
                    // action={tier.title === 'Pro' ? <StarIcon /> : null}
                    subheaderTypographyProps={{
                        align: 'center',
                    }}
                    sx={{
                        backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[200]
                            : theme.palette.grey[700],
                    }}
                    />
                    
                    
                    <CardContent>
                    <Box
                        sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'baseline',
                        mb: 2,
                        }}
                    >
                        <Typography variant="subtitle1" color="text.primary">
                        {tier.balance}
                        </Typography>
                        <Typography variant="subtitle1" color="text.primary">
                        {balance}
                        </Typography>
                    </Box>
                        <Typography
                            component="li"
                            variant="subtitle1"
                            align="center">
                            {"NFT Available : " + nftAvailable}
                        </Typography>
                        <Typography
                            component="li"
                            variant="subtitle1"
                            align="center">
                            ${tier.description}
                        </Typography>
                    </CardContent>
                    <CardActions>
                    <LoadingButton fullWidth
                        loading={minting} 
                        color="inherit" 
                        size="small" 
                        variant="outlined" 
                        disabled={nftAvailable <= 0 || balance < tier.price}
                        onClick={() => mint(tier.price, tier.mintNum)}>{balance >= tier.price ? tier.buttonText : "Check balance"}</LoadingButton>
                        
                    </CardActions>
                </Card>
                </Grid>
            ))}
            </Grid>
        </Container>
        </React.Fragment>
    );
}

Pricing.propTypes = {
    tiers: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        buttonText: PropTypes.string.isRequired,
      }),
    ).isRequired,
};
  