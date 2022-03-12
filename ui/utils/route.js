import { createContext, useContext, useState } from "react";

// Provider hook that creates route object and handles state
export function useProvideRoute() {
  const [page, setPage] = useState(1);

  function get() {
    return {
      page: page,
      setPage,
    };
  }

  return get();
}

const routeContext = createContext(null);
export let route;

export function ProvideRoute({ children }) {
  route = useProvideRoute();
  return <routeContext.Provider value={route}>{children}</routeContext.Provider>;
}

export const useRoute = () => {
  return useContext(routeContext);
};