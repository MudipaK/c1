import { useState, useEffect } from "react";
import {
  getUsersAPI,
  updateUserAPI,
  deleteUserAPI,
} from "../services/UserService";
import { IUser } from "../types/IResponse";
import Button from "../components/Button/Button";
import EditUserDialog from "../components/common/EditUserDialog";

const ManageUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsersAPI();
        if (Array.isArray(response)) {
          setUsers(response);
        } else {
          setError("Failed to load users");
        }
      } catch {
        setError("Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteUserAPI(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    } catch {
      setError("Failed to delete user");
    }
  };

  const handleEdit = (user: IUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editingUser) {
      try {
        await updateUserAPI(editingUser._id, editingUser);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingUser._id ? editingUser : user
          )
        );
        setIsDialogOpen(false);
        // Show success message
        const tempError = "User updated successfully";
        setError(tempError);
        setTimeout(() => {
          if (error === tempError) {
            setError("");
          }
        }, 3000);
      } catch {
        setError("Failed to update user");
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Manage Users</h2>
      
      {error && (
        <div className={`mb-4 p-3 rounded-md ${error.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="search">
          Search Users
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 pl-10 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50 text-left border-b border-blue-100">
                  <th className="p-4 text-blue-700">Name</th>
                  <th className="p-4 text-blue-700">Email</th>
                  <th className="p-4 text-blue-700">Role</th>
                  <th className="p-4 text-blue-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "staff admin" 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            text="Edit"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          />
                          <Button
                            text="Delete"
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete(user._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <EditUserDialog
        isDialogOpen={isDialogOpen}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        setIsDialogOpen={setIsDialogOpen}
        handleUpdate={handleUpdate}
      />
    </div>
  );
};

export default ManageUsers;