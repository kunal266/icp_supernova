import { Principal } from "@dfinity/principal";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, useAuth } from "./auth";
// import { Listing_2, TokenDesc } from "./canister/icpunks_type";
// import { getCanisterIds } from "./canister/principals";

// import icpunks_idl from "./idl/icpunks.did";
import ledger_idl from "./idl/ledger.did";
import dip721_idl from "./idl/dip721.did";

import canisters from './canisters'
import { getAccountIdentifier, getSubAccountArray } from "./utils";

const { Actor, HttpAgent } = require('@dfinity/agent');
const ic_agent = new HttpAgent({ host: "https://boundary.ic0.app/" });

export function useProvideState() {
    const authContext = useAuth();

    let readActorCache = {}
    function getReadActor(cid, idl) {
        // only query used, cannot use with update func
        if (cid in readActorCache)
            return readActorCache[cid]

        const actor = Actor.createActor(idl, {
            agent: ic_agent,
            canisterId: cid,
        });

        readActorCache[cid] = actor;

        return actor;
    }

    const getBalance = async (principal) => {
        let ledger = getReadActor(canisters.ledger, ledger_idl);
        let account = getAccountIdentifier(principal);
        
        let balance = await ledger.account_balance_dfx({account});
        return balance;
    }

    const claim = async (principal) => {
        try {
            let ledger = await auth.wallet.getActor(canisters.ledger, ledger_idl)
            let account = getAccountIdentifier(principal);
            
            let faucet_result = await ledger.faucet({to: account, created_at_time: []});
        } catch (error) {
            console.error(error);
        }
    }

    const sendToken = async (principal, price) => {
        try {
            let ledger = await auth.wallet.getActor(canisters.ledger, ledger_idl)
            let account = getAccountIdentifier(principal);
            let amount = price * 100000000
            let send_result = await ledger.send_dfx({
                memo : 0,
                amount : {
                    e8s: amount,
                },
                fee : {
                    e8s: 10000,
                },
                from_subaccount : [],
                to: account,
                created_at_time : [],
            });
            
            return send_result;
        } catch (error) {
            console.error(error);
        }
    }

    const mint = async (amount) => {
        try {
            let nft = await auth.wallet.getActor(canisters.nft, dip721_idl)
            let result = await nft.mint(amount);
            console.log(result);
            return result;
        } catch (error) {
            console.error(error);
        }
    }

    const transferToken = async (principalTo, tokenid) => {
        try {
            let nft = await auth.wallet.getActor(canisters.nft, dip721_idl)
            await nft.transferFrom(auth.principal, principalTo, tokenid);
            return 1;
        } catch (error) {
            console.error(error);
        }
        return 0;
    }

    return {
        getBalance,
        claim,
        sendToken,
        mint,
        transferToken,
    };
}

const stateContext = createContext(null);

export function ProvideState({ children }) {
    const state = useProvideState();
    return <stateContext.Provider value={state}>{children}</stateContext.Provider>;
}

export const useLocalState = () => {
    return useContext(stateContext);
};