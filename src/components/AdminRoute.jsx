import { useSelector } from "react-redux";
import { useNavigate, Outlet, Navigate } from "react-router-dom";

const AdminRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  if (!currentUser) {
    // Redirect to login page if user is not logged in
    navigate("/sign-in");
    return null;
  } else if (currentUser.role !== "admin") {
    // Redirect to home or other page if user is not an admin
    navigate("/");
    return <Navigate to={"/"} />;
  }

  return <Outlet />;
};

export default AdminRoute;
