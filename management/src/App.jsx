import React, { useState, useEffect } from "react";

import { CSSTransition } from 'react-transition-group';
import './UsersStyle.css'
import ProdPop from './MyForm - Copy.jsx'
import lastJson from './feedhandler.json'
import MyClass from "./MyMethods";



const ProductsTable = ({ products }) => {
    const port = 5552;
    const [users, setUsers] = useState([]);

    const [searchproducts, setsearchproducts] = useState([]);
    const [searchfield, setsearchfield] = useState([]);
    const [loading, setLoading] = useState(false);
    const [preciseSearch, setpreciseSearch] = useState(false);
    const [Updates, setUpdates] = useState(false);

    const [popUp, setpopUp] = useState(false);
    const [prodCount, setProdCount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState("");
    const [bulkedit, setbulkedit] = useState("");
    const [prodOffset, setProdOffset] = useState(0);
    const [editingUser, setEditingUser] = useState(null);
    const [NoMatches, setNoMatches] = useState([]);
    const [updatedProds, setupdatedProds] = useState([]);

    const [qtyNoMatches, setqtyNoMatches] = useState([]);
    const [Prodd, setProdd] = useState(null);
    const [runUpdates, setrunUpdates] = useState(false);
    const [updatesresults, setUpdatesresults] = useState(false);
    const [NewProd, setNewProd] = useState([]);
    const [prodVisibility, setProdVisibility] = useState(false);
    //const [swish, setswish] = useState(false);
    const [progress, setProgress] = useState(0);
    const [prodVis, setProdVis] = useState(false);
    const [refresh, setrefresh] = useState(false);
    const [markupprice, setmarkupprice] = useState([]);




    // Fetch product count
    useEffect(() => {
        const fetchProductCount = async () => {
            try {
                const response = await fetch(`http://localhost:${port}/getproductcount`);
                const data = await response.json();
                const total = data.data.rows[0].total;
                setProdCount(total);
            } catch (error) {
                console.error("Error fetching product count:", error);
            }
        };
        fetchProductCount();
    }, [prodOffset]);

    // Fetch last update
    useEffect(() => {
        const fetchLastUpdate = async () => {
            try {
                const response = await fetch(`http://localhost:${port}/lastupdate`);
                const data = await response.json();
                const updatedOn = data.data[0].updated_on;
                const d = new Date(updatedOn);
                setLastUpdate(d.toLocaleString());
            } catch (error) {
                console.error("Error fetching last update:", error);
            }
        };
        fetchLastUpdate();
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUsers([])
                const response = await fetch(`http://localhost:${port}/allproducts`);
                const data = await response.json();
                setUsers(data.data);
                console.log("Fetched!")
            } catch (error) {
                console.error("Error fetching users:", error);

            }
        };
        fetchUsers();

    }, [refresh, searchproducts]);


    useEffect(() => {
        if (updatedProds) {
            renderFeedback(updatedProds);
        }
    }, [updatedProds]); // This runs AFTER the DOM has updated with the new state





    const checkUpdates = () => {


        console.log(users);
        console.log(products);
        if (!Array.isArray(users) || !Array.isArray(products)) {
            console.error("Invalid product data", { users, products });
            return "Invalid product data";
        }
        setLoading(true);
        setProgress(0);

        // 1. Create a Map of the Live Feed for O(1) lookup speed
        const liveMap = new Map();
        products.forEach(f => liveMap.set(String(f.sku), f));

        // 2. Create a Map of the Database for comparison
        const dbMap = new Map();
        users.forEach(p => dbMap.set(String(p.sku), p));

        const results = {
            matched: [],
            qtyMismatched: [],
            priceMismatched: [],
            newProducts: [],
            deletedProducts: [] // Products in DB but NOT in Feed
        };

        // --- CHECK FOR UPDATES & NEW PRODUCTS ---
        products.forEach((feedProd) => {
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
        users.forEach((dbProd) => {
            if (!liveMap.has(String(dbProd.sku))) {
                results.deletedProducts.push(dbProd);
                    setUpdates(true);
            }
        });

        // 3. Update the UI

        if (results.newProducts.length + results.priceMismatched.length + results.qtyMismatched.length + results.deletedProducts.length > 0 ) {
            console.log("what are you doing bro???");
        setupdatedProds(results);
        }

        setLoading(false);


        return results;
    };

    const renderFeedback = (results) => {
        const newDiv = document.getElementById("new_products");
        const newDivfeedback = document.getElementById("new_products_feedback");



        const qtyDiv = document.getElementById("unmatched_quantites");
        const qtyDivfeedback = document.getElementById("unmatched_quantites_feedback");

        const priceDiv = document.getElementById("unmatched_prices");
        const priceDivfeedback = document.getElementById("unmatched_prices_feedback");

        const deletedDiv = document.getElementById("deleted_products");
        const deletedDivfeedback = document.getElementById("    ");


        // 1. Handle Mismatched Quantities
        if (qtyDiv) {
            let qtyHTML = results.qtyMismatched.length ? "" : "<h5>Quantities: UP TO DATE</h5>";
            results.qtyMismatched.forEach(m => {
                qtyHTML += `${m.feedProd.sku}<br/>
                       ${m.dbQty} - Database Quantity <br/>${m.feedQty} - Feed Quantity<br/> <br/>`;
            });
            qtyDiv.innerHTML = qtyHTML + "";
            qtyDivfeedback.innerHTML = results.qtyMismatched.length + " QUANTITIES UPDATED!";
            
        }
        

        // 2. Handle Mismatched Prices (This was the missing part!) <div className='alert alert - success' role='alert'> </div>
        if (priceDiv) {
            let priceHTML = results.priceMismatched.length ? "" : "<h5>NO PRICE CHANGES</h5>";
            results.priceMismatched.forEach(m => {
                priceHTML += `<h5>${m.feedProd.sku}</h5>
                          <div class='db_info_'>DB Price: ${m.dbProd.price} | Feed Price: ${m.feedProd.price}</div><br/>`;



            });
            priceDiv.innerHTML = priceHTML;
            console.log("HTML: "+priceHTML);
            priceDivfeedback.innerHTML = results.priceMismatched.length + " PRICE UPDATES FOUND!";
        }
        //console.log(results.priceMismatched[0].feedProd);  

        // 3. Handle New Products
        if (newDiv) {
            let newHTML = results.newProducts.length ? "" : "<h5>NO NEW PRODUCTS</h5>";
            results.newProducts.forEach(prod => {
                newHTML += `
                            <h5>${prod.sku}</h5><br/><div class='db_info_'>
                            ${prod.name || 'New Product'} - Price: ${prod.price}
                        </div><br/>`;
            });
            newDiv.innerHTML = newHTML;
            newDivfeedback.innerHTML =  results.newProducts.length+ " NEW PRODUCTS FOUND!";
        }

        // 4. Handle Deleted Products
        if (deletedDiv) {
            let deletedHTML = results.deletedProducts.length ? "" : "NO REMOVED PRODUCTS";
            results.deletedProducts.forEach(prod => {
                deletedHTML += `
                                <h5>${prod.sku}</h5><div class='db_info_'>
                                ${prod.name || 'Unknown Name'} is no longer in the live feed.
                            </div><br/>`;
            });
            deletedDiv.innerHTML = deletedHTML;
            deletedDivfeedback.innerHTML = results.deletedProducts.length+ "  PRODUCTS DELETED!";
        }










    };



    const Paginate = (action) => {
        if (action === "next") {
            setProdOffset(i => i + 10);
        } else if (action === "prev" && prodOffset > 0) {
            setProdOffset(i => i - 10);
        }
    };

    const ClosePopup = (u) => {

        setpopUp(true);

        setProdd(u)

    }
    const ShowDbProducts = () => {




        setProdVis(!prodVis)




    }






    const EditProduct = (product) => {

        


    }
    const BulkEdit = () => {

        var margin = document.getElementById("bulk_edit_markUp_text");
        var crys_marg = document.querySelectorAll(".crystal_markup");


        var te = document.getElementById("bulk_edit_text");
        var iput = document.querySelectorAll(".delivery_cost");

        if (margin.value != "") {
            crys_marg.forEach(i => {
                i.innerHTML = margin.value;
            });
        }






        if (te.value != "") {
            iput.forEach(i => {
                i.innerHTML = te.value;
            });
        }
        var markups = {
            sku: [],
            priceWithMarkup: []

        };

        console.log("inside app, testing!!");

        try {
            users.forEach((u, index) => {


                //console.log(u.price_after_mark_up +" - "+ u.sku);

                if (index < 500) {



                    var markup;

                    if (margin.value != "") {

                        markup = Number(margin.value) / 100;
                    }
                    else {
                        markup = Number(u.mark_up) / 100;

                    }
                    var vat = Number(u.vat) / 100;
                    console.log("*********")
                    var delivery_cost = Number(te.value);

                    var costs = (u.price + delivery_cost)
                    var crystal = costs * (1 + markup) * (1 + vat);
                    console.log("Crystal Comm Price: " + crystal);

                    var pricce = Number(u.price);
                    var tot_cost = pricce + delivery_cost;


                    u.delivery_cost = delivery_cost;

                    var percentagess = (Number(1 + markup) * Number(1 + vat));


                    var newP = tot_cost * percentagess;


                    console.log("Crystal: " + newP);
                    console.log("tot_cost: " + tot_cost);
                    console.log("margin: " + margin.value);

                    Number(u.price) + Number(delivery_cost) * Number(1 + Number(markup)) * Number(1 + Number(vat))
                    console.log("Delivery: " + delivery_cost);
                    console.log("Price: " + u.price);
                    console.log("VAT: " + Number(vat + 1));
                    console.log("mark_up: " + u.mark_up);

                    var tot = newP.toFixed(2);

                    markups.priceWithMarkup.push(tot);
                    markups.sku.push(u.sku);
                    u.price_after_mark_up = tot;
                    console.log(newP.toFixed(2));
                    return console.log("WE ARE HERE " + index + " SKU:" + u.sku + " - Price+MarkUp :" + crystal + " - Price: " + u.price);
                }

            })

            setmarkupprice(markups);
            console.log(markupprice);


        } catch {

            console.log(te.value);
        }

    }

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
        setrunUpdates(false);


       
        RunUpdates(updatedProds.newProducts, "insert");
        RunUpdates(updatedProds.priceMismatched, "update");
        RunUpdates(updatedProds.qtyMismatched, "update");
        RunUpdates(updatedProds.deletedProducts, "delete");

      

    }
    const RunUpdates = (updated, updateType) => {


        setLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => (prev < 70 ? prev + 3 : prev));
        }, 200);
        if (updateType == "update") {


            console.log("Prep'd Data to  be UPDATED 1: " + JSON.stringify(ExtractArrayOfObjects(updated)));
            UpdateDb(ExtractArrayOfObjects(updated));




        }
        else if (updateType == "delete") {

            console.log("Prep'd Data to be DELETED: " + JSON.stringify(ExtractArrayOfObjectsLists(updated)));
            syncDb(updated);
            console.log("********");
            console.log("DATA TO BE DELETEEEEED");

            console.log(JSON.stringify(ExtractArrayOfObjectsLists(updated)));
            console.log(updatesresults.deletedProducts);
            console.log("********");






        }
        else if (updateType == "insert") {

            console.log("Prep'd Data to be INSERTED: ");
            console.log();
            insertintoDb(ExtractArrayOfObjectsLists(updated));




        }




        setTimeout(() => {
            clearInterval(interval)
            setLoading(false);
            setProgress(100); // reset after short delay
        }, 3000);





    }



    const CalculatePrice = () => {

        var iput = document.querySelectorAll(".alldelivery");
        var te = document.getElementById("delivery_text");
        if (te.length < 1) {
            setbulkedit("")
        }
        else {

            setbulkedit(te)



        }

        iput.forEach(i => {
            i.innerHTML = te.value;
        });


    }




    const UpdateDb = async (x) => {



        try {

            const response = await fetch(`http://localhost:${port}/api/syntech/bulk-update`, {
                method: "POST", // or "PATCH" if partial updates
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


    const Progres = () => {


        progressBarAnimationStart()
        progressBarAnimationEnd()

    }

    const progressBarAnimationStart = () => {
        setLoading(true);
        setProgress(0);
        ;


    }
    const progressBarAnimationEnd = () => {



        // Simulate progress increments while fetching
        const interval = setInterval(() => {
            setProgress((prev) => (prev <= 75 ? prev + 10 : prev));
        }, 900)


        clearInterval(interval);
        setLoading(false);
        setProgress(100); // reset after short delay;


    }


    const syncDb = async (x) => {




        try {

            const response = await fetch(`http://localhost:${port}/api/bulk-delete`, {
                method: "DELETE", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({ rows: x }),
            });

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

        try {

            const response = await fetch(`http://localhost:${port}/api/syntech/bulk-insert`, {
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

            console.log(`${err} - Something Bad Happened at : api/bulk-insert`);

        }
        finally {
            setLoading(false); // hide spinner

            console.log("%%%%");
            console.log(x);
            console.log("%%%%");
        }



    };




    const search = () => {
        var t = document.getElementById("search_").value;
        var tt = document.getElementById("search_dd").value;

        setsearchfield(t)



        if (t != "" && t.length >= 1) {

            console.log(tt);
            searchDb(t, tt);
        }
        else {
            searchDb(null, tt);
            console.log(tt + " - " + t);
        }

    }

    const searchDb = async (xx, by) => {
        try {
            setLoading(true); // show spinner

            setProgress(0);


            
            

                if (preciseSearch) {

                   const response = await MyClass.getpreciseproduct(xx, by);
                    console.log(preciseSearch);
                    
                    console.log( response);
                    setsearchproducts(response);
                }
                else {
                    const response = await MyClass.getproduct(xx,by); 
                    console.log(preciseSearch);
                    console.log( response);
                    setsearchproducts(response);
                }

            
            const interval = setInterval(() => {
                setProgress((prev) => (prev < 100 ? prev + 10 : prev));
            }, 1000);
            
            //clearInterval(interval);
        } catch (err) {
            console.error("Error fetching products:", err);
            setTimeout(() => {
                setLoading(false);
                setProgress(0); // reset after short delay
            }, 1000);

            // must add error message and feedback


        } finally {
            setTimeout(() => {
                setLoading(false);
                setProgress(100); // reset after short delay
            }, 1000); // hide spinner
        }
    };



    const editProduct = (prod) => {
        setEditingUser(prod);
        setProdd(prod);
        console.log(prod);
        setpopUp(true);
    }
    const showProducts = () => {

        if (!Updates) {

            setUpdates(true)
        }
        else {

            setUpdates(false)
        }

    }

    const createInsertStatement = async (editedproducts) => {

        var line = "";
        const itemMap = new Map();


        editedproducts.forEach(item => {

            line += `delivery_cost = ${item.delivery_cost},mark_up = ${item.mark_up},price_after_mark_up = ${item.price_after_mark_up}`;
            itemMap.set(item.sku, { delivery_cost: item.delivery_cost, mark_up: item.mark_up, price_after_mark_up: item.price_after_mark_up });
        }
        
        )

        

        var count = 0;
        itemMap.forEach((value, key) => {
            count++;
        var sku = "";
            sku= JSON.stringify(key);
            saveChanges(value);
            console.log(count+") "+ sku + " :"+JSON.stringify(value));
            return "";
        })

    }
    const transact = async () => {

        try {


            var query = `insert into product(sku,name)
values('EXAMPLE123','I AM TESTING TRANSACTIONS'),`

            var query1 =  `UPDATE product
set name = 'WAITING FOR ROLLBACK';`;

            const response = await fetch(`http://localhost:${port}/api/purchase`, {
                method: "POST", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({ query, query1 }),
            });

            //var prod = JSON.stringify( x ) ;

            console.log(`TRANSACT in fetch: ${response}`);


        }
        catch (err) {

            console.log(`TRANSACT: ${err}`);

        }



    }
    const saveChanges = async (editedproduct) => {

            
        try {




            const response = await fetch(`http://localhost:${port}/updateproducts/${editedproduct.sku}`, {
                method: "POST", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({ rows: editedproduct }),
            });

            //var prod = JSON.stringify( x ) ;

            console.log(response);
          

        }
        catch (err) {

            console.log(``);

        }

        
    }


            

        

        //const [produc, setproduc] = useState([]);
        // Filter products based on search term 



        return (
            <div className="Products_List">
                {/*<Pop product={produc} />*/}

                <p id="unmatched_products"></p>
                <div id="Top"></div>
              

                {loading && (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}>{progress}%</div>
                    </div>
                )}
                <br />
                <div style={{ display:"flex",justifyContent:"center"}} >
                <button style={{ marginTop: "10px", marginLeft: "0px", marginBottom: "10px", padding: "5px", width: "250px" }} onClick={() => setProdVisibility(!prodVisibility)()}>
                    View Database Products
                </button>
                </div>

                <br />
                        { /*/  SEARCH TABLE  

                <button onClick={() => Progres()}>
                    PLAY PROGRESS ANIMATION
                </button>
                            
                        */}

                {prodVisibility && (
                    <div>


                <div style={{ display:"flex",justifyContent:"center"}} >
                <button style={{ marginTop: "10px", marginLeft: "00px", marginBottom: "10px", padding: "5px", width: "250px" }} onClick={() => showProducts()}>
                    SHOW ALERTS
                </button>
                </div>


                        <br />






                       
                        { /*/  SEARCH TABLE   */}
                        { /*/  SEARCH TABLE   */}
                        { /*/  SEARCH TABLE   */}
                        { /*/  SEARCH TABLE   */}
                        { /*/  SEARCH TABLE   */}
                       

                        



                            { Updates && (

                            <div id="updatess" style={{ marginLeft: "0px", marginBottom: "0px" }}                        >

                                <div style={{
                                    display: "flex", justifyContent: "center" 
 }}                        >
                                <button style={{ marginLeft: "00px" }} onClick={() => checkUpdates()}>CHECK FOR UPDATES</button>
                                </div>

                            
                                {/*<div class="accordion-item">*/}
                                {/*    <h2 class="accordion-header" id="headingFive">*/}
                                {/*        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="true" aria-controls="collapseFive">*/}

                                {/*            <div class="alert alert-success" role="alert">*/}
                                {/*                <div style={{ display: "flex", justifyContent: "center", width:"auto" }} >*/}
                                {/*                VIEW ALL UPDATES / CHANGES*/}

                                {/*            </div>*/}
                                {/*            </div>*/}


                                {/*        </button>*/}
                                {/*    </h2>*/}
                                    

                                
                                {/*    <div id="collapseFive" class="accordion-collapse collapse " aria-labelledby="headingFive" data-bs-parent="#accordionExample">*/}
                                {/*        <div class="accordion-body">*/}







                                {/*<div class="accordion" id="accordionExample">*/}
                                {/*    { /*NEW PRODUCTS ACCORDION FEEDBACK*/}
                                {/*    { /*NEW PRODUCTS ACCORDION FEEDBACK*/}

                                {/*    <div class="accordion-item">*/}
                                {/*        <h2 class="accordion-header" id="headingOne">*/}
                                {/*            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">*/}

                                {/*                            <div class="alert alert-success" role="alert">*/}

                                {/*                                <div style={{ display: "flex", justifyContent: "center" }} >       */}
                                {/*                        <h1 style={{ marginLeft: "0px", marginBottom: "30px" }} id="new_products_feedback"></h1>*/}
                                                
                                                
                                {/*                </div>*/}
                                {/*                </div>*/}
                                                    
                                                
                                {/*            </button>*/}
                                {/*        </h2>*/}
                                {/*        <div id="collapseOne" class="accordion-collapse collapse " aria-labelledby="headingOne" data-bs-parent="#accordionExample">*/}
                                {/*            <div class="accordion-body">*/}


                                                
                                {/*                    <div class="alert alert-success" role="alert">*/}

                                {/*                        <h6 style={{ marginLeft: "0px", marginBottom: "30px" }} id="new_products"></h6>*/}
                                {/*                    </div>*/}


                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}


                                {/*    { /*UPDATED PRICEES ACCORDION FEEDBACK*/}
                                {/*    { /*NEW PRODUCTS ACCORDION FEEDBACK*/}

                                {/*    <div class="accordion-item">*/}
                                {/*        <h2 class="accordion-header" id="headingTwo">*/}
                                {/*            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">*/}
                                                
                                {/*                            <div class="alert alert-danger" role="alert">*/}

                                {/*                                <div style={{ display: "flex", justifyContent: "center" }} >*/}
                                {/*                    <h1 style={{ marginLeft: "0px", marginBottom: "30px" }} id="unmatched_prices_feedback"></h1>*/}

                                {/*                </div>*/}
                                {/*                </div>*/}

                                {/*            </button>*/}
                                {/*        </h2>*/}
                                {/*        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">*/}
                                {/*            <div class="accordion-body">*/}


                                {/*                            <div class="alert alert-danger" role="alert">*/}

                                                                
                                {/*                    <h6 style={{ marginLeft: "0px", marginBottom: "30px" }} id="unmatched_prices"> </h6>*/}

                                {/*                </div>*/}
                                                

                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}


                                {/*    <div class="accordion-item">*/}
                                {/*        <h2 class="accordion-header" id="headingThree">*/}
                                {/*            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">*/}
                                {/*                < div class="alert alert-warning" role="alert">*/}
                                {/*                                <div style={{ display: "flex", justifyContent: "center" }} >*/}
                                {/*                    <h1 style={{ marginLeft: "0px", marginBottom: "30px" }} id="unmatched_quantites_feedback"></h1>*/}
                                {/*                </div>*/}
                                {/*                </div>*/}
                                {/*            </button>*/}
                                {/*        </h2>*/}
                                {/*        <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">*/}
                                {/*            <div class="accordion-body">*/}

                                {/*                < div class="alert alert-warning" role="alert">*/}
                                {/*                    <h6 style={{ marginLeft: "0px", marginBottom: "30px" }} id="unmatched_quantites"></h6>*/}
                                {/*                </div>*/}



                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*    <div class="accordion-item">*/}
                                {/*        <h2 class="accordion-header" id="headingFour">*/}
                                {/*            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">*/}

                                {/*                < div class="alert alert-danger" role="alert">*/}
                                {/*                                <div style={{ display: "flex", justifyContent: "center" }} >*/}
                                {/*                    <h1 style={{ marginLeft: "0px", marginBottom: "30px" }} id="deleted_products_feedback"></h1>*/}
                                {/*                </div>*/}
                                {/*                </div>*/}
                                {/*            </button>*/}
                                {/*        </h2>*/}
                                {/*        <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">*/}
                                {/*            <div class="accordion-body">*/}

                                {/*                < div class="alert alert-danger" role="alert">*/}
                                {/*                    <h6 style={{ marginLeft: "0px", marginBottom: "30px" }} id="deleted_products"></h6>*/}
                                {/*                </div>*/}



                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*    </div>*/}




                                    





                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*</div>*/}





                                {<div style={{ display: "flex", justifyContent: "center" }}>

                                    < button onClick={() => ExecuteUpdates()}>RUN UPDATES</button>
                                    < button onClick={() => transact()}>RUN TRANSACTION</button>
                                </div>}


                        </div>
                        )}
                        

                        <div class="search_area" style={{ margin: "30px 0px 30px 0px", width: "99%" }}>
                            <div style={{ marginTop: "10px", marginLeft: "50px", marginBottom: "10px", padding: "5px" }}>
                                <input id="showDBproduct_cb" style={{ marginTop: "10px", marginRight: "10px", marginBottom: "10px", padding: "5px" }} type="checkbox" onChange={() => setpreciseSearch(!preciseSearch)} />
                                Precise Search (Search Database Products for Exact Matches)
                            </div>
                            <span style={{ marginTop: "50px", marginLeft: "60px" }}>SEARCH:</span>
                            <input type="text" id="search_" onChange={() => search()} placeholder="Search products..."
                                style={{ marginTop: "10px", marginBottom: "10px", marginRight: "20px", padding: "5px", width: "250px" }}
                            />


                            <span style={{ marginTop: "50px", marginLeft: "60px" }}>SEARCH BY:</span>



                            <select id="search_dd" style={{ marginTop: "10px", marginLeft: "5px", marginBottom: "10px", padding: "5px", width: "250px" }}>
                                <option>Name</option>
                                <option>SKU</option>
                            </select>


                            <div style={{ marginTop: "10px", marginLeft: "50px", marginBottom: "10px", padding: "5px" }}>
                                <input id="showDBproduct_cb" style={{ marginTop: "10px", marginRight: "10px", marginBottom: "10px", padding: "5px" }} type="checkbox" onChange={() => ShowDbProducts()} />
                                Check to Show Database Products
                            </div>
                        </div>


                        <button onClick={() => setrefresh(!refresh)}></button>
                        {(searchproducts.length > 0 && prodVis !== true) && (< div style={{
                            width: "100%",
                            marginLeft:"0px"
                        }} >



                            <h1>Showing Database results of "{searchfield}"</h1>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <td>Name</td>
                                        <td>SKU</td>
                                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>Price</td>
                                        <td>Vendor</td>
                                        <td>Delivery</td>
                                        <td>Category</td>
                                        <td>Quantity</td>
                                        <td>Rec. Margin</td>
                                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>Updated:</td>
                                        <td></td>

                                    </tr>
                                </thead>
                                <tbody>
                                    {searchproducts.map((row) => (
                                        <tr key={row.id}>
                                            {searchproducts && <>

                                                <td>{row.name}</td>
                                                <td>{row.sku}</td>
                                                <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>R{row.price}</td>
                                                <td>{row.vendor}</td>
                                                <td >{row.bank_cost}</td>
                                                <td>{row.category}</td>
                                                <td>{row.quantity}</td>
                                                <td>{row.mark_up}%</td>
                                                <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>{
                                                    row.updated_on}</td>
                                                <td><button onClick={() => editProduct(row)}>Edit</button></td>
                                            </>
                                            }

                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div >
                        )
                        }



                        {prodVis && <div>
                            <div style={{ display: "flex", justifyContent:"center" }}>

                            <h1>Database Products </h1>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", margin:"0px 00px 30px 0px" ,width:"100%" }}>

                            <button onClick={() => createInsertStatement(users)}>Save Changes</button>
                            </div>


                            <div class="wrapper">





                                <div>
                                    <table className="table table-striped">
                                        <thead style={{ backgroundColor: "white", color: "black", fontWeight: "bold", border:"1px  solid #0c086b" }}>
                                            <tr>

                                                <td></td>
                                                <td>Name</td>
                                                <td>SKU</td>
                                                <td style={{ backgroundColor: "white", color: "black", fontWeight: "bold" }}>Price</td>
                                                <td style={{ backgroundColor: "white", color: "black", fontWeight: "bold" }}>Price+Mark_Up</td>
                                                <td>Vendor</td>
                                                <td><input type="text" id="bulk_edit_text" placeholder="Bulk edit"  ></input><button onClick={() => BulkEdit()}>Preview</button><br/>Delivery</td>
                                                <td>Category</td>
                                                <td>Quantity</td>
                                                <td><input type="text" id="bulk_edit_markUp_text" placeholder="Bulk edit"  ></input><button onClick={() => BulkEdit()}>Preview</button><br />  Rec. Margin</td>
                                                <td style={{ backgroundColor: "white", color: "black", fontWeight: "bold" }}>Updated:</td>
                                                <td></td>

                                            </tr>
                                        </thead>

                                        <tbody>
                                            {users.map((row, index) => (
                                                <tr key={row.id}>
                                                    {searchproducts && <>
                                                        <td>{index + 1})</td>
                                                        <td>{row.name}</td>
                                                        <td>{row.sku}</td>
                                                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold", }}>R{row.price}</td>
                                                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>R{row.price_after_mark_up}</td>
                                                        <td>{row.vendor}</td>
                                                        <td className="delivery_cost" style={{ backgroundColor: "#0c086b", color: "white", fontWeight: "bold" }}>{row.bank_cost}</td>
                                                        <td>{row.category}</td>
                                                        {row.quantity === 0 && <>
                                                            <td className="table-danger">{row.quantity}</td>
                                                        </>
                                                        }
                                                        {row.quantity >= 1 && row.quantity < 5 && <>
                                                            <td className="table-warning">{row.quantity}</td>
                                                        </>
                                                        }
                                                        {row.quantity >= 5 && <>
                                                            <td >{row.quantity}</td>
                                                        </>
                                                        }
                                                        <td className="crystal_markup">{row.mark_up}%</td>
                                                        <td style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }}>{row.updated_on}</td>
                                                        <td><button onClick={() => editProduct(row)}>Edit</button></td>
                                                    </>
                                                    }

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="Paginator">
                                    <button onClick={() => Paginate("next")}>Next</button>
                                </div>
                                {prodOffset > 0 && (
                                    <div className="Paginator1">
                                        <button onClick={() => Paginate("prev")}>Previous</button>
                                    </div>
                                )}
                                <h4 className="Paginator2">
                                    Showing {prodOffset || 10} of {prodCount}
                                </h4>

                            </div>

                        </div>
                        }




                         
                      







                        {popUp && (




                            <ProdPop product={Prodd} val={popUp} close={() => setpopUp(false)} />
                        )

                        }

                        <div class="db_info">
                            {prodCount !== null && (
                                <div className="Prod_Count">
                                    <h2>TOTAL PRODUCTS:</h2>
                                    <h1>{prodCount}</h1>
                                </div>
                            )}
                            {lastUpdate && (
                                <div className="Last_Update">
                                    <h2>LAST UPDATE:</h2>
                                    <h1>{lastUpdate}</h1>
                                </div>
                            )}
                            

                            {users.length != products.length &&


                                <button onClick={() => addToDb(qtyNoMatches)}>
                                    SYNC
                                </button>

                            }
                        </div>

                        <a class="scroll_to" href="#Top">
                            SCROLL TO TOP
                        </a>









                        </div>
                    
                )}
                    </div>
        )
    };

   


export default ProductsTable;
