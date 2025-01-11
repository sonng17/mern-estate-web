import { createRoot } from "react-dom/client";
import "./index.css";
import { persistor, store } from "./redux/store.js";
import { Provider } from "react-redux";

// import App from "./App.jsx";

import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { PersistGate } from "redux-persist/integration/react";
import PrivateRoute from "./components/PrivateRoute.jsx";
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";
import Listing from "./pages/Listing";
import Search from "./pages/Search.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminPage from "./pages/AdminPage.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/sign-in" element={<SignIn />}></Route>
              <Route path="/sign-up" element={<SignUp />}></Route>
              <Route path="/about" element={<About />}></Route>
              <Route path="/profile/:userId" element={<Profile />}></Route>
              <Route path="/search" element={<Search />} />
              <Route path="/listing/:listingId" element={<Listing />} />
              <Route element={<PrivateRoute />}>
                <Route path="/settings" element={<Settings />}></Route>
                <Route path="/create-listing" element={<CreateListing />} />
                <Route
                  path="/update-listing/:listingId"
                  element={<UpdateListing />}
                />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              <Route path="/*" element={<NotFound />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </HashRouter>
    </PersistGate>
  </Provider>
);
