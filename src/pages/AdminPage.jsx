import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, Table, Button, message } from "antd";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);

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
        setUsers(data);
      } else {
        const data = await res.json();
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Listings
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
        const listingsWithUsername = data.map((listing) => ({
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

  // Fetch Pending Listings
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
        const pendingListingsWithUsername = data.map((listing) => ({
          ...listing,
          userRef:
            users.find((user) => user._id === listing.userRef)?.username ||
            "Unknown",
        }));
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
    // Fetch Users
    fetchUsers();
  }, [currentUser, users, listings, pendingListings]);

  useEffect(() => {
    // Gọi fetchListings và fetchPendingListings sau khi users được cập nhật
    if (users.length > 0) {
      fetchListings();
      fetchPendingListings();
    }
  }, [currentUser, users, listings, pendingListings]);

  //User tab-----------------
  // Handle Get User
  const handleGetUser = (id) => {
    window.open(`/profile/${id}`, "_blank");
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
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

  // Cấu hình các cột của bảng User
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
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex gap-2">
          <Button type="primary" onClick={() => handleGetUser(record._id)}>
            Get
          </Button>
          <Button
            type="default"
            className="bg-yellow-300 hover:bg-yellow-600! text-black"
          >
            Update
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteUser(record._id)}
          >
            Delete
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
        pagination={{ pageSize: 5 }}
      />
    );
  };

  //Listings tab-----------------
  // Handle Get Listing
  const handleGetListing = (id) => {
    window.open(`/listing/${id}`, "_blank");
  };
  // Handle Delete Listing
  const handleDeleteListing = async (id) => {
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

  // Handle Set Listing Status
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
        setListings(
          listings.map((listing) =>
            listing._id === id ? { ...listing, status } : listing
          )
        );
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to update listing status");
      }
    } catch (error) {
      message.error("An error occurred while updating the listing status");
      console.log(error);
    }
  };

  const handleApproveListing = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/approveListing/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (res.ok) {
        message.success("Listing approved successfully");
        setPendingListings(
          pendingListings.filter((listing) => listing._id !== id)
        );
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
      const res = await fetch(`${API_BASE_URL}/api/admin/rejectListing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (res.ok) {
        message.success("Listing rejected successfully");
        setPendingListings(
          pendingListings.filter((listing) => listing._id !== id)
        );
      } else {
        const data = await res.json();
        message.error(data.message || "Failed to reject listing");
      }
    } catch (error) {
      message.error("An error occurred while rejecting the listing");
      console.log(error);
    }
  };

  // Cấu hình các cột của bảng Listing
  const listingColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Username",
      dataIndex: "userRef",
      key: "userRef",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button type="primary" onClick={() => handleGetListing(record._id)}>
              Get
            </Button>
            <Button
              type="default"
              className="bg-yellow-300 hover:bg-yellow-600! text-black"
            >
              Update
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => handleDeleteListing(record._id)}
            >
              Delete
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="default"
              onClick={() => handlePendListing(record._id, "Pending")}
            >
              Set Pending
            </Button>
            <Button
              type="default"
              onClick={() => handleApproveListing(record._id, "Approved")}
            >
              Set Approved
            </Button>
            <Button
              type="default"
              onClick={() => handleRejectListing(record._id, "Rejected")}
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
        pagination={{ pageSize: 5 }}
      />
    );
  };

  //Pending listing tab-----------------

  const pendingListingColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Username",
      dataIndex: "userRef",
      key: "userRef",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() => handleApproveListing(record._id)}
          >
            Approve
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleRejectListing(record._id)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

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

  // Cấu hình các tab
  const items = [
    {
      key: "1",
      label: "Users",
      children: renderUsersTable(),
    },
    {
      key: "2",
      label: "Listings",
      children: renderListingsTable(),
    },
    {
      key: "3",
      label: "Pending Listings",
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
