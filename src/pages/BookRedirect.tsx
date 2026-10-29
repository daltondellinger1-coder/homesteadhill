import { Navigate, useLocation } from "react-router-dom";

export default function BookRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`/contact${search}${hash}`} replace />;
}