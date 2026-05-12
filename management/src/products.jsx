import React, { useState, useEffect } from "react";
import './UsersStyle.css'

import MyClass from './MyMethods.js'
import ProdRender from './Rendering nested mongodb objects.jsx'

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap/dist/css/bootstrap.min.css';


const AllProductTable = ({ AllProducts,setItems }) => {
    const [loading, setloading] = useState(false)
    const [search, setsearch] = useState(null);


    useEffect(() => {
        const fetchL = async () => {
                setloading(true)
            try {
                // console.log(items, " dynamically!")


                console.log(typeof AllProducts);
                console.log(AllProducts);

                

         


            } catch (error) {
                console.error(error);
            }
            finally {
                console.log("loading");
                console.log(loading);
                setloading(false)
            }
        };
        fetchL();
    }, [AllProducts]);

    const findSKU = async () => {
        setloading(true)
        try {

            var response = await fetch("http://localhost:5000/api/products/sku/" + search);
            var data = await response.json();

            console.log(data);
            alert(JSON.stringify(data))
            setItems(data)
        } catch (err) {

            console.error(err)
        }
        finally {

        setloading(true)
        }
    }

    return (
        <div>

            {AllProducts && <>


            {loading && (
                <div style={{ margin: "0px 0px", display: "flex", justifyContent: "center" }}>
                    <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: "100px", height: "100px", animation: "spin 1s linear infinite" }}></div>

                </div>
            )}
        </>
                }


            

            <input onChange={(e) => setsearch(e.target.value)} type="text" placeholder="SKU" />
            <button onClick={findSKU}>Search
            </button>



            {AllProducts && <>
               
                <ProdRender data={AllProducts }  />
            </>}
            
    
        </div>
    );




}
export default AllProductTable;