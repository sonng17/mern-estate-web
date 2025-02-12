import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, Table, Button, message, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  //Fetch data
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/getAllUsers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        const data = await res.json();
        const sortedUsers = data.sort((a, b) => b._id.localeCompare(a._id));
        setUsers(sortedUsers);
      } else {
        const data = await res.json();
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchListings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/getAllListings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        const data = await res.json();
        const sortedListings = data.sort((a, b) => b._id.localeCompare(a._id));
        const listingsWithUsername = sortedListings.map((listing) => ({
          ...listing,
          userRef:
            users.find((user) => user._id === listing.userRef)?.username ||
            "Unknown",
        }));
        setListings(listingsWithUsername);
      } else {
        const data = await res.json();
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchPendingListings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/getPendingListings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        const data = await res.json();
        // Sắp xếp giảm dần theo _id
        const sortedPendingListings = data.sort((a, b) =>
          b._id.localeCompare(a._id)
        );
        const pendingListingsWithUsername = sortedPendingListings.map(
          (listing) => ({
            ...listing,
            userRef:
              users.find((user) => user._id === listing.userRef)?.username ||
              "Unknown",
          })
        );
        setPendingListings(pendingListingsWithUsername);
      } else {
        const data = await res.json();
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentUser]);
  useEffect(() => {
    // Gọi fetchListings và fetchPendingListings sau khi users được cập nhật
    if (users.length > 0) {
      fetchListings();
      fetchPendingListings();
    }
  }, [users]);

  // Chức năng của table
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  //User tab-----------------
  // Cấu hình các cột của bảng User
  const handleGetUser = (id) => {
    window.open(`/#/profile/${id}`, "_blank");
  };
  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa tài khoản này?"
    );

    if (!confirmDelete) {
      return; // Dừng lại nếu người dùng nhấn "Cancel"
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/deleteUser/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        message.success("User deleted successfully");
        setUsers(users.filter((user) => user._id !== id)); // Cập nhật danh sách user sau khi xóa
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      message.error("An error occurred while deleting the user");
      console.log(error);
    }
  };
  const handlePromoteUser = async (id, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promoteUser/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        message.success(`User role updated to ${role}`);
        fetchUsers();
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to update user role");
      }
    } catch (error) {
      message.error("An error occurred while updating the user role");
      console.log(error);
    }
  };
  const userColumns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => (
        <img
          src={avatar}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      ...getColumnSearchProps("username"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        {
          text: "Admin",
          value: "admin",
        },
        {
          text: "User",
          value: "user",
        },
      ],
      onFilter: (value, record) => record.role.includes(value),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      render: (createdAt) => new Date(createdAt).toLocaleString(), // Hiển thị thời gian đẹp hơn
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex gap-2">
          <Button
            className="font-semibold w-24"
            type="primary"
            onClick={() => handleGetUser(record._id)}
          >
            Get
          </Button>

          <Button
            className="font-semibold w-24"
            type="primary"
            danger
            onClick={() => handleDeleteUser(record._id)}
          >
            Delete
          </Button>
          <Button
            className="font-semibold w-40 text-blue-500 border-2 border-blue-500"
            onClick={() => handlePromoteUser(record._id, "Admin")}
          >
            Promote to Admin
          </Button>
        </div>
      ),
    },
  ];
  // Render bảng danh sách User
  const renderUsersTable = () => {
    return (
      <Table
        dataSource={users}
        columns={userColumns}
        rowKey={(record) => record._id} // Dùng _id làm key cho từng hàng
        pagination={{ pageSize: 6 }}
      />
    );
  };

  //Listings tab-----------------
  // Cấu hình các cột của bảng Listing
  const handleGetListing = (id) => {
    window.open(`/#/listing/${id}`, "_blank");
  };
  const handleDeleteListing = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài đăng này?"
    );
    if (!confirmDelete) {
      return; // Dừng lại nếu người dùng nhấn "Cancel"
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/deleteListing/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        message.success("Listing deleted successfully");
        setListings(listings.filter((listing) => listing._id !== id)); // Cập nhật danh sách listing sau khi xóa
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to delete listing");
      }
    } catch (error) {
      message.error("An error occurred while deleting the listing");
      console.log(error);
    }
  };
  const handlePendListing = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/pendListing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include", // Đảm bảo gửi cookie kèm theo yêu cầu
      });
      if (res.ok) {
        message.success(`Listing status updated to ${status}`);
        fetchPendingListings();
        fetchListings();
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to update listing status");
      }
    } catch (error) {
      message.error("An error occurred while updating the listing status");
      console.log(error);
    }
  };
  const handleApproveListing = async (id, status) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/approveListing/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
          credentials: "include",
        }
      );
      if (res.ok) {
        message.success(`Listing status updated to ${status}`);
        fetchPendingListings();
        fetchListings();
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to approve listing");
      }
    } catch (error) {
      message.error("An error occurred while approving the listing");
      console.log(error);
    }
  };
  const handleRejectListing = async (id) => {
    try {
      // Hiển thị prompt để admin nhập lý do từ chối
      const reason = prompt(
        "Nhập lý do từ chối duyệt:"
      );

      // Nếu admin không nhập lý do, dừng hàm
      if (!reason) {
        return;
      }

      // Gửi request đến API với lý do từ chối
      const res = await fetch(`${API_BASE_URL}/api/admin/rejectListing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: reason }), // Gửi lý do trong body
        credentials: "include",
      });

      if (res.ok) {
        message.success(`Listing has been rejected successfully.`);
        fetchPendingListings(); // Cập nhật danh sách bài đăng chờ
        fetchListings(); // Cập nhật danh sách bài đăng
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to reject listing");
      }
    } catch (error) {
      message.error("An error occurred while rejecting the listing");
      console.log(error);
    }
  };

  const listingColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Area(m2)",
      dataIndex: "area",
      key: "area",
      ...getColumnSearchProps("area"),
    },
    {
      title: "Price(VND)",
      dataIndex: "regularPrice",
      key: "regularPrice",
      ...getColumnSearchProps("regularPrice"),
      render: (value) => value?.toLocaleString("vi-VN") || "0",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        {
          text: "Rent",
          value: "rent",
        },
        {
          text: "Sale",
          value: "sale",
        },
      ],
      onFilter: (value, record) => record.type.includes(value),
    },
    {
      title: "Username",
      dataIndex: "userRef",
      key: "userRef",
      ...getColumnSearchProps("userRef"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        {
          text: "Approved",
          value: "approved",
        },
        {
          text: "Rejected",
          value: "rejected",
        },
        {
          text: "Pending",
          value: "pending",
        },
      ],
      onFilter: (value, record) => record.status.includes(value),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 m-auto">
            <Button
              className="font-semibold w-24"
              type="primary"
              onClick={() => handleGetListing(record._id)}
            >
              Get
            </Button>
            <Button
              className="font-semibold w-24"
              type="primary"
              danger
              onClick={() => handleDeleteListing(record._id)}
            >
              Delete
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="font-semibold text-yellow-500 border-2 border-yellow-500  "
              type="default"
              onClick={() => handlePendListing(record._id, "Pending")}
            >
              Set Pending
            </Button>
            <Button
              type="default"
              onClick={() => handleApproveListing(record._id, "Approved")}
              className="font-semibold text-blue-500 border-2 border-blue-500"
            >
              Set Approved
            </Button>
            <Button
              type="default"
              onClick={() => handleRejectListing(record._id, "Rejected")}
              className="font-semibold text-red-500 border-2 border-red-500"
            >
              Set Rejected
            </Button>
          </div>
        </div>
      ),
    },
  ];
  // Render bảng danh sách Listing
  const renderListingsTable = () => {
    return (
      <Table
        dataSource={listings}
        columns={listingColumns}
        rowKey={(record) => record._id} // Dùng _id làm key cho từng hàng
        pagination={{ pageSize: 6 }}
      />
    );
  };

  //Pending listing tab-----------------
  // Cấu hình các cột của bảng Pending Listing
  const pendingListingColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Area(m2)",
      dataIndex: "area",
      key: "area",
      ...getColumnSearchProps("area"),
    },
    {
      title: "Price(VND)",
      dataIndex: "regularPrice",
      key: "regularPrice",
      ...getColumnSearchProps("regularPrice"),
      render: (value) => value?.toLocaleString("vi-VN") || "0",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      ...getColumnSearchProps("type"),
    },
    {
      title: "Username",
      dataIndex: "userRef",
      key: "userRef",
      ...getColumnSearchProps("userRef"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      ...getColumnSearchProps("status"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex gap-2">
          <Button
            className="font-semibold w-24"
            type="primary"
            onClick={() => handleGetListing(record._id)}
          >
            Get
          </Button>
          <Button
            className=" w-24 font-semibold bg-inherit text-blue-500 border-2 border-blue-500"
            onClick={() => handleApproveListing(record._id, "Approved")}
          >
            Approve
          </Button>
          <Button
            className=" w-24 font-semibold bg-white text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => handleRejectListing(record._id, "Rejected")}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];
  // Render bảng danh sách Pending Listing
  const renderPendingListingsTable = () => {
    return (
      <Table
        dataSource={pendingListings}
        columns={pendingListingColumns}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
      />
    );
  };
  //---------------------------

  // Cấu hình tab chung
  const items = [
    {
      key: "1",
      label: "Người dùng",
      children: renderUsersTable(),
    },
    {
      key: "2",
      label: "Bài đăng",
      children: renderListingsTable(),
    },
    {
      key: "3",
      label: "Xét duyệt",
      children: renderPendingListingsTable(),
    },
  ];

  return (
    <div>
      {currentUser && currentUser.role === "admin" && (
        <div className="min-h-full">
          <h1 className="text-3xl font-semibold text-center text-slate-700 my-7">
            Admin Dashboard
          </h1>
          <Tabs
            className="border-t-2 border-black m-5"
            defaultActiveKey="1"
            items={items}
          />
        </div>
      )}
    </div>
  );
}
