import React, { useState } from "react";
import './UsersStyle.css'
import logo from './logo.jpg'


const CrystalCommunications = () => {
    const [users, setUsers] = useState([]);
    



    // Example with native fetch
    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:5525/userr");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data.data);
            console.log("Fetched data:", data.data);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };   






    return (
        <div class="main">
        <img src={logo}/>
            <h1 class="header">Crystal Comm. Stock Management System</h1>
            <h3>PRODUCTS</h3>
            <div class="add_new_prod_sec">
            <input type="text" id="prod_name" placeholder="Product Name"></input>
            <input type="text" id="prod_desc" placeholder="Product Description"></input>
            <input type="text" id="prod_sku" placeholder="Product SKU"></input>
            <button >ADD NEW PRODUCT</button><br />
            </div>



            <button onClick={fetchData}>All Products</button><br />
            <table>
            <thead>
                    <tr> <th>ID</th> <th> PRODUCT NAME</th> <th>DESCRIPTION </th> <th>SKU</th> </tr></thead>
            
                {users.map(w => (
                 <tbody>
                        <tr key={w.Id}> <td>{w.Id}</td> <td>{w.name}</td> <td>{w.description}</td>  <td>{w.sku}</td>  <button>EDIT</button></tr>
                    </tbody>

                ))}
            </table>
            
           

            
        </div>
    );
};

export default CrystalCommunications;
