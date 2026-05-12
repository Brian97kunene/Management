import React, { useState, useEffect } from "react";
import Prods from './productsTable.jsx'
import Vend from './vendors.jsx'
import MyClass from './MyMethods.js'
import CreateSupplier from "./createSupplier.jsx";
import Upload from './ReadAFile.jsx'
import EditSupp from './EditSupplier.jsx'
import Manual_inputs from './Manual_inputs.jsx'
import Livefeed_Updates from './Livefeed_Updates.jsx'
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";


const Suppliers = () => {

    const port = 5000;
    const [suppliers,setSuppliers] = useState([])
    const [activeSupplierId, setActiveSupplierId] = useState(null);
    const [showTbl, setshowTbl] = useState(false)
    const [showSupTbl, setshowSupTbl] = useState(false)
    const [upload, setupload] = useState(false)
    const [manualupload, setmanualupload] = useState(false)
    const [edit, setedit] = useState(false)
    const [updates, setupdates] = useState(true)
    const [editsuppliers, seteditsuppliers] = useState(null)
    const [supps, setsupps] = useState([]);
    const [SupplierModal, setSupplierModal] = useState({
        
        sup: suppliers,
        open:false  })

    // for refreshes
    // for refreshes
    const [progress, setProgress] = useState(0);

    const [loading, setLoading] = useState(false);
    const [refresh, setrefresh] = useState(false);
    // for refreshes
    // for refreshes
    // for refreshes

    useEffect(() => {
        const fetchLastUpdate = async () => {
            try {
               
                setLoading(true);
                setProgress(0);





                const response = await fetch(`http://localhost:${port}/api/products/getAllsuppliers`);
                const data = await response.json();
                setSuppliers(data)

                console.log(data)
            } catch (error) {
                console.error("Error fetching last update:", error);
            
        } finally {


              
            setLoading(false);
            setProgress(0); // reset after short delay

        }
        };
        fetchLastUpdate();
    }, [refresh]);


    useEffect(() => {
        const fetchL = async () => {
            try {

                console.log(editsuppliers, " useEffect!!!")
            } catch (error) {
                console.error( error);
            }
        };
        fetchL();
    }, [editsuppliers]);



    // Fetch products
    //useEffect(() => {
    //    const fetchproducts = async () => {
    //        try {


    //            console.log(JSON.stringify(supplier));

    //            const response = await fetch(`http://localhost:${port}/api/users/${supplier.id}`);
    //            const data = await response.json();
                
    //            setupdates(!updates)
    //            console.log(data.data);
    //        } catch (error) {
    //            console.error("Error fetching users:", error);

    //        }
    //    };
    //    fetchproducts();

    //}, [updates]);

   



    /**
 * Converts an integer from 0 to 100 into its English word equivalent
 * with the first letter capitalized.
 */
    function viewsupplier(supp) {

        seteditsuppliers(null)
        suppliers.filter(s => supp.id === s.id).map(i => {



            console.log(i)

            setSupplierModal({sup:i,open:true})

        });
        setshowTbl(!showTbl)
        seteditsuppliers(supp)
        console.log(SupplierModal);
    }




    const openAccordioon = async (supplier) => {
   

 
    }
    function numberToWords(num) {
        let result = "";

        if (num === 0) {
            result = "zero";
        } else if (num === 100) {
            result = "one hundred";
        } else {
            const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
            const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
            const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

            if (num < 10) {
                result = ones[num];
            } else if (num < 20) {
                result = teens[num - 10];
            } else {
                const tenPlace = Math.floor(num / 10);
                const onePlace = num % 10;
                result = onePlace === 0 ? tens[tenPlace] : `${tens[tenPlace]}-${ones[onePlace]}`;
            }
        }

        // Capitalize the first letter of the resulting string
      

        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    const [isVisible_, setVisible_] = useState(false);

    var l = []
    const mark = (x) => {
        console.log(x);

        if (l.length === 0) {

                    l.push(x);



        } else {

            l.forEach(i => {
                if (l.includes(i)) {

                    console.log()

                }
                else {
                    l.push(x);

                }

            }


            );
        }


        try {

            setsupps((prev) => {


                console.log(prev);
                return [...prev, x];

            }



            );
    }
        
        
        
            
        catch (err) {


            console.log(err);

        }
        finally {

            // Add the new one
            
        console.log(l," list of marked tings");
        console.log(supps," state var");

        }


        



    }
    const deleteProducts = async (product) => {



        console.log(supps);

        const response = await fetch(`http://localhost:${port}/deletesupplier`, {
            method: "DELETE", // or "PATCH" if partial updates
            headers: {
                "Content-Type": "application/json"

            },
            body: JSON.stringify({ rows: supps }
               
               
            ),
        });


        if (response.status) {


            setsupps([])
        }
    }


    return (
        <div>


            {loading && (<>

                <p style={{ color: "#0c086b" }}  disabled={loading}>
                    {loading ? "Fetching Suppliers..." : ""}
                </p>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>{progress}%</div>
                </div></>
            )}
            




            <div style={{  display: "flex", justifyContent: "center" }}>
                <h1>SUPPLIERS</h1>
                </div>
            <br />
            
            <div style={{  display: "flex", justifyContent: "center" }}>
                <br />
            <button onClick={() => {
                setVisible_(!isVisible_)

            }}>ADD NEW </button>
            </div>

            {isVisible_ && <  >
                <CreateSupplier />
                <br />

            </>} 

                {supps.length >= 1 && <>
                    <button onClick={() => deleteProducts(l)}>DELETE MARKED SUPPLIERS 
                </button><br />
                    </> 
            }
                <button style={{ display:"sticky" , position:"static" }} onClick={() => setrefresh(prev => !prev)}></button>

          


            <button onClick={() => setshowSupTbl(!showSupTbl)}> Supplier
                </button>
            {showSupTbl &&

                <Vend supplier={suppliers} />
            }








        </div>
    );
};



export default Suppliers;
