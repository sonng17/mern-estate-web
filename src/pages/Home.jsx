/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import ListingItem from "../components/ListingItem";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const imageNames = [
  "image1.jpg",
  "image2.jpg",
  "image3.jpg",
  "image4.jpg",
  "image5.jpg",
  "image6.jpg",
];

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading

  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const [offerRes, rentRes, saleRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/listing/get?offer=true&limit=6`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/listing/get?type=rent&limit=6`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/listing/get?type=sale&limit=6`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
        ]);

        const [offerData, rentData, saleData] = await Promise.all([
          offerRes.json(),
          rentRes.json(),
          saleRes.json(),
        ]);

        setOfferListings(offerData);
        setRentListings(rentData);
        setSaleListings(saleData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-lg font-semibold text-gray-600">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-6 p-20 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-4xl">
          Tìm kiếm <span className="text-slate-500">không gian</span> cho bạn
        </h1>
        <p className="text-gray-400 text-xs sm:text-base">
          Mern Estate là nơi tốt nhất để tìm kiếm chốn an cư lý tưởng tiếp theo
          của bạn. Chúng tôi có rất nhiều lựa chọn đa dạng về bất động sản.{" "}
          <Link
            to={"/search"}
            className="font-bold text-blue-800 hover:underline"
          >
            Khám phá ngay...
          </Link>
        </p>
      </div>

      {/* Swiper */}
      <Swiper navigation>
        {imageNames.map((imageName, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(/images/${imageName}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="h-[650px] w-auto"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Listing Results */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {offerListings.length > 0 && (
          <ListingSection
            title="Recent Offer"
            link="/search?offer=true"
            listings={offerListings}
          />
        )}
        {rentListings.length > 0 && (
          <ListingSection
            title="Bất động sản cho thuê"
            link="/search?type=rent"
            listings={rentListings}
          />
        )}
        {saleListings.length > 0 && (
          <ListingSection
            title="Bất động sản để bán"
            link="/search?type=sale"
            listings={saleListings}
          />
        )}
      </div>
    </div>
  );
}

// Component hiển thị danh sách listing

function ListingSection({ title, link, listings }) {
  return (
    <div>
      <div className="my-3 pt-4 border-t-2 border-slate-700">
        <h2 className="text-2xl font-semibold text-slate-600">{title}</h2>
        <Link className="text-sm text-blue-800 hover:underline" to={link}>
          Xem thêm...
        </Link>
      </div>
      <div className="flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {listings.map((listing) => (
            <ListingItem listing={listing} key={listing._id} />
          ))}
        </div>
      </div>
    </div>
  );
}
