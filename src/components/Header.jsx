import { FaSearch, FaBell } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/user/mynotifications/${currentUser._id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
            }
          );

          if (!response.ok) {
            // Kiểm tra nếu phản hồi có lỗi
            throw new Error("Failed to fetch notifications");
          }

          const data = await response.json();

          if (data.message === "No notifications found for this user.") {
            // Nếu không có thông báo, đặt notifications là mảng rỗng
            setNotifications([]);
            setHasUnread(false);
          } else {
            // Nếu có thông báo, tiếp tục xử lý bình thường
            setNotifications(data);
            const unread = data.some(
              (notification) => notification.status === "unread"
            );
            setHasUnread(unread);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          // Có thể hiển thị một thông báo lỗi cho người dùng ở đây
        }
      };

      fetchNotifications();
    }
  }, [currentUser]);
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

  // Xử lý cập nhật trạng thái thông báo thành "read"
  const markNotificationsAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/user/mark-as-read/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          status: "read",
        }))
      );
      setHasUnread(false); // Xóa hiệu ứng "unread"
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  // Xử lý mở/đóng thông báo
  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && hasUnread) {
      markNotificationsAsRead(); // Đánh dấu tất cả là "read"
    }
  };

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
            placeholder="Tìm kiếm..."
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
            <li className="bg-slate-500 text-slate-100 hover:bg-slate-400 sm:inline font-bold  p-2 no-underline hover:font-bold  rounded-3xl border-2 border-slate-100 ">
              Trang chủ
            </li>
          </Link>
          {!currentUser ? (
            <Link to="/about">
              <li className="sm:inline font-bold bg-slate-500 text-slate-100 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-3xl border-2 border-slate-100">
                Thông tin
              </li>
            </Link>
          ) : (
            <Link to={`/create-listing`}>
              <li className="bg-slate-500 text-slate-100 sm:inline font-bold  p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-3xl border-2 border-slate-100">
                Đăng tin
              </li>
            </Link>
          )}

          {currentUser && (
            <Link to={`/profile/${currentUser._id}`}>
              <li className="sm:inline font-bold bg-slate-500 text-slate-100 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-3xl border-2 border-slate-100">
                Hồ sơ
              </li>
            </Link>
          )}

          {currentUser && currentUser.role === "admin" && (
            <Link to={`/admin`}>
              <li className="sm:inline font-bold bg-slate-500 text-slate-100 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-3xl border-2 border-slate-100">
                Quản lý
              </li>
            </Link>
          )}

          {currentUser && (
            <div className="relative">
              <div
                className="flex items-center cursor-pointer justify-center w-7 h-7 hover:bg-slate-300 rounded-2xl relative"
                onClick={toggleNotifications}
              >
                <FaBell
                  className={`text-slate-500 size-7 ${
                    hasUnread ? "text-red-500" : ""
                  }`}
                />
                {hasUnread && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </div>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg border rounded-lg overflow-hidden z-50">
                  <div className="p-3 font-bold text-slate-700 border-b">
                    Thông báo
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-3 text-slate-500">
                      Không có thông báo nào.
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications
                        .slice() // Tạo một bản sao của mảng (tránh thay đổi mảng gốc)
                        .reverse() // Đảo ngược mảng
                        .map((notification) => (
                          <Link
                            to={`/listing/${notification.listingRef}`}
                            key={notification._id}
                          >
                            <li className="p-3 hover:bg-slate-100 border-b text-sm">
                              {notification.content}
                            </li>
                          </Link>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <Link to="/settings">
            {currentUser ? (
              <img
                className=" rounded-full h-9 w-9 object-cover ml-7"
                src={currentUser.avatar}
                alt="profile"
              />
            ) : (
              <li className="sm:inline font-bold bg-slate-500 text-slate-100 p-2 no-underline hover:font-bold hover:bg-slate-300 rounded-3xl border-2 border-slate-100">
                Đăng nhập
              </li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
