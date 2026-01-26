import React, { useState, useEffect } from "react";

// Component to edit a single user
const UserEditor = ({ user, onClose, onUpdated }) => {
    const [form, setForm] = useState({ name: user.name, description: user.description });
    const port = 5525;
    const handleUpdate = async () => {
        try {
            const port = 5525;
            const response = await fetch(`http://localhost:5525/updateuser/${user.Id}`, {
                method: "PUT", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedUser = await response.json();
            onUpdated(updatedUser.data); // notify parent
            onClose(); // close editor
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <div style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>
            <h3>Edit User</h3>
            <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button onClick={handleUpdate}>Save</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

// Main component showing list of users
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    // Load all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const port = 5525;
                const response = await fetch("http://localhost:5525/userr");
                const data = await response.json();
                setUsers(data.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // Update user in state after editing
    const handleUserUpdated = (updatedUser) => {
        setUsers(users.map(u => (u.Id === updatedUser.Id ? updatedUser : u)));
    };

    return (
        <div>
            <h2>User List</h2>
            <ul>
                {users.map(u => (
                    <li key={u.Id}>
                        {u.name} ({u.description})
                        <button onClick={() => setEditingUser(u)}>Edit</button>
                    </li>
                ))}
            </ul>

            {editingUser && (
                <UserEditor
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdated={handleUserUpdated}
                />
            )}
        </div>
    );
};

export default UserList;
