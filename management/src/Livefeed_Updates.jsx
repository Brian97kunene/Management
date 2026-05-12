import React, { useState, useEffect } from "react";
import FeedbackSection from "./FeedBack_Section.jsx";
import MyClass from "./MyMethods.js";
import feed from "./syntech-feed";
function Livefeed_Updates({ supplier, setupd, update }) {
    const port = 5552;
    //const [users, setUsers] = useState([]);

    const [products, setproducts] = useState([]);
    const [livefeed_products, setlivefeed_products] = useState([]);
    //const [searchfield, setsearchfield] = useState([]);
    const [loading, setLoading] = useState(false);
    const [Updates, setUpdates] = useState(false);

    //const [popUp, setpopUp] = useState(false);
    //const [prodCount, setProdCount] = useState(0);
    //const [lastUpdate, setLastUpdate] = useState("");
    //const [bulkedit, setbulkedit] = useState("");
    //const [prodOffset, setProdOffset] = useState(0);
    //const [editingUser, setEditingUser] = useState(null);
    //const [NoMatches, setNoMatches] = useState([]);
    const [updatedProds, setupdatedProds] = useState({
        newProducts: [],
        priceMismatched: [],
        qtyMismatched: [],
        deletedProducts: []
    });

    //const [qtyNoMatches, setqtyNoMatches] = useState([]);
    //const [Prodd, setProdd] = useState(null);
    //const [runUpdates, setrunUpdates] = useState(false);
    //const [updatesresults, setUpdatesresults] = useState(false);
    //const [NewProd, setNewProd] = useState([]);
    //const [prodVisibility, setProdVisibility] = useState(false);
    //const [swish, setswish] = useState(false);
    const [progress, setProgress] = useState(0);
    //const [prodVis, setProdVis] = useState(false);
    //const [fresh, rfresh] = useState(false);
    //const [markupprice, setmarkupprice] = useState([]);





    const fetchproducts = async () => {
        try {

            var livefeed_response = await fetch("http://localhost:5555/api/syntech-feed");
            const livefeed_data = await livefeed_response.json();
            setlivefeed_products(livefeed_data.products);


            //  console.log(JSON.stringify(supplier));

            const response = await fetch(`http://localhost:${port}/api/getproducts/bysuppliercode/${supplier.id}`);
            const data = await response.json();

            console.log(supplier);
            console.log(data);

            setproducts(data.data);
            // setupdates(!updates);
            if (!livefeed_response) {

                setlivefeed_products(feed.products);
            }
            //  console.log(data.data.length);
            //console.log(feed.products.length);
            //setproducts(data.data );



            console.log(checkUpdates(data.data, livefeed_data.products));
            //checkUpdates(data.data, feed.products);




        } catch (error) {
            console.error("Error fetching users:", error);

        }
    };



    const sendToMongo = async (products) => {
        const liveMap = new Map();

        console.log("Products count:", products?.length);

        // 1. Populate the Map with the added supplier field
        products.forEach(f => {
            liveMap.set(String(f.sku), { ...f, metadata: {SupplierName: supplier.name,data_format:supplier.data_format } });
        });


        // Inside Livefeed_Updates.jsx before calling fetch/axios
        const formattedData = products.map(item => ({
            ...item,
            // Convert metadata array [ {obj} ] to just {obj}
            metadata: { SupplierName: supplier.name, data_format: supplier.data_format },

            // Convert attributes object {brand: 'Intel'} to array [{key: 'brand', value: 'Intel'}]
            attributes: item.attributes && !Array.isArray(item.attributes)
                ? Object.entries(item.attributes).map(([key, value]) => ({ key, value }))
                : item.attributes
        }));

        // Now send 'formattedData' instead of 'products'
        console.log(formattedData);

        // 2. Convert that Map back into an Array so JSON can handle it
        const productsWithSupplier = Array.from(liveMap.values());

        console.log("Data to be sent:", productsWithSupplier);






        if (formattedData.length !== 0) {
            try {
                const response = await fetch(`http://localhost:5000/api/createproducts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    // 3. Send the UPDATED array, not the original 'products'
                    body: JSON.stringify({
                        productss: formattedData
                    })
                });

                const result = response.status;
                console.log("Server Response:", result);

            } catch (error) {
                console.error("Fetch error:", error);
            }
        }
    };
    const checkUpdates = (dbproducts,livefeedproducts) => {
        const results = {
            matched: [],
            qtyMismatched: [],
            priceMismatched: [],
            newProducts: [],
            deletedProducts: [] // Products in DB but NOT in Feed
        };

        setLoading(true);
        setProgress(0);

        // Simulate progress increments while fetching
        const interval = setInterval(() => {
            setProgress((prev) => (prev <= 75 ? prev + 10 : prev));
        }, 100);



        console.log(dbproducts);
        console.log(livefeedproducts);
        if (livefeedproducts) {
            console.error("Invalid product data", { livefeedproducts, dbproducts });


            if (dbproducts.length !==0) {

                console.log("What is happening?");

            } else {


                livefeedproducts.map(i => results.newProducts.push(i));
                console.log(results);
                setupdatedProds(results);





                const interval = setInterval(() => {
                    setProgress((prev) => (prev <= 100 ? prev + 10 : prev));
                }, 100);

                setupdatedProds(results)
               return
            }
        }


        console.log(Object.keys(livefeedproducts[0]).join(","));
      ///  console.log(Object.keys(dbproducts[0]).join(","));

        setLoading(true);
        setProgress(0);

        // 1. Create a Map of the Live Feed for O(1) lookup speed
        const liveMap = new Map();
        livefeedproducts.forEach(f => liveMap.set(String(f.sku), f));

        // 2. Create a Map of the Database for comparison
        const dbMap = new Map();
        dbproducts.forEach(p => dbMap.set(String(p.sku), p));

       

        // --- CHECK FOR UPDATES & NEW PRODUCTS ---
        livefeedproducts.forEach((feedProd) => {
            const sku = String(feedProd.sku);
            const dbProd = dbMap.get(sku);

            if (dbProd) {
                const feedPrice = parseFloat(feedProd.price) || 0;
                const dbPrice = parseFloat(dbProd.price) || 0;
                const feedQty = (parseInt(feedProd.jhbstock) || 0) +
                    (parseInt(feedProd.dbnstock) || 0) +
                    (parseInt(feedProd.cptstock) || 0);
                const dbQty = parseInt(dbProd.quantity) || 0;

                if (dbPrice !== feedPrice) {
                    results.priceMismatched.push({ feedProd, dbProd });
                    setUpdates(true);
                } else if (dbQty !== feedQty) {
                    results.qtyMismatched.push({ feedProd, dbProd, feedQty, dbQty });
                    setUpdates(true);
                }
            } else {
                results.newProducts.push(feedProd);
                setUpdates(true);
            }
        });

        // --- CHECK FOR DELETED PRODUCTS ---
        // Loop through DB products; if it's NOT in the live feed, it was removed.
        dbproducts.forEach((dbProd) => {
            if (!liveMap.has(String(dbProd.sku))) {
                results.deletedProducts.push(dbProd);
                setUpdates(true);

               
            }
        });


        clearInterval(interval);

        // 3. Update the UI

        if (results.newProducts.length + results.priceMismatched.length + results.qtyMismatched.length + results.deletedProducts.length > 0) {
            console.log("Prod Updated!");
            console.log(results.newProducts.length + results.priceMismatched.length + results.qtyMismatched.length + results.deletedProducts.length);
        }
        else {
            console.log(results.newProducts.length + results.priceMismatched.length + results.qtyMismatched.length + results.deletedProducts.length," Updates due!");

        }
            setupdatedProds(results);

        setLoading(false);
        setProgress(0);

        console.log(results);

        return results;
    };






   







    const syncDb = async (x) => {




        try {

            const response = await MyClass.deleteProducts(ExtractArrayOfObjectsLists(x), supplier.code);

            //var prod = JSON.stringify( x ) ;

            console.log(response);

        }
        catch (err) {

            console.log(`${err} - Something Bad Happened at : api/bulk-delete`);

        }
        finally {
            setLoading(false); // hide spinner

            console.log("&&&");


        }



    };
    const insertintoDb = async (x) => {


        setLoading(true); // show spinner
        console.log(livefeed_products);
        try {

            const response = await fetch(`http://localhost:${port}/api/syntech/bulk-insert`, {
                method: "POST", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({ rows: x, supplier: supplier }),
            });

            //var prod = JSON.stringify( x ) ;

            console.log(response);

        }
        catch (err) {

            console.log(`${err} - Something Bad Happened at : api/bulk-insert`);

        }
        finally {
            setLoading(false); // hide spinner

            console.log("%%%%");
            console.log(x);
            console.log("%%%%");
        }



    };

    const UpdateDb = async (x) => {



        try {

            const response = await fetch(`http://localhost:${port}/api/syntech/bulk-update`, {
                method: "PUT", // or "PATCH" if partial updates
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows: x }),
            });

            var prod = JSON.stringify({ rows: x });

            console.log(prod);
            console.log("^^^^^");
            console.log(response);

        }
        catch (err) {

            console.log(`${err} - Something Bad Happened array:${x}`);

        }
        finally {
            setLoading(false); // hide spinner
            console.log(`Updated ${JSON.stringify(x)}`);
        }



    };
    const UpdateDbQty = async (x) => {



        try {

            const response = await fetch(`http://localhost:${port}/api/syntech/bulk-update-qty`, {
                method: "PUT", // or "PATCH" if partial updates
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows: x }),
            });

            var prod = JSON.stringify({ rows: x });

            console.log(prod);
            console.log("^^^^^");
            console.log(response);

        }
        catch (err) {

            console.log(`${err} - Something Bad Happened array:${x}`);

        }
        finally {
            setLoading(false); // hide spinner
            console.log(`Updated ${JSON.stringify(x)}`);
        }



    };








    const ExtractArrayOfObjectsLists = (updated) => {

        var t = [];

        var x = updated.length - 1;
        try {
            for (let i = 0; i <= x; i++) {
                var obj = updated[i];
                if (obj != null) {

                    t.push(obj);
                }
            }

            return t;
        }
        catch (err) {
            console.log(err);
        }
    }

    const ExtractArrayOfObjects = (updated) => {

        var t = [];

        var x = updated.length - 1;
        try {
            for (let i = 0; i <= x; i++) {
                var obj = updated[i].feedProd;
                if (obj != null) {

                    t.push(obj);
                }
            }

            return t;
        }
        catch (err) {


            console.log(`${err} - Something Bad Happened while extracting array of objects`);

            for (let i = 0; i <= x; i++) {

                var objj = updated[i];
                if (obj != null) {

                    t.push(objj);
                }

                if (i == x) {

                    console.log(objj);
                    console.log("WE ARE HERE " + x);
                }
            }

            return t;

        }
        finally {



            console.log("shap " + t.length);

        }
    }
    const ExecuteUpdates = () => {
        // setrunUpdates(false);


        console.log("Queued for updates: ",updatedProds);
        if (updatedProds.newProducts.length > 0) {

        RunUpdates(updatedProds.newProducts, "insert");
        }

        if(updatedProds.priceMismatched.length > 0) {
            RunUpdates(updatedProds.priceMismatched, "update");
        }
        if(updatedProds.qtyMismatched.length > 0) {
            RunUpdates(updatedProds.qtyMismatched, "");
        }
        if(updatedProds.qtyMismatched.length > 0) {
            RunUpdates(updatedProds.qtyMismatched, "");
        }
        if(updatedProds.deletedProducts.length > 0) {
            RunUpdates(updatedProds.deletedProducts, "delete");
        }
        if(updatedProds.deletedProducts.length > 0) {
            RunUpdates(updatedProds.deletedProducts, "delete");
        }



    }
    const RunUpdates = (updated, updateType) => {


        setLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => (prev < 70 ? prev + 3 : prev));
        }, 200);
        if (updateType == "update") {


            //console.log("Prep'd Data to  be UPDATED 1: " + JSON.stringify(ExtractArrayOfObjects(updated)));
            UpdateDb(ExtractArrayOfObjects(updated));




        }
        else if (updateType == "delete") {

            //console.log("Prep'd Data to be DELETED: " + JSON.stringify(ExtractArrayOfObjectsLists(updated)));
            syncDb(updated);
            //console.log("********");
            //console.log("DATA TO BE DELETEEEEED");

            //console.log(JSON.stringify(ExtractArrayOfObjectsLists(updated)));
            ////console.log(updatesresults.deletedProducts);
            //console.log("********");






        }
        else if (updateType == "insert") {

            //  console.log("Prep'd Data to be INSERTED: ");
            //   console.log(updated);

            //console.log(ExtractArrayOfObjectsLists(updated));
            insertintoDb(updated);





        }
        else {
            
            console.log((ExtractArrayOfObjects(updated)));
            UpdateDbQty(ExtractArrayOfObjects(updated));

        }






        setTimeout(() => {
            clearInterval(interval)
            setLoading(false);
            setProgress(100); // reset after short delay
        }, 3000);





    }





  return (

      <div>

          
          {loading && (<>

              <h1 style={{ color: "#0c086b" }} onClick={() => searchTerm("")} disabled={loading}>
                  {loading ? "Fetching Live Feed Products..." : ""}
              </h1>
              <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }}>{progress}%</div>
              </div></>
          )}

          


          
          <br />
          

{/*          <ul>*/}
{/*              {Array.isArray(products) ? products.map((p, idx) =>*/}
{/*    p && (p.id || p.sku)*/}
{/*        ? <li key={p.id ?? p.sku}> {p.sku} - {p.name} </li>*/}
{/*        : <li key={`invalid-${idx}`}> Invalid Product Data </li>*/}
{/*) : <li>No products</li>}*/}
{/*          </ul>*/}

         
          {supplier.data_format === "Live Feed" &&

              <div id="updates" style={{ marginLeft: "0px", marginBottom: "0px" }}                        >
     

              








                         
              







                  <div className="container mt-1">




                      <div className="d-flex justify-content-between align-items-center mb-4">
                          <h2>Product Sync Dashboard</h2>
                          <button
                              className={`btn btn-${loading ? 'secondary' : 'primary'} btn-lg`}
                              onClick={fetchproducts}
                              disabled={loading}
                          >
                              {loading ? (
                                  <span className="spinner-border spinner-border-sm mr-2"></span>
                              ) : null}
                              Sync Live Feed
                          </button>
                      </div>

                      {loading && (
                          <div className="progress mb-4" style={{ height: "20px" }}>
                              <div className="progress-bar progress-bar-striped progress-bar-animated"
                                  style={{ width: `${progress}%` }}>
                                  {progress}%
                              </div>
                          </div>
                      )}


                      {updatedProds ? (
                          <div className="row">
                              <div className="col-md-6">
                                  {/* Price Changes - High Priority */}
                                  <FeedbackSection
                                      title="PRICE UPDATES"
                                      variant="danger"
                                      count={updatedProds.priceMismatched.length || 0}
                                      items={updatedProds.priceMismatched}
                                      renderItem={(m) => (
                                          <div className="d-flex justify-content-between align-items-center">
                                              <strong>{m.feedProd.sku}</strong>
                                              <span>
                                                  <del className="text-muted mr-2">${m.dbProd.price}</del>
                                                  <span className="badge badge-danger">${m.feedProd.price}</span>
                                              </span>
                                          </div>
                                      )}
                                  />
                              </div>

                              <div className="col-md-6">
                                  {/* New Products */}
                                  <FeedbackSection
                                      title="NEW PRODUCTS"
                                      variant="success"
                                      count={updatedProds.newProducts.length}
                                      items={updatedProds.newProducts}
                                      renderItem={(prod) => (
                                          <div>
                                              <strong>{prod.sku}</strong> - <small>{prod.name}</small>
                                          </div>
                                      )}
                                  />
                              </div>

                              <div className="col-md-6">
                                  {/* Quantity Changes */}
                                  <FeedbackSection
                                      title="QUANTITY UPDATES"
                                      variant="warning"
                                      count={updatedProds.qtyMismatched.length}
                                      items={updatedProds.qtyMismatched}
                                      renderItem={(m) => (
                                          <div className="d-flex justify-content-between">
                                              <span>{m.feedProd.sku}</span>
                                              <span>DB: {m.dbQty} → Feed: <strong>{m.feedQty}</strong></span>
                                          </div>
                                      )}
                                  />
                              </div>

                              <div className="col-md-6">
                                  {/* Deleted Products */}
                                  <FeedbackSection
                                      title="REMOVED FROM FEED"
                                      variant="secondary"
                                      count={updatedProds.deletedProducts.length}
                                      items={updatedProds.deletedProducts}
                                      renderItem={(prod) => (
                                          <span className="text-strike">{prod.sku} - {prod.name}</span>
                                      )}
                                  />
                              </div>
                          </div>    
                      ) : (
                          <div className="alert alert-info mt-3">
                              Click "Sync Feed" to check for product updates.
                              </div>
                      )}
                  </div>
                  <div style={{display:"flex",justifyContent:"right", width:"95%"}}>
                          <button onClick={ExecuteUpdates}>sync</button>
                      <button onClick={() => {sendToMongo(livefeed_products ? livefeed_products :products)}}>Mongo</button>
                  </div>




              </div>
          }
          


          
         

          
          
          
         

      </div>


  );
}

export default Livefeed_Updates;