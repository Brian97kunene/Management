import React, { useState, useEffect } from "react";
import EditProd from './MyForm - Copy.jsx'
import Dom from './antiDOM approach.jsx' 
import './UsersStyle.css'

const ProductsTable = ({ val, close, supplier }) => {

    const [products, setProducts] = useState([]);
    const [editproduct, seteditProduct] = useState([]);

    const [ProdOffset, setProdOffset] = useState(0);
    const [delivery_val, setdelivery_val] = useState(0);
    const [markupprice, setmarkupprice] = useState([]);
    const [popUp, setpopUp] = useState(false);
   const [loading, setloading] = useState(true);
    const port = 5552;
    useEffect(() => {
        // handle submit data
        const handleSubmit = async () => {
            try {
                setloading(true);
              //  const response = await fetch("http://localhost:" + port + "/getproduct/bysupplier/" + supplier.id + "/" + ProdOffset);

            //    const data = await response.json();
              //  setProducts(data.data);

               // console.log("data :", JSON.stringify(data.data));
               // console.log("supplier :", supplier.name);
                //setUsers(data);
            } catch (error) {
                console.error("Error posting data:", error);
            }
            finally {


                setloading(false);
            }
        }

        handleSubmit()
    }, [supplier, ProdOffset]);


    const tot_products = products.length;

    // Example with native fetch







    return (
        <div>
        <div >
            {/* Button to open popup */}
            

            {/* Popup */}
            {val && (
                    <div >
                        <h1>TOTAL PRODUCTS: {tot_products}</h1>
                        <div >
                            <div>


                                {popUp && <>

                                    <EditProd product={editproduct} val={popUp} close={() => setpopUp(false)} />
                                </>
                                }
                                <Dom key={supplier.id} supplier={ val} />
                            </div>

                            {loading && (
                                <div style={{ margin: "20px 0", display: "flex", justifyContent: "center" }}>
                                    <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: "100px", height: "100px", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>

                                </div>)
                            }

                            

              
                        
                    </div>
                </div>
            )}
            </div>


           

           

        </div>
    );
};

// Simple inline styles for demo


export default ProductsTable;

