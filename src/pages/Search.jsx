import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: "",
    provinceRef: "",
    districtRef: "",
    wardRef: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "created_at",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const locationHook = useLocation();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  console.log(sidebardata, "sidebardata nè");

  useEffect(() => {
    // Fetch provinces data
    const fetchLocationData = async () => {
      const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
      const data = await res.json();
      setProvinces(data);
    };
    fetchLocationData();
  }, []);

  const handleProvinceChange = (e) => {
    const selectedProvince = provinces.find(
      (province) => province.code === parseInt(e.target.value)
    );
    setSidebardata((prev) => ({
      ...prev,
      provinceRef: selectedProvince.name,
    }));
    setDistricts(selectedProvince.districts);
    setWards([]);
  };
  const handleDistrictChange = (e) => {
    const selectedDistrict = districts.find(
      (district) => district.code === parseInt(e.target.value)
    );
    setSidebardata((prev) => ({
      ...prev,
      districtRef: `${selectedDistrict.name}`,
    }));
    setWards(selectedDistrict.wards);
  };
  const handleWardChange = (e) => {
    const selectedWard = wards.find(
      (ward) => ward.code === parseInt(e.target.value)
    );
    setSidebardata((prev) => ({
      ...prev,
      wardRef: `${selectedWard.name}`,
    }));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(locationHook.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const provinceRefFromUrl = urlParams.get("provinceRef");
    const districtRefFromUrl = urlParams.get("districtRef");
    const wardRefFromUrl = urlParams.get("wardRef");
    const typeFromUrl = urlParams.get("type");
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");
    if (
      searchTermFromUrl ||
      provinceRefFromUrl ||
      districtRefFromUrl ||
      wardRefFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || "",
        provinceRef: provinceRefFromUrl || "",
        districtRef: districtRefFromUrl || "",
        wardRef: wardRefFromUrl || "",
        type: typeFromUrl || "all",
        parking: parkingFromUrl === "true" ? true : false,
        furnished: furnishedFromUrl === "true" ? true : false,
        offer: offerFromUrl === "true" ? true : false,
        sort: sortFromUrl || "created_at",
        order: orderFromUrl || "desc",
      });
    }
    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(
        `${API_BASE_URL}/api/listing/get?${searchQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
        }
      );
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, [locationHook.search]);

  const handleChange = (e) => {
    if (
      e.target.id === "all" ||
      e.target.id === "rent" ||
      e.target.id === "sale"
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }
    if (e.target.id === "searchTerm") {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }
    if (e.target.id === "provinceRef") {
      setSidebardata({ ...sidebardata, provinceRef: e.target.value });
    }
    if (e.target.id === "districtRef") {
      setSidebardata({ ...sidebardata, districtRef: e.target.value });
    }
    if (e.target.id === "wardRef") {
      setSidebardata({ ...sidebardata, wardRef: e.target.value });
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      });
    }
    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "created_at";
      const order = e.target.value.split("_")[1] || "desc";
      setSidebardata({ ...sidebardata, sort, order });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebardata.searchTerm);
    urlParams.set("provinceRef", sidebardata.provinceRef);
    urlParams.set("districtRef", sidebardata.districtRef);
    urlParams.set("wardRef", sidebardata.wardRef);
    urlParams.set("type", sidebardata.type);
    urlParams.set("parking", sidebardata.parking);
    urlParams.set("furnished", sidebardata.furnished);
    urlParams.set("offer", sidebardata.offer);
    urlParams.set("sort", sidebardata.sort);
    urlParams.set("order", sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };
  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(locationHook.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`${API_BASE_URL}/api/listing/get?${searchQuery}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
    });
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };
  const resetFilters = () => {
    setSidebardata({
      searchTerm: "",
      provinceRef: "",
      districtRef: "",
      wardRef: "",
      type: "all",
      parking: false,
      furnished: false,
      offer: false,
      sort: "created_at",
      order: "desc",
    });
    setDistricts([]);
    setWards([]);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* --------------Phần lọc------------------------- */}
      <div className="p-7  border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Tìm kiếm:</label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Nhập..."
              className="border rounded-lg p-3 w-full"
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-4">
            <label className="font-semibold">Chọn địa điểm:</label>
            <select
              id="provinceRef"
              onChange={handleProvinceChange}
              className="border rounded-lg p-3"
              defaultValue=""
            >
              <option value="" disabled>
                Chọn thành phố
              </option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {districts.length > 0 && (
              <select
                id="districtRef"
                onChange={handleDistrictChange}
                className="border rounded-lg p-3"
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn quận/huyện
                </option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            )}
            {wards.length > 0 && (
              <select
                id="wardRef"
                onChange={handleWardChange}
                className="border rounded-lg p-3"
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn xã/phường
                </option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Loại:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="all"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === "all"}
              />
              <span>Cho thuê & Bán</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === "rent"}
              />
              <span>Cho thuê</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.type === "sale"}
              />
              <span>Bán</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Tiện ích:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.parking}
              />
              <span>Có chỗ đỗ xe</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.furnished}
              />
              <span>Trang bị nội thất</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Lọc:</label>
            <select
              onChange={handleChange}
              defaultValue={"created_at_desc"}
              id="sort_order"
              className="border rounded-lg p-3"
            >
              <option value="area_desc">
                Theo diện tích từ cao xuống thấp
              </option>
              <option value="area_asc">Theo diện tích từ thấp lên cao</option>
              <option value="regularPrice_desc">
                Theo giá từ cao xuống thấp
              </option>
              <option value="regularPrice_asc">Theo giá từ thấp lên cao</option>
              <option value="createdAt_desc">Mới nhất</option>
              <option value="createdAt_asc">Cũ nhất</option>
            </select>
          </div>
          <button className="bg-slate-700 font-semibold text-white p-3 rounded-lg uppercase hover:opacity-95">
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="bg-red-600 font-semibold text-white p-3 rounded-lg uppercase hover:opacity-95"
          >
            Xóa bộ lọc
          </button>
        </form>
      </div>
      {/*---------------- Phần kết quả ---------------------- */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Kết quả tìm kiếm:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700">
              Không tìm thấy bất động sản nào!
            </p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">
              Loading...
            </p>
          )}
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-green-700 hover:underline p-7 text-center w-full"
            >
              Xem thêm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
