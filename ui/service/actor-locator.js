import {
  createActor as createDip721Actor,
  canisterId as dip721CanisterId,
} from "../declarations/dip721"

export const makeActor = (canisterId, createActor) => {
  return createActor(canisterId, {
    agentOptions: {
      host: process.env.NEXT_PUBLIC_IC_HOST,
    },
  })
}

export function makeDip721Actor() {
  return makeActor(dip721CanisterId, createDip721Actor)
}
