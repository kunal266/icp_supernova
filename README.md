# NFT mint app

This project provides a simple starter template for Dfinity Internet Computer using Next.js framework as frontend.

**Backend**

- A simple NFT canister written in Motoko

**Frontend**

- A simple React HTML (Next.js) use for function NFT mint, display account nft, and other nft

## Live Demo in IC Mainnet 🥳

https://hkxtw-gaaaa-aaaal-aaf6a-cai.ic0.app/

![Screenshot](/public/Screenshot.png)

## Quick Start (Run locally)

Install:

- NodeJS 16.\* or higher https://nodejs.org/en/download/
- Internet Computer dfx CLI https://sdk.dfinity.org/docs/quickstart/local-quickstart.html
- Visual Studio Code (Recommended Code Editor) https://code.visualstudio.com/Download
- VSCode extension - Motoko (Recommended) https://marketplace.visualstudio.com/items?itemName=dfinity-foundation.vscode-motoko

```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

Clone this Git repository:

```bash
git clone https://github.com/nirvana369/core-project
```

Open command terminal:
Enter the commands to start dfx local server in background:

```bash
cd core-project
dfx start --background
```

Note: If you run it in MacOS, you may be asked to allow connections from dfx local server.

Enter the commands to install dependencies, deploy canister and run Next.js dev server:

```bash
npm install
dfx deploy --argument='(principal "cccg7-fof3w-tq3fu-2d7bp-lnfg4-hc7or-vzqwa-yditt-rgytn-7kpfq-zae", "The Battery", "B")'
npm run dev
```

Open in Chrome the following URL to try the demo app:  
http://localhost:3000/

Cleanup - stop dfx server running in background:

```bash
dfx stop
```

## Project Structure

Internet Computer has the concept of [Canister](https://sdk.dfinity.org/docs/developers-guide/concepts/canisters-code.html) which is a computation unit. This project has 2 canisters:

- DIP721 (backend)
- mint_assets (frontend)

Canister configurations are stored in dfx.json.

### Backend

Backend code is inside /backend/ written in [Motoko language](https://sdk.dfinity.org/docs/language-guide/motoko.html). Motoko is a type-safe language with modern language features like async/await and actor build-in. It also has [Orthogonal persistence](https://sdk.dfinity.org/docs/language-guide/motoko.html) which I find very interesting.

Image canister is introduced from release v0.2.0. It makes use of orthogonal persistence through stable variables and provides functions for create, delete and get image. See /backend/service/Image.mo.

### Frontend

Frontend code follows Next.js folder convention with /pages storing all React code, /public storing static files including images. This project uses CSS modules for styling which is stored in /ui/styles. React Components are stored in /ui/components

Entry page code is inside /pages/index.js where the magic starts. With the generated code inside /.dfx, frontend can use RPC style call to server side actor and its functions without worrying about HTTP request and response parsing.


## Backend dev

You can deploy it to the local DFX server using:

```bash
dfx deploy dip721 --argument='(principal "cccg7-fof3w-tq3fu-2d7bp-lnfg4-hc7or-vzqwa-yditt-rgytn-7kpfq-zae", "The Battery", "B")'
```

**dip721** is the backend canister name defined in dfx.json.

## Frontend dev - Next.js Static Code

Next.js developers are familiar with the handy hot code deployed in the Next.js dev environment when making changes in frontend code.

After deploying your backend code as shown above, you can run Next.js local dev server **npm run dev** and edit your frontend code with all the benefits of hot code deploy.

One thing to note is we use Next.js static code export here for hosting in Internet Computer so we can't use any features of Next.js that require server side NodeJS. Potentially, there might be ways to use Internet Computer canister as backend while deploying Next.js dapp to a hosting like Vercel that supports NodeJS server in the future. Further research is needed on that aspect. However, if you do want to run everything decentralized on blockchain including the frontend, you would want to deploy the exported static code to Internet Computer as well.

## Deploy and run frontend in local DFX server

In order to simulate the whole Internet Computer experience, you can deploy and run frontend code to local DFX server by running:

```bash
dfx start --background
npm run build
dfx deploy mint_assets
```

**mint_assets** is the frontend canister defined in dfx.json.

**npm run build** builds and export Next.js as static code storing in **/out** folder which would be picked up by **dfx deploy mint_assets** as defined in dfx.json with **/out** as the source.

When it completes, you can open Chrome and browse to:  
http://localhost:8000/?canisterId=[canisterId]

Replace [canisterId] with the mint_assets canister ID which you can find by running:

```bash
dfx canister id mint_assets
```

## Environment Configuration

There are three key configs following Next.js [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables) configuration:

**.env.development** stores configs for use in local dev.

```
NEXT_PUBLIC_IC_HOST=http://localhost:8000
```

**.env.production** is used when building and exporting static code using **npm run build**

```
NEXT_PUBLIC_IC_HOST=http://localhost:8000
```

Notice both files are identical if we want the Next.js dapp to interact with the local dfx server.

Note **NEXT_PUBLIC** is the prefix used by Next.js to make env vars available to client side code through [build time inlining](https://nextjs.org/docs/basic-features/environment-variables).

**.env.ic** is included for deployment to Internet Computer ic network which would be covered below.

## Deploy to IC Network Canister

The most exciting part is to deploy your Next.js / Internet Computer Dapp to production Internet Computer mainnet blockchain network.

To do that you will need:

- ICP tokens and convert it to [cycles](https://sdk.dfinity.org/docs/developers-guide/concepts/tokens-cycles.html)
- Cycles wallet

Follow the [Network Deployment](https://sdk.dfinity.org/docs/quickstart/network-quickstart.html) guide to create a wallet.  
Dfinity offers [free cycle](https://faucet.dfinity.org/) to developers.

Now, you can deploy your Next.js Dapp to Internet Computer IC network by adding **--network ic** to the dfx subcommand. We will first update our env var to point to IC network host. Then deploy the backend canister first, export Next.js static code and deploy frontend canister **mint_assets**.

```bash
cp .env.ic .env.production
dfx deploy --network ic
```

Open Chrome and go to https://[canisterId].raw.ic0.app/  
Replace [canisterId] by the mint_assets canister id in the IC network. You can find it by running:

```bash
dfx canister --network ic id mint_assets
```

Congratulations !! Well Done !! 👏 🚀 🎉

==============================================================

## Project use Next.js Internet Computer Starter Template
# Github
https://github.com/dappblock/nextjs-ic-starter
# Author
Henry Chan, henry@contentfly.app
Twitter: @kinwo
# License
MIT




