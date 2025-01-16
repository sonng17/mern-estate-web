import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/listing/get?offer=true&limit=6`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
          }
        );
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/listing/get?type=rent&limit=6`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
          }
        );
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSaleListings = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/listing/get?type=sale&limit=6`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
          }
        );
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOfferListings();
  }, []);
  return (
    <div>
      {/* top */}
      <div className="flex flex-col gap-6 p-20 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-4xl">
          Tìm kiếm <span className="text-slate-500">không gian</span>{" "}
          cho bạn
          <br />
        </h1>
        <div className="text-gray-400 text-xs sm:text-base">
          Mern Estate là nơi tốt nhất để tìm kiếm chốn an cư lý tưởng tiếp
          theo của bạn.
          <br />
          Chúng tôi có rất nhiều lựa chọn đa dạng về bất động sản..{" "}
          <Link to={"/search"}>
            <span className="font-bold text-blue-800  hover:underline">
              Khám phá ngay...
            </span>
          </Link>
        </div>
      </div>
      {/* swiper */}
      <Swiper navigation>
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            // eslint-disable-next-line react/jsx-key
            <SwiperSlide>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[700px]"
                key={listing._id}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>
      {/* listing results for offer, sale and rent */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10 ">
        {offerListings && offerListings.length > 0 && (
          <div className="">
            <div className="my-3 pt-4 border-t-2 border-slate-700">
              <h2 className="text-2xl font-semibold text-slate-600">
                Recent Offer
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?offer=true"}
              >
                Xem thêm...
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="">
            <div className="my-3 pt-4 border-t-2 border-slate-700">
              <h2 className="text-2xl font-semibold text-slate-600">
                Bất động sản cho thuê
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=rent"}
              >
                Xem thêm...
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
                {rentListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="">
            <div className="my-3 pt-4 border-t-2 border-slate-700">
              <h2 className="text-2xl font-semibold text-slate-600">
                Bất động sản để bán
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=sale"}
              >
                Xem thêm...
              </Link>
            </div>
            <div className="flex justify-center items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
                {saleListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
