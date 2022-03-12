import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import PropTypes from 'prop-types';

export const AllCollection = (props) => {
  let { cards } = props;
  
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
                  {/* <CardActions>
                    <Button size="small" variant="outlined" onClick={() => showOwner(card)}>Show owner</Button>
                  </CardActions> */}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
  );
}

AllCollection.propTypes = {
  cards: PropTypes.arrayOf(
      PropTypes.number.isRequired
  ).isRequired,
};
