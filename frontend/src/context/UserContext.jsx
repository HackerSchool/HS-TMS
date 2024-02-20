import { useState, useContext, createContext } from "react";

const initialContext = {
  user: undefined,
  setUser: () => {},
};

const useUserContext = () => {
  const [user, setUser] = useState(initialContext.user);

  return { user, setUser };
};

const UserContext = createContext(initialContext);

export const UserProvider = ({ children }) => {
  return <UserContext.Provider value={useUserContext()}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const { user, setUser } = useContext(UserContext);
  return {
    user,
    setUser,
    isLoggedIn: user?.username !== undefined,
    isDemoUser: user?.username === "demo",
  };
};
