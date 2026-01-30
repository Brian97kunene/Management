import React, { useState } from "react";
import './UsersStyle.css'
import logo from './logo.jpg'


const CrystalCommunications = () => {
    const [users, setUsers] = useState([]);
    const [product, setProduct] = useState({ name: "", description:"",sku:"" });
    const port = 5550;

    // handle submit data
    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:"+port+"/createuser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            }); if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
            } const data = await response.json();
            console.log("User added:", data.data);
        } catch (error) {
            console.error("Error posting data:", error);
        }
    }








    // Example with native fetch
    const fetchData = async () => {
        try {


            const sku = document.getElementById("sku").value;

            const tbl = document.getElementById("prod_table");
            const port = 5552;
            const response = await fetch("http://localhost:" + port + "/api/sku/" + sku);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            while (tbl.rows.length > 1) { tbl.deleteRow(1); }
            const row = tbl.insertRow();
            
            row.insertCell().innerText = data.data.name;
            row.insertCell().innerText = data.data.description;
            row.insertCell().innerText = data.data.sku;
            row.insertCell().innerText = data.data.price;
            row.insertCell().innerText = data.data.delivery_cost;
            row.insertCell().innerText = data.data.mark_up;
            row.insertCell().innerText = data.data.vat;
            row.insertCell().innerText = data.data.vendor;




            
            console.log("Fetched data:", data.data);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };   






    return (
        <div class="main">
        <img class="logo" src={logo}/>
            <h1 class="header">Crystal Comm. Stock Management System</h1>
            <h3>PRODUCTS</h3>
            <div class="add_new_prod_sec">
                <input type="text" value={product.name} id="prod_name" placeholder="Product Name" onChange={(e) => setProduct({ ...product, name: e.target.value })}/>
                <input type="text" id="prod_desc" value={product.description} placeholder="Product Description" onChange={(e) => setProduct({ ...product, description: e.target.value })}/>
                <input type="text" id="prod_sku" value={product.sku} placeholder="Product SKU" onChange={(e) => setProduct({ ...product, sku: e.target.value })}/>
                <button onClick={handleSubmit}>ADD NEW PRODUCT</button><br />
            </div>
            <div class="search_area">
                <span>SEARCH:</span> 
                <input type="text" id="sku" />
                <button onClick={fetchData}>Go</button>

            </div>


            {/*<button onClick={fetchData}>All Products</button><br />*/}
            {/*<table class="prod_table">*/}
            {/*<thead>*/}
            {/*        <tr> <th>ID</th> <th> PRODUCT NAME</th> <th>DESCRIPTION </th> <th>SKU</th> </tr></thead>*/}
            
            {/*    {users.map(w => (*/}
            {/*     <tbody>*/}
            {/*            <tr key={w.Id}> <td>{w.Id}</td> <td>{w.name}</td> <td>{w.description}</td>  <td>{w.sku}</td>  <button>EDIT</button></tr>*/}
            {/*        </tbody>*/}

            {/*    ))}*/}
            {/*</table>*/}
            
           

            
        </div>
    );
};

export default CrystalCommunications;
