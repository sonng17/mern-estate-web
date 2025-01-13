import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Settings() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListings, setShowListings] = useState(false);
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(
        `${API_BASE_URL}/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      alert("Update thành công!"); // Hiển thị thông báo
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      alert("Đã xảy ra lỗi: " + error.message); // Hiển thị lỗi nếu xảy ra
    }
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa tài khoản?"
    );

    if (!confirmDelete) {
      return; // Dừng lại nếu người dùng nhấn "Cancel"
    }

    try {
      dispatch(deleteUserStart());
      const res = await fetch(
        `${API_BASE_URL}/api/user/delete/${currentUser._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
        }
      );
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      alert("Tài khoản đã được xóa thành công."); // Thông báo thành công
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      alert("Đã xảy ra lỗi khi xóa tài khoản: " + error.message); // Thông báo lỗi
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    console.log(showListings);
    if (!showListings) {
      try {
        setShowListingsError(false);
        const res = await fetch(
          `${API_BASE_URL}/api/user/mylistings/${currentUser._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
          }
        );
        const data = await res.json();
        if (data.success === false) {
          setShowListingsError(true);
          return;
        }
        setUserListings(data);
      } catch (error) {
        setShowListingsError(true);
        console.log(error);
      }
    }
    setShowListings(!showListings); // Toggle trạng thái hiển thị
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/listing/delete/${listingId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
        }
      );
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center text-slate-700 my-7">
        Settings
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <h1 className="font-bold border-t-2 pt-4 text-slate-500">Username</h1>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <h1 className="font-bold text-slate-500">Bio</h1>

        <input
          type="text"
          placeholder="bio"
          defaultValue={currentUser.bio}
          id="bio"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <h1 className="font-bold text-slate-500">Số điện thoại</h1>

        <input
          type="text"
          placeholder="phone"
          defaultValue={currentUser.phone}
          id="phone"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <h1 className="font-bold text-slate-500">Email</h1>

        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <h1 className="font-bold text-slate-500">Password</h1>

        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 pb-4 mb-4 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 font-semibold text-white rounded-lg p-3 hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>
      <button
        onClick={handleShowListings}
        className="bg-green-700 font-semibold text-white p-3 rounded-lg text-center hover:opacity-95 mt-5 w-full"
      >
        {!showListings ? "Show all listing" : "Close all listing"}
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>
      {showListings && userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            My Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="grid grid-cols-[auto,2fr,auto,auto] gap-4 border rounded-lg p-3 items-center"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <Link
                className="text-blue-700 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.status}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase font-bold"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase font-semibold">
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-5">
        <button
          onClick={handleDeleteUser}
          className="font-bold bg-red-700 cursor-pointer text-white p-3 rounded-lg text-center hover:opacity-95 mt-5"
        >
          Delete account!
        </button>
        <button
          onClick={handleSignOut}
          className="font-bold bg-slate-500 cursor-pointer text-slate-300 p-3 rounded-lg  text-center hover:opacity-95 mt-5"
        >
          Sign Out
        </button>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
    </div>
  );
}
