import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import ListingItem from "../components/ListingItem";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const [userProfile, setUserProfile] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const params = useParams();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/user/get/${params.userId}`,
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
          return;
        }
        setUserProfile(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserProfile();
  }, [params.userId]);

  useEffect(() => {
    const showUserListings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/user/listings/${params.userId}`,
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
          return;
        }
        setUserListings(data);
      } catch (error) {
        console.log(error);
      }
    };
    showUserListings();
  }, []);

  return (
    <>
      <div className="p-3 max-w-lg mx-auto border-b-2 border-slate-500">
        {!currentUser && <Navigate to={"/sign-in"}></Navigate>}
        <h1 className="text-3xl font-semibold text-center text-slate-700 my-7">
          Hồ sơ
        </h1>

        {userProfile ? (
          <>
            <div className="flex flex-col">
              <img
                src={userProfile.avatar}
                alt="profile"
                className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
              />
              <div className="flex flex-col  py-4">
                <div className="text-center font-bold text-slate-700 text-xl mb-4 border-b-2 border-slate-500">
                  {userProfile.username}
                </div>

                <div>
                  <span className="font-bold text-slate-700">Giới thiệu: </span>
                  <span>{userProfile.bio}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">SĐT: </span>
                  <span>{userProfile.phone}</span>
                </div>
                <div className="mb-4">
                  <span className="font-bold text-slate-700">Email: </span>
                  <span>{userProfile.email}</span>
                </div>
              </div>

              <Link to={`https://zalo.me/${userProfile.phone}`}>
                <button className="bg-slate-700 w-full font-semibold text-white rounded-lg p-3 mb-4 uppercase hover:opacity-95 disabled:opacity-80">
                  Liên hệ qua zalo
                </button>
              </Link>

              <Link to={`mailto:${userProfile.email}`}>
                <button className="bg-slate-700 w-full font-semibold text-white rounded-lg p-3  uppercase hover:opacity-95 disabled:opacity-80">
                  Gửi Email
                </button>
              </Link>
            </div>
          </>
        ) : (
          <p>Loading profile details...</p>
        )}
      </div>
      <div className="p-3">
        {userProfile && (
          <h1 className=" mt-7 pl-32 text-2xl font-semibold mb-2">
            Các bài đăng của {userProfile.username}
          </h1>
        )}

        {userListings.length > 0 ? (
          <div className="flex justify-center items-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4">
              {userListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        ) : (
          <p className="pl-32">Chưa có bài đăng nào.</p>
        )}
      </div>
    </>
  );
}
