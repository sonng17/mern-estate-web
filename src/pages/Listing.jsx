import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaChartArea,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Listing() {
  SwiperCore.use([Navigation]);
  const { currentUser } = useSelector((state) => state.user);
  const [listing, setListing] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/listing/get/${params.listingId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
          }
        );
        const data = await res.json();
        console.log(data, "data nè");
        if (data === "not allow") {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
        console.log(error);
      }
    };
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (!listing || !listing.userRef) return;

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/user/get/${listing.userRef}`,
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
          console.log(data.message);
          return;
        }
        setUserProfile(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserProfile();
  }, [listing]);

  console.log(error);
  console.log(userProfile);

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl">Something went wrong!</p>
      )}
      {!currentUser && <Navigate to={"/sign-in"}></Navigate>}
      {listing && userProfile && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${url}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copied!
            </p>
          )}

          <div className="grid grid-cols-[2fr_1fr] ">
            <div className="flex flex-col p-10 my-7 gap-4 ">
              <p className="text-2xl font-semibold">
                {listing.name} -{" "}
                {listing.offer
                  ? listing.discountPrice.toLocaleString("en-US")
                  : listing.regularPrice.toLocaleString("en-US")}{" "}
                VND
                {listing.type === "rent" && "/tháng"}
              </p>
              <p className="flex items-center gap-2 text-slate-600  text-sm">
                <FaMapMarkerAlt className="text-green-700" />
                {listing.address}
              </p>
              <div className="flex gap-4">
                <p className="font-semibold bg-red-900 w-full max-w-[300px] text-white text-center p-1 rounded-md">
                  {listing.type === "rent" ? "Cho thuê" : "Bán"}
                </p>
                {listing.offer && (
                  <p className="font-semibold bg-green-900 w-full max-w-[300px] text-white text-center p-1 rounded-md">
                    Đã giảm{" "}
                    <span className="font-semibold">
                      {(
                        ((+listing.regularPrice - +listing.discountPrice) /
                          +listing.regularPrice) *
                        100
                      ).toFixed(0)}
                    </span>
                    %
                  </p>
                )}
              </div>
              {listing.offer ? (
                <>
                  <p className="text-slate-800 font-semibold">
                    <span className=" text-black">Mức giá - </span>
                    <span className="">
                      {listing.discountPrice.toLocaleString("en-US")} VND
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-800 font-semibold">
                    <span className=" text-black">Mức giá - </span>
                    {listing.regularPrice.toLocaleString("en-US")} VND
                  </p>
                </>
              )}

              <p className="text-slate-800 font-semibold">
                <span className=" text-black">Diện tích - </span>
                {listing.area}m2
              </p>

              <p className="text-slate-800">
                <span className="font-semibold text-black">Mô tả - </span>
                {listing.description}
              </p>
              <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
                <li className="flex items-center gap-1 whitespace-nowrap ">
                  <FaBed className="text-lg" />
                  {listing.bedrooms > 1
                    ? `${listing.bedrooms} phòng ngủ `
                    : `${listing.bedrooms} phòng ngủ `}
                </li>
                <li className="flex items-center gap-1 whitespace-nowrap ">
                  <FaBath className="text-lg" />
                  {listing.bathrooms > 1
                    ? `${listing.bathrooms} phòng tắm `
                    : `${listing.bathrooms} phòng tắm `}
                </li>
                <li className="flex items-center gap-1 whitespace-nowrap ">
                  <FaParking className="text-lg" />
                  {listing.parking ? "Có chỗ đỗ xe" : "Không có chỗ đỗ xe"}
                </li>
                <li className="flex items-center gap-1 whitespace-nowrap ">
                  <FaChair className="text-lg" />
                  {listing.furnished
                    ? "Trang bị nội thất"
                    : "Không có nội thất "}
                </li>
                <li className="flex items-center gap-1 whitespace-nowrap ">
                  <FaChartArea className="text-lg" />
                  {listing.area}m2
                </li>
              </ul>
              <ul className="flex flex-wrap items-center gap-4 sm:gap-6">
                <li className=" font-semibold bg-blue-500 text-white flex items-center justify-center rounded-3xl px-4">
                  {listing.provinceRef}
                </li>
                <div className="font-semibold bg-blue-500 text-white flex items-center justify-center rounded-full px-4">
                  {listing.districtRef}
                </div>
                <div className="font-semibold bg-blue-500 text-white flex items-center justify-center rounded-full px-4">
                  {listing.wardRef}
                </div>
              </ul>
            </div>

            <div>
              <div className="mx-9 my-7 py-7 bg-slate-200 flex flex-col items-center border-2 rounded-lg border-slate-400">
                <Link to={`/profile/${listing.userRef}`}>
                  <img
                    src={userProfile.avatar}
                    alt="profile"
                    className="rounded-full h-12 w-12 object-cover cursor-pointer self-center mt-2 "
                  />
                </Link>

                <Link to={`/profile/${listing.userRef}`}>
                  <div className="text-center font-bold text-slate-700 text-xl mb-4 border-b-2 border-slate-700">
                    {userProfile.username}
                  </div>
                </Link>

                <div>
                  <span className="font-bold text-slate-700">SĐT: </span>
                  <span>{userProfile.phone}</span>
                </div>
                <div className="mb-4">
                  <span className="font-bold text-slate-700">Email: </span>
                  <span>{userProfile.email}</span>
                </div>

                <Link to={`https://zalo.me/${userProfile.phone}`}>
                  <button className="w-64 bg-slate-700 text-white rounded-lg p-3 mb-4 uppercase hover:opacity-95 disabled:opacity-80">
                    Liên hệ qua zalo
                  </button>
                </Link>

                <Link to={`mailto:${userProfile.email}`}>
                  <button className="w-64 bg-slate-700 text-white rounded-lg p-3  uppercase hover:opacity-95 disabled:opacity-80">
                    Gửi Email
                  </button>
                </Link>
                <Link to={`/profile/${listing.userRef}`}>
                  <button className="w-64 mt-4 bg-slate-700 text-white rounded-lg p-3  uppercase hover:opacity-95 disabled:opacity-80">
                    Xem thông tin
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
