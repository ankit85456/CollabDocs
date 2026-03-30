import { useContext } from "react";
import { AuthContext } from "../context/Authcontext";

export default function useAuth() {
  return useContext(AuthContext);
}
