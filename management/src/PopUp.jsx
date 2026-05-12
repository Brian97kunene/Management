import React, { useState, useEffect } from "react";

import MyClass from './MyMethods.js'
import Modal from './Modal.jsx'





// Component to edit a single product record
const UserEditor = ({ user, products,loading }) => {
    const port = 5552;
    const [vendors, setVendors] = useState([]);
    const [popup, setpopup] = useState(false)
   

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

    const sortProduct = (products) => {
        products.map()
    };

    const columnsToExclude = ['id', 'detailed_description', 'vat', 'created_on', 'supplier_code', 'is_synced','description']


    const feedbackStyles = (indx) => {


        var styl = null;
        if (indx === products.length - 1 && products.length - 1 > 1 ) {
           styl = { backgroundColor:  "yellow" }

        }
        else {
            styl = { backgroundColor: indx === 0 ? "lightgreen" : "" }

        }


        return styl
    
    }
    const SwitchProduct = async (indx)  => {

        var p = [];

        console.log(indx, " this is it!");
        console.log("****");
        let x = products.filter(i => i.supplier !== indx.supplier && i.is_synced)
        x.map(i => {
            console.log("This is what must be switched ",i);
        }

        

        )



        const [unsync, sync] = await Promise.all([
            MyClass.unsyncProducts(x),
            MyClass.syncProducts(indx)
        ]);
    

        console.log("unsync:", unsync);
        console.log("sync:" ,sync);


    }

    

    return (


        <div className="PopUpModal" style={{ width: "100%" }}>

            <Modal isOpen={popup} onClose={() => setpopup(false)} title="Edit Product" children="This is the body of the Modal" />

            <h1>Resolve SKU Conflicts in Synced Products
            </h1><br />


            {/*loading animation*/}
            {/*loading animation*/}
            {/*loading animation*/}
            {loading && (
                <div style={{ margin: "20px 0" }}>
                    <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                    
                </div>
            )}


            <div className="actions" >
                <div style={{ display: "inline-block" }}>
                    <div style={{ display: "inline-block", width: "80%", backgroundColor: "red" }}>

                    </div>
                    <div style={{ display: "inline-block", width: "20%", border: "1px solid black", margin: "0px 0px 1% 0px" }}>

                        <span style={{ color: "red", fontSize: "30px" }}>*  </span>synced product

                        <br />

                        <span style={{ backgroundColor: "lightgreen", width: "1%" }}>
                           Cheapest Product
                        </span>

                        <br />

                        <span style={{ backgroundColor: "yellow", width: "1%" }}>
                            Most Expensive Product
                        </span>

                    </div>

                </div>

            </div>
            <table className=""  >
                <thead>
                    <tr>
                        { products.length > 0  && 
                            <>
                           
                            {Object.keys(products[0]).filter((col) => !columnsToExclude.includes(col)).map((col, indx) =>

                                <th key={indx} scope="col">{col.toLocaleUpperCase()}</th>

                            ) }
                            </>

                            
                        }
                    </tr>
                </thead>
                <tbody>

                    {products &&
                        <>
                        {/*sorting an array logic*/ }
                        {/*sorting an array logic*/ }
                        {/*sorting an array logic*/ }
       
                        {products.sort((a, b) => a.price - b.price).map((row, rowIndex) => (
                            <>
                           
                                <tr key={rowIndex} style={feedbackStyles(rowIndex)} onClick={()=> setpopup(true) }>
                                    {
                                     
                                     /*row.supplier_code ===*/ products[0].supplier_code && (<>

                                        {Object.keys(row).filter((col) => !columnsToExclude.includes(col)).map((col, colIndex) => (
                                            <>

                                                
                                                    
                                               
                                            
                                                <td style={{ width: "100px", padding: "5px",border:"0px solid black" }} key={colIndex}>
                                                                                              
                                                     {row.is_synced && colIndex === 0 ? <span style={{ color: "red", fontSize: "30px" }}>*</span> : ""}
                              
                                                  
                                                    {typeof row[col] === "string" && row[col].includes("T") && row[col].endsWith("Z")
                                                        ? new Date(row[col]).toLocaleString() 
                                                        : row[col]}
                                                   
                                                </td>
                                             
                                                </>
                                        ))}
                                
                                    </>)
                                    }
                                    
                            </tr>
                        
                        </>
                    ))}

                        </>

    
                    }
                </tbody>
            </table>
           

        </div>


    );

};






const PopupExample = ({ product, val, close }) => {
    const [products, setProducts] = useState([]);   
    const [loading, setLoading] = useState(false); 
    useEffect(() => {
        const fetchUs = async () => {
            setLoading(true);
            console.log(product);


            let v = await  MyClass.getpreciseproduct(product.sku,"sku")
            setProducts(v); 
            console.log(v);
            setLoading(false);
        };

        fetchUs();
    }, [product]);

    useEffect(() => {
        const fetchUss = async () => {
            console.log(products);
            console.log(typeof products);
            console.log(products.sort((a, b) => b.price - a.price));

            
        };

        fetchUss();
    }, [products]);



    return (
        <div>
            {/* Button to open popup */}


            {/* Popup */}
            {val && (
                <div style={styles.overlay}>
                    <div style={styles.popup}>




                        {products && (
                            <UserEditor
                                user={product}
                                products={products}
                                loading={loading}

                                    
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
        top: "0%",
        bottom: "0%",
        border: "1px groove red",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "left", alignItems: "center"
    },
    popup: {
        backgroundColor: "white",
        padding: "5px",
        borderRadius: "16px",
        minWidth: "200px",
        textAlign: "center"
    }
};

export default PopupExample;
