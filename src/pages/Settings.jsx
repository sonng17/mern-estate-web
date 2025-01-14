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
import ListingItem from "../components/ListingItem";

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
    handleFetchListings();
  }, [file, userListings]);
  const handleFetchListings = async () => {
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
  };

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
  const handleListingDelete = async (listingId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài đăng này?"
    );

    if (!confirmDelete) {
      return; // Dừng lại nếu người dùng nhấn "Cancel"
    }
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
    <>
      <h1 className="text-3xl font-semibold text-center text-slate-700 my-7">
        Cài đặt
      </h1>

      <div className="grid grid-cols-3">
        <div className="p-3 min-w-96 mx-auto">
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
                <span className="text-green-700">
                  Image successfully uploaded!
                </span>
              ) : (
                ""
              )}
            </p>
            <h1 className="font-bold border-t-2 pt-4 text-slate-500">
              Username
            </h1>
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
              {loading ? "Loading..." : "Cập nhật"}
            </button>
            {error ? <p className="text-red-700">{error}</p> : <></>}
          </form>
          <button
            onClick={() => handleDeleteUser()}
            className="font-bold w-full bg-red-500 cursor-pointer text-white p-3 rounded-lg text-center hover:opacity-95 mt-5"
          >
            Xóa tài khoản!
          </button>
        </div>
        <div className="col-span-2 border-l-2 border-slate-700">
          {showListingsError ? (
            <p className="text-red-700 mt-5">{showListingsError}</p>
          ) : (
            <></>
          )}
          {userListings && userListings.length > 0 ? (
            <div className="gap-4 p-4">
              <div className="flex flex-wrap gap-6">
                {userListings.map((listing) => (
                  <ListingItem
                    listing={listing}
                    key={listing._id}
                    isMyListing={true}
                    handleListingDelete={handleListingDelete}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="pl-4">Chưa có bài đăng nào.</p>
          )}
        </div>
      </div>

      <div className="flex flex-row-reverse mt-5 mb-5 px-10">
        <button
          onClick={() => handleSignOut()}
          className="font-bold bg-slate-500 cursor-pointer text-white p-3 rounded-lg  text-center hover:opacity-95 mt-5"
        >
          Đăng xuất
        </button>
      </div>
    </>
  );
}
