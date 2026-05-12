import React, { useState, useEffect } from "react";

import Pop from "./App.jsx";
import feed from "./syntech-feed.json";
import SearchTable from "./SearchTable.jsx";
import Man from './Synced_Products.jsx'
function ManualRowSelection() {

    const [liveproducts, setliveproducts] = useState([]);
    const [searchproducts, setsearchproducts] = useState([]);


    const [lastUpdates, setlastUpdates] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    //const [currentProdCount, setcurrentProdCount] = useState(0);




    // Pagination logic
    // Pagination logic
    // Pagination logic
    const itemsPerPage = 5; // number of rows per page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = liveproducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(liveproducts.length / itemsPerPage);
    const [progress, setProgress] = useState(0);

    const [loading, setLoading] = useState(false);
    const [refresh, setrefresh] = useState(false);
    const [fals, setFals] = useState(false);
    const [showsynced, setshowsynced] = useState(false);



    const port = 5552;
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setProgress(0);

                // Simulate progress increments while fetching
                const interval = setInterval(() => {
                    setProgress((prev) =>  (prev <= 75 ? prev + 10 : prev));
                }, 100);
                // for sync testing

                try {
                    var response = await fetch("http://localhost:5555/api/syntech-feed");

                    var data = await response.json();
                    try {
                        setliveproducts(data.products);
                        console.log("we are here");
                    }
                    catch(err) {
                    setliveproducts(feed.products);
                        console.log("we are here also " ,err);

                    }
                }
                catch (err) {

                    setliveproducts(feed.products);
                    console.error(err);
                }
                

                //console.error(JSON.stringify(feed.products[0].attributes.brand));
               /// const lastUpdatess = feed.products.last_modified;
               setlastUpdates(lastUpdates);
                clearInterval(interval);
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
              
                
             
                    setLoading(false);
                    setProgress(0); // reset after short delay
               
            }
        };

        fetchUsers();
    }, [refresh, lastUpdates]);





    //  MANUALLY   Add product to database


    const refreshComponent = () => {

        ;


    }
    const addToDb = async (x) => {


        setLoading(true); // show spinner

        try {

            const response = await fetch(`http://localhost:${port}/api/bulk-insert`, {
                method: "POST", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({ rows: x }),
            });

            //var prod = JSON.stringify( x ) ;

            console.log(response);

        }
        catch (err) {

            console.log(`${err} - Something Bad Happened`);

        }
        finally {
            setLoading(false); // hide spinner
        }



    };







    const [searchTerm, setSearchTerm] = useState("");
    //const [produc, setproduc] = useState([]);
    // Filter products based on search term 
    const filteredProducts = liveproducts.filter((u) =>
        Object.values(u).some((val) =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())));







    const search = () => {
        var t = document.getElementById("search_feed").value;

        setProgress(50)

        if (t != "" && t.length >= 1) {

            setFals(false)
            setSearchTerm(t);
        }
        else {
            setSearchTerm(t);
            console.log();
        }

        setProgress(100)
    }


    /* const prods = liveproducts.products;*/
    //const headers = Object.keys(prods[0]);

    return (
        <div className="Live_Feeds">

           


            {loading && (<>

                <h1 style={{ color: "#0c086b" }} onClick={() => searchTerm("")} disabled={loading}>
                    {loading ? "Fetching Live Feed Products..." : ""}
            </h1>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%`}}>{progress}%</div>
                </div></>
            )}
            {/*<button onClick={() => setrefresh(prev => !prev)}>refresh</button>*/}
       
        

            {/*<h2 style={{ padding: "50px", marginTop: "0px", marginLeft: "00px", color: "#0c086b", fontFamily: "Century Schoolbook" }}   >Live Feed:</h2> <h1 style={{ marginTop: "-103px", marginLeft: "345px", color: "#0c086b", fontWeight: "bold", fontFamily: "Century Schoolbook" }}>[ {liveproducts.length} ]  Products {lastUpdates}  </h1>  */}

           
            {/* Search table showing results */}
            {/* Search table showing results */}
            {/* Search table showing results */}
            {/* Search table showing results */}
            {/* Search table showing results */}


            {/*<div class="search_area">*/}
            {/*    <span style={{ marginTop: "10px", marginLeft: "00px" }}>SEARCH FEED:</span>*/}
            {/*    <input type="text" id="search_feed" onChange={() => search()} placeholder="Search products..."*/}
            {/*        style={{ marginTop: "10px", marginBottom: "10px", marginRight: "20px", padding: "5px", width: "250px" }}*/}
            {/*    />*/}
            {/*</div>*/}

            {searchTerm && (<><h1 style={{ marginTop: "0px", marginRight: "00px" }}>Feed Results for: "{searchTerm}"</h1>

                <SearchTable data={liveproducts} search={searchTerm} />
                </>)}
          

            {fals && <><table class="table table-striped">
                <thead>
                    <tr>
                        {/* <td>Image</td>
                       */}<td>Name</td>
                        <td>SKU</td>
                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>Price</td>
                        <td>Vendor</td>
                        <td>Category</td>
                        <td>Quantity</td>
                        <td>RRP</td>
                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>Updated:</td>
                    </tr>
                </thead>
                <tbody>

            

                    {currentItems.map((row) => (
                        <tr key={row.sku}>
                            {row.cptstock + row.jhbstock + row.dbnstock >= 0 && <>
                                {/*<td><img src={row.featured_image} style={{ width: "100px", height: "auto", borderRadius: "8px", border: "2px solid #ccc", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}  /></td>
                            */}<td>{row.name}</td>
                                <td>{row.sku}</td>
                                <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>R{row.price}</td>
                                <td>{row.attributes.brand}</td>
                                <td>{row.categorytree}</td>
                                <td>CPT:{row.cptstock}, JHB:{row.jhbstock} DBN:{row.dbnstock}, TOTAL:{row.dbnstock + row.cptstock + row.jhbstock}</td>
                                <td>{row.recommended_margin}%</td>
                                <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>{row.last_modified}</td>
                            </>
                            }
            
                        </tr>

                    ))}
                </tbody>
            </table>


            </>}

             


            <div style={{display:"flex",justifyContent:"center",margin:"20px 0px 0px 0px"}}>
            <button onClick={() => setshowsynced(!showsynced)}>SHOW SYNCED PRODUCTS
            </button>
            </div>
            {showsynced && < Man />}

            <button style={{ marginTop: "10px", marginLeft: "520px", marginBottom: "50px", padding: "5px", width: "250px", visibility: "hidden" }} onClick={() => setrefresh(prev => !prev )}>REFRESH TABLE</button>
            <Pop products={liveproducts} refresh={refresh} />

        </div>
    );

}


export default ManualRowSelection;
