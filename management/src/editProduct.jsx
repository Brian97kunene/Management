import React, { useState, useEffect } from "react";








// Component to edit a single product record
const UserEditor = ({ user }) => {
    const [form, setForm] = useState({ name: user.name, description: user.description, sku: user.sku, retail_price: user.price, delivery_cost: user.delivery_cost, mark_up: user.mark_up, vat: user.vat, vendor: user.vendor, quantity: user.quantity, category: user.category });
    const port = 5552;
    const [vendors, setVendors] = useState([]);



    // Load all vendors for dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {

                const response = await fetch("http://localhost:" + port + "/vendors");
                const data = await response.json();
                setVendors(data.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);


    const handleUpdate = async () => {
        try {
            //const port = 5557;
            const response = await fetch(`http://localhost:${port}/api/updateproduct`, {
                method: "POST", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });
            console.log("Updated: " + form.sku);
            //console.log(form.data);

            if (!response.ok) {
                console.log(`HTTP error! Status: ${response.statusText}`);
            }



        } catch (error) {

            console.log(` ${error}`);

        }
    };



    // Component to delete a single product record
    const handleDelete = async () => {
        try {

            const response = await fetch(`http://localhost:${port}/api/deleteuser/${user.sku}`, {
                method: "DELETE", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });



            const updatedUser = await response.json();
            console.log("Delete Complete:", updatedUser.data);
            alert(`Delete Complete: ${form.sku}`);


        } catch (error) {
            console.error("Delete Error", error);
        }
    };


    return (


        <div style={{ width: "100%" }}>
            <h4 >Edit Product: <br /> {form.name}</h4>
            {/*  // Form to edit product details*/}
            {/*  // Form to edit product details*/}
            {/*  // Form to edit product details*/}
            {/*  // Form to edit product details*/}
            {/*  // Form to edit product details*/}

            <h5>Name</h5>
            <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <br />
            <h5>Description</h5>


            <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <br />
            <h5>SKU</h5>


            <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <br />

            <h5>Retail Price</h5>

            <input
                value={form.retail_price}
                onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
            />
            <br />
            <h5>Mark Up</h5>


            <input
                value={form.mark_up}
                onChange={(e) => setForm({ ...form, mark_up: e.target.value })}
            />
            <br />
            <h5> Delivery Cost</h5>


            <input
                value={form.delivery_cost}
                onChange={(e) => setForm({ ...form, delivery_cost: e.target.value })}
            />
            <br />

            <h5> Quantity</h5>




            <input
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <h5> Brand</h5>

            <br />








            <select
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            >Vendor
                <option value="">Select Vendor</option>
                {vendors.map(v => (
                    <option class="dropdown-item" key={v.id} value={v.name}>{v.name}</option>
                ))}
            </select>

            <div className="actions">
                <button onClick={handleUpdate}>Save</button>
                <button onClick={handleDelete}>Delete</button>

            </div>

        </div>


    );

};






const EdtProduct = ({ product, val, close }) => {

    



    return (
        <div>
            {/* Button to open popup */}


            {/* Popup */}
            {val && (
                <div style={styles.overlay}>
                    <div style={styles.popup}>




                        {product && (
                            <UserEditor
                                user={product}


                            />
                        )}


                        <button onClick={close}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple inline styles for demo
const styles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "left"
    },
    popup: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "16px",
        minWidth: "300px",
        textAlign: "center"
    }
};

export default EdtProduct;
