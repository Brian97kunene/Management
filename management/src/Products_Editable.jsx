import React, { useState, useEffect } from "react";
import './UsersStyle.css'

// Component to edit a single user
const UserEditor = ({ user, onClose, onUpdated }) => {
    const [form, setForm] = useState({ name: user.name, description: user.description, sku: user.sku, retail_price: user.price, delivery_cost: user.delivery_cost, mark_up:user.mark_up, vat: user.vat });
    const port = 5552;
    const handleUpdate = async () => {
        try {
            //const port = 5557;
            const response = await fetch(`http://localhost:${port}/updateuser/${user.Id}`, {
                method: "PUT", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });
            console.log(form.data);
            //console.log(form.data);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedUser = await response.json();
            console.log("User updated:", updatedUser.data);
            onUpdated(updatedUser.data); // notify parent
            onClose(); // close editor
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };



// Component to delete a single record
    const handleDelete = async () => {
        try {
           // const port = 5555;
            const response = await fetch(`http://localhost:` + {port} +`/deleteuser/${user.Id}`, {
                method: "DELETE", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedUser = await response.json();
            console.log("Delete Complete:", updatedUser.data);
            onUpdated(updatedUser.data); // notify parent
            onClose(); // close editor
        } catch (error) {
            console.error("Delete Error", error);
        }
    };





    return (
        <div style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>
            <h3>Edit Product</h3>
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
            <input
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <input
                placeholder="Retail Price"
                value={form.retail_price}
                onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
            />
            <input
                placeholder="Mark Up"
                value={form.mark_up}
                onChange={(e) => setForm({ ...form, mark_up: e.target.value })}
            />
            <input
                placeholder="Delivery Cost"
                value={form.delivery_cost}
                onChange={(e) => setForm({ ...form, delivery_cost: e.target.value })}
            />
            <input
                placeholder="Tax"
                value={form.vat}
                onChange={(e) => setForm({ ...form, vat: e.target.value })}/>
            <button onClick={handleUpdate}>Save</button>
            <button onClick={handleDelete}>Delete</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

// Main component showing list of users
const UserList = () => {

    const port = 5552;
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    // Load all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
            
                const response = await fetch("http://localhost:" + port + "/userr");
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
        <div className="Products_List">
        { editingUser && (
            <UserEditor
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onUpdated={handleUserUpdated}
            />
        )};

            <h2>Products List</h2>
            <table className="prod_table" Id="prod_table">
                <thead>
                    <tr>
                        
                        <th>PRODUCT NAME</th>
                        <th>DESCRIPTION</th>
                        <th>SKU</th>
                        <th>PRICE</th>
                        <th>DELIVERY</th>
                        <th>MARK UP</th>
                        <th>VAT</th>
                        <th>VENDOR</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.Id}>
                            
                            <td>{u.name}</td>
                            <td>{u.description}</td>
                            <td>{u.sku}</td>
                            <td>{u.price}</td>
                            <td>{u.delivery_cost}</td>
                            <td>{u.mark_up}</td>
                            <td>{u.vat}</td>
                            <td>{u.vendor}</td>
                            
                            <td>
                                <button onClick={() => setEditingUser(u)}>Edit</button>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(u.Id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
export default UserList;





