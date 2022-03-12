/* eslint-disable @next/next/no-img-element */
// Next, React

// import styles from "../ui/styles/Home.module.css"

import { MainFeaturedPost } from '../ui/components/MainFeaturedPost';
import { Pricing } from '../ui/components/Pricing';
import { Header } from '../ui/components/Header';
import { Footer } from '../ui/components/Footer';
import { NftCollection } from '../ui/components/NftCollection';
import { AllCollection } from '../ui/components/AllCollection';
import { useRoute } from '../ui/utils/route';
import { useAuth } from '../ui/utils/auth'
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeDip721Actor } from "../ui/service/actor-locator"
import { useState, useEffect } from 'react';

const sections = [
    { title: 'Home', url: '#' , pageIndex : 1},
    { title: 'My Collection', url: '#' , pageIndex : 2},
    { title: 'Collections', url: '#' , pageIndex : 3},
  ];

const mainFeaturedPost = {
    title: '369 NFTs The Battery on ICP',
    description:
      'Owners of The Battery NFT will be get free course "Learn Motoko programming language from beginner to advanced"!',
    image: '/banner.png',
    imageText: 'main image description',
    linkText: 'Continue reading…',
  };

  const tiers = [
    {
      title: 'Price 3 motoko',
      balance: 'Your balance : ',
      description: "No discount",
      buttonText: 'Mint 1 NFT',
      price : 3,
      mintNum : 1
    },
    {
      title: 'Price 6 motoko',
      balance: 'Your balance : ',
      description: "Discount 30%",
      buttonText: 'Mint 3 NFTs',
      price : 6,
      mintNum : 3
    },
    {
      title: 'Price 9 motoko',
      balance: 'Your balance : ',
      description: "Discount 60%",
      buttonText: 'Mint 5 NFTs',
      price : 9,
      mintNum : 5
    },
  ];

const theme = createTheme();

function HomePage() {
    
    const route = useRoute()
    const auth = useAuth()
    const dip721Actor = makeDip721Actor();

    const [userCollection, setUserCollection] = useState([]);
    const [allCollection, setAllCollection] = useState([]);

    function removeDupplicate() {
      if (allCollection.length === 0 || allCollection === 0) {
        return;
      }
      let newCollection = [];
      for (let i = 0; i < allCollection.length; i++) {
        let add = true;
        for (let j = 0; j < userCollection.length; j++) {
            if (allCollection[i] == userCollection[j]) {
               add = false;
               break;
            }
        }
        if (add) {
          newCollection.push(allCollection[i]);
        }
      }
      setAllCollection(newCollection);
    }

    async function update_my_collection() {
        if (userCollection.length === 0) {
          let val = await dip721Actor.tokensOf(auth.principal);
          let array = [];
          for (let i = 0; i < val.length; i++) {
            array.push(Number(val[i]));
          }
          setUserCollection(array);
        } 
    }

    async function update_all_collection() {
      if (allCollection.length === 0) {
        let val = await dip721Actor.tokens();
        let array = [];
        for (let i = 0; i < val.length; i++) {
          array.push(Number(val[i]));
        }
        setAllCollection(array);
      }
    }

    useEffect(async () => {
        await update_all_collection();
        if (auth.principal !== null && auth.principal !== undefined) {
    
          await update_my_collection();
          removeDupplicate();
        //   toast.success(auth.principal.toString())
        } else {
          setUserCollection([])
          // toast.error('login failed!')
        }
      }, [route.page])

      useEffect(async () => {
        if (auth.principal !== null && auth.principal !== undefined) {
    
          await update_my_collection();
    
        //   toast.success(auth.principal.toString())
        } else {
          setUserCollection([])
          // toast.error('login failed!')
        }
      }, [auth.principal])

    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg">
            <Header title="The Battery" sections={sections} />
            <main>
                {route.page === 1 ? <>
                    <MainFeaturedPost post={mainFeaturedPost} />

                    {auth !== null && auth.principal !== null && auth.principal !== undefined ? <>
                        <Pricing tiers={tiers} />
                    </> :
                        <CssBaseline />
                    }
                    
                </> :
                    route.page === 2 ? <>
                        <NftCollection cards={userCollection}/>
                    </> :
                    <AllCollection cards={allCollection}/>
                }
            </main>
        </Container>
        <CssBaseline />
        <Footer
            title="Motoko bootcamp"
            description="Let's learn Motoko, the best programming language on Internet Computer!"
        />
        </ThemeProvider> 
    )
}

export default HomePage
