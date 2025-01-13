import { FaSearch, FaBell } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Hanoi</span>
            <span className="text-slate-700">Apartment</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        <ul className="flex flex-wrap items-center gap-7">
          <Link to="/">
            <li className="sm:inline font-bold text-slate-500 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-2xl border-2 border-slate-400">
              Home
            </li>
          </Link>
          {!currentUser ? (
            <Link to="/about">
              <li className="sm:inline font-bold text-slate-500 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-2xl border-2 border-slate-400">
                About
              </li>
            </Link>
          ) : (
            <Link to={`/create-listing`}>
              <li className="sm:inline font-bold text-slate-500 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-2xl border-2 border-slate-400">
                Đăng tin
              </li>
            </Link>
          )}

          {currentUser && (
            <Link to={`/profile/${currentUser._id}`}>
              <li className="sm:inline font-bold text-slate-500 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-2xl border-2 border-slate-400">
                Profile
              </li>
            </Link>
          )}

          {currentUser && currentUser.role === "admin" && (
            <Link to={`/admin`}>
              <li className="sm:inline font-bold text-slate-500 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-2xl border-2 border-slate-400">
                Quản lý
              </li>
            </Link>
          )}

          {currentUser && (
            <div className="flex items-center cursor-pointer justify-center w-5 h-6 hover:bg-slate-300 rounded-2xl">
              <FaBell className="text-slate-500 size-5" />
            </div>
          )}

          <Link to="/settings">
            {currentUser ? (
              <img
                className="rounded-full h-9 w-9 object-cover"
                src={currentUser.avatar}
                alt="profile"
              />
            ) : (
              <li className="sm:inline font-bold text-slate-500 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-2xl border-2 border-slate-400">
                Sign in
              </li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
