import React, { useState, useEffect } from "react";
import './UsersStyle.css'

import Vend from './vendors.jsx'
import MyClass from './MyMethods.js'
import CreateSupplier from "./createSupplier.jsx";
import Upload from './ReadAFile.jsx'
import EditSupp from './EditSupplier.jsx'
import Manual_inputs from './Manual_inputs.jsx'
import Livefeed_Updates from './Livefeed_Updates.jsx'
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap/dist/css/bootstrap.min.css';


const ItemsTable = ({ items, supplier,productLim,increaseLimit ,setItems}) => {

    const [loading, setloading] = useState(true);

    const port = 5552;
    const [suppliers, setSuppliers] = useState([])
    const [activeSupplierId, setActiveSupplierId] = useState(null);
    const [showTbl, setshowTbl] = useState(false)
    const [showSupTbl, setshowSupTbl] = useState(false)
    const [upload, setupload] = useState(false)
    const [filter, setfilter] = useState("name")
    const [filterOrder, setfilterOrder] = useState(true)
    const [manualupload, setmanualupload] = useState(false)
    const [edit, setedit] = useState(false)
    const [updates, setupdates] = useState(true)
    const [editsuppliers, seteditsuppliers] = useState(null)
    const [supps, setsupps] = useState([]);
    const [SupplierModal, setSupplierModal] = useState({

        sup: suppliers,
        open: false
    })
    let activeStyle2 = { display: "inline", margin: "1% 50px 10px 50px", padding: "15px", borderRadius: "15px", border: "1px solid black", color: "#0c086b" }
    useEffect(() => {
        const fetchL = async () => {
            try {
               // console.log(items, " dynamically!")

                
                console.log();

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
    }, [items, loading]);


    useEffect(() => {
        const sortedProducts = async () => {
            if (items) {
                console.log("filter!");
                console.log(filter);
                console.log(filterOrder);
                console.log(items.sort((a, b) => a.quantity - b.quantity));
                console.log(items.sort((a, b) => b.quantity - a.quantity));

                setItems(sortProducts(items, filter))
            }
        };
        sortedProducts();
        }, [filter, filterOrder]);


    function sortProducts(x,y) {


        console.log(x.sort((a, b) => a.quantity - b.quantity));

        if (y === "price" || y === "price_after_mark_up") {
            let a = [];
            if (y === "price") {

                filterOrder === "ASC" ? a = x.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)) :

                    a = x.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))


                return a
            }
            else {
                filterOrder === "ASC" ? a = x.sort((a, b) => parseFloat(a.price_after_mark_up) - parseFloat(b.price_after_mark_up)) :

                    a = x.sort((a, b) => parseFloat(b.price_after_mark_up) - parseFloat(a.price_after_mark_up))

                return a
            }
        }
        else if (y === "name") {

            let a = [];

            filterOrder === "ASC" ? a = x.sort((a, b) => a.name.localeCompare(b.name)) :

                a = x.sort((a, b) => b.name.localeCompare(a.name))

            return a

        }
        else if (y === "sku") {
            let a = [];

            filterOrder === "ASC" ? a = x.sort((a, b) => a.sku.localeCompare(b.sku)) :

                a = x.sort((a, b) => b.sku.localeCompare(a.sku))

            return a

        }
        else if (y === "updated_on") {
            let a = [];

            filterOrder === "ASC" ? a = x.sort((a, b) => new Date(a.updated_on) - new Date(b.updated_on)) :

                a = x.sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on))


            return a
            

        }
        else if (y.toLowerCase() === "quantity") {

            let a = [];

            filterOrder === "ASC" ? a = x.sort((a, b) => a.quantity - b.quantity) :

                a = x.sort((a, b) => b.quantity - a.quantity)

      
                return a
            

        }
        else {

            return [];

        }




    }
    function filteredProducts() {

        if (items) {

            let x = sortProducts(items, filter) ;
 
            console.log("sorted");
            console.log(x);
            console.log(items);
            return x;
        }
       
            
    }
    function viewsupplier(supp) {

        seteditsuppliers(null)
        suppliers.filter(s => supp.id === s.id).map(i => {



            console.log(i)

            setSupplierModal({ sup: i, open: true })

        });
        setshowTbl(!showTbl)
        seteditsuppliers(supp)
        console.log(SupplierModal);
    }

    const columnsToExclude = ["id", "detailed_description", "livefee_updated_on", "data_source", "supplier_code", "created_on", "vat", "vendor", "delivery_cost"];

    return (


        <div className="vendor_List" style={{ margin: "1% 0px" }}>

            <h1>SUPPLIER: {supplier.name.toUpperCase()}</h1>
            



            <div class="" role="alert">


                <h4>Email: {supplier.email}</h4>
                <h4>Contact: {supplier.contact}</h4>
                <h4>Business Address: {supplier.address}</h4>
                <h4>Data Format: {supplier.data_format}</h4>
                <h4>Last Update: {MyClass.formatDate(supplier.created_at)}</h4>
                {edit && <div>
                    <br />


                    <EditSupp supplier={editsuppliers} />
                </div>
                }
                <h4>{supplier.contact_person}</h4>
                <button onClick={() => viewsupplier(supplier)} id={supplier.id} >View Products</button>

                {(supplier.data_format === "XML" || supplier.data_format === "CSV") &&
                    <button onClick={() => setupload(!upload)}>Update Products</button>

                }
                {supplier.data_format === "Manual" &&
                    <button onClick={() => setmanualupload(!manualupload)}>Update Products</button>

                }
                {supplier.data_format === "Live Feed" &&
                    <button onClick={() => setupdates(!updates)}>Check for Updates</button>

                }


                <button onClick={() => seteditsuppliers(supplier)}>Update Details</button>

                <div style={{ display: "flex", justifyContent: "right" }} >

                    {upload && (supplier.data_format === "XML" || supplier.data_format === "CSV") && (<div>
                        <br />


                        <Upload supplier={supplier} />
                    </div>)
                    }
                    {manualupload && supplier.data_format === "Manual" && (<div>
                        <br />


                        <Manual_inputs supplier={supplier} />
                    </div>)
                    }

                </div>


                {updates &&
                    <div>
                        <Livefeed_Updates supplier={supplier} update={updates} setupd={() => setupdates(!updates)} />
                    </div>

                }

                
                <div style={{ display: "flex", justifyContent: "right" }}>
                    <span style={{ font: "16px" }} > Filter By:</span>

                    <select onChange={(e) => setfilter(e.target.value)}>
                        {Object.keys(items[0] || {}).filter((i) => !columnsToExclude.includes(i)).map((col, indx) => (

                            <option key={indx} value={col}> {col.toUpperCase()}</option>
                        ))}

                    </select>
                    <span style={{ font: "16px" }} > Order :</span>

                    <select onChange={(e) => setfilterOrder(e.target.value)}>


                        <option >ASC </option>
                        <option >DESC </option>


                    </select>
                </div>



                {items && <>


                    {loading && (
                        <div style={{ margin: "0px 0px", display: "flex", justifyContent: "center" }}>
                            <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: "100px", height: "100px", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>

                        </div>
                    )}
                </>
                }

                {/*<button onClick={() => setrefresh(!refresh)}> ref*/}
                {/*</button>*/}
                <br />
                {!Array.isArray(items) || items.length === 0 ? (
                    `Showing ${items.length} Products` 
                ) : (<>

                        <div

                            className="table-container"
                        >
                            {`Showing ${items.length} Products`}

                            <table className="table table-striped"
                            >
                            <thead>
                                <tr>
                                        {Object.keys((supps?.[0] || items?.[0]) ?? {}).filter((col) => !columnsToExclude.includes(col))

                                            .map((col, indx) => (
                                                <th key={indx}>{col.toUpperCase()}</th>
                                            )) }
                                </tr>
                            </thead>
                                <tbody>
                                    {((supps ? items:supps)).map((row, rowIndex) => (
                                        <tr key={rowIndex} onClick={() => console.log(row)}>
                                            {Object.keys(row).filter((col) => !columnsToExclude.includes(col))
                                                .map((col, colIndex) => {
                                                

                                                    const value = row[col];
                                                    let displayValue = value;
                                                    let duplicateStyle = { color: "red" };
                                                    let syncStyle = { color: "green" };

                                                    // 1. Handle Dates
                                                    if (typeof value === "string" && value.includes("T") && value.endsWith("Z")) {
                                                        displayValue = new Date(value).toLocaleString();
                                                    }

                                                    // 2. Handle Booleans (like is_duplicate or is_synced)
                                                    if (typeof value === "boolean" ) {
                                                        displayValue = value ? "YES" : "NO";
                                                    }
                                                   

                                                    return (
                                                        <td
                                                            key={colIndex}
                                                            className={colIndex === 0 ? "stickyrowNumbers" : ""}
                                                            // Apply conditional styling if it's a boolean column
                                                            style={typeof value === "boolean"  ? { textAlign: "left", fontWeight: "bold" } : {}}
                                                        >
                                                            {/* Row Numbering for first column */}
                                                            {colIndex === 0 && <span className="stickyrowNumberss">{rowIndex + 1+") "} </span>}

                                                            {/* The Actual Data */}
                                                            {typeof value === "boolean" ? (
                                                                <span className={value ? "alert-danger" : "alert-success"} style={{ padding: '2px 8px', borderRadius: '4px' }}>
                                                                    <span style={displayValue !== "YES" && Object.keys(row)[colIndex]?.toString() === "is_duplicate" || Object.keys(row)[colIndex]?.toString() === "is_synced" ? { color: "red" } : { color: "green" }}> {displayValue}</span>  
                                                                </span>
                                                            ) : (
                                                                displayValue
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                       
                                    
                                        </tr>
                                    )) }
                                </tbody>
                        </table>
                    </div>
                </>

                )}

                <div style={{ margin: "10px 0px", display: "flex", justifyContent: "center" }}>

                <button onClick={increaseLimit}  >View More Products</button>
                </div>


            </div>
        </div>
    );

}
export default ItemsTable;

