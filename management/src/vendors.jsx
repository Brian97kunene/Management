import React, { useState, useEffect } from "react";
import './UsersStyle.css'
import Tbl from './itemsTable.jsx'
import Upload from './ReadAFile.jsx'
import AllMyProducts from "./products.jsx";


const PopUp = ({ supplier }) => {

    //const [onpageshow, setOnPageShow] = useState(true)
    const port = 5552;
    const [Products, setProducts] = useState([]);
    const [StringifiedProducts, setStringifiedProducts] = useState("");
    const [editingVendor, seteditingVendor] = useState(null);

    const [refresh, setrefresh] = useState(true)
    const [style, setstyle] = useState(null)
    const [productLimit, setproductLimit] = useState(20)

    // toggle vendor visibility
    const [VendorVisibility, setVendorVisibility] = useState(false)

    useEffect(() => {
        // handle submit data
        const handleSubmit = async () => {



            const port = 5552;
            try {                                                  


                console.log();

                //setUsers(data);
            } catch (error) {
                console.log(editingVendor.id);
                console.error("Error posting data:", error);
            }
            finally {


                //  setloading(false);
            }
        }

        handleSubmit()
    }, [editingVendor, style,productLimit]);




    // Load all vendors
    useEffect(() => {
        console.log(typeof StringifiedProducts);

    }, [StringifiedProducts]);
    useEffect(() => {
        const fetchvendors = async () => {
            try {
                console.log(supplier);

            

		if(StringifiedProducts.length === 0){
                const fetchItems = await fetch(`http://localhost:5000/api/products/getAllProducts`).then(r => r.json());





                console.log("fetched !! :");
                console.log(fetchItems);

  
                
                setStringifiedProducts(JSON.stringify(fetchItems));
};                
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };

        fetchvendors();
    },[]);

    // Update vendor in state after editing
    const handlevendorUpdated = (updatedvendor) => {
        setvendors(vendors.map(u => (u.id === updatedvendor.id ? updatedvendor : u)));
    };

    useEffect(() => {
        const getCurrentSupplier = (u) => {

            let activeStyle = { display: "inline", margin: "50px", padding: "15px", border: "1px solid black", color: "white", backgroundColor: "green" }

            if (editingVendor && u.id === editingVendor.id) {

                return activeStyle;
            }
            else {

                return {}

            }
        };
        getCurrentSupplier(supplier?.map(i => i))
    }
        , [editingVendor]);



    
    const getCurrentSupplier = (u) => {

        let activeStyle = {
            display: "inline", margin: "1% 0px 0px 0px", padding: "5px", border: "1px solid black", borderRadius: "5px", color: "white", backgroundColor: "#0c086b" ,overflowWrap:"break-word"}
        let activeStyle2 = { display: "inline", margin: "1% 0px 0px 0px", padding: "5px", borderRadius: "5px", border: "1px solid black", color: "black", overflowWrap: "break-word" ,maxWidth:"200px"}
        let addSupplierBtn = { display: "inline", margin: "1% 0px 0px 0px", padding: "5px", borderRadius: "5px", border: "1px solid black", color: "white", backgroundColor: "black", overflowWrap: "break-word" ,maxWidth:"200px"}

        if (editingVendor && u._id === editingVendor._id ) {

            return  activeStyle ;
        }
      
        else if(u === "Add") {

            return  addSupplierBtn ;

        }
        else {

            return  activeStyle2 ;

        }
    }

    const columnsToExclude = ["id", "detailed_description", "updated_on", "livefee_updated_on", "data_source", "supplier_code", "created_on", "vat", "vendor", "category", "delivery_cost", "price_after_mark_up", "is_synced", "is_duplicate"];



    return (

        
        <div className="vendor_List">
        {/*//Supplier*/}

        {/*//    <button onClick={() => setrefresh(!refresh) }> ref*/}
        {/*//</button>*/}
        <br/>
        <br/>
        <br/>


            {supplier !== null && supplier.length > 0 && <div>

                {supplier?.map((row, rowIndex) => (
                    <div style={{ display: "inline", margin: "0px 0px 10px 0px ",height:"auto",width:"100%" }} key={rowIndex}>
                        {Object.entries(row)

                            .map((col, colIndex) => (

                                 colIndex === 0   ? <>
                                  

                                    <span style={getCurrentSupplier(row)}  key={row.id} onClick={() => seteditingVendor(row)}>{row.name}</span>
                                     
                                    {rowIndex == supplier.length -  1 &&

                                        <div >
                                            <div style={{ display: "flex", justifyContent: "right" }}>
                <span style={getCurrentSupplier("Add") }>Add New Supplier</span>
                                        </div>
                                        </div>
                                    }
            </>
                                        :""
                                
                            
                        
                            ))}
                    </div>
                ))}
            </div>}


            {/*{editingVendor && <>*/}

            {/*    <Tbl items={Products} setItems={(newItems) => setProducts(newItems)} supplier={editingVendor} productLim={productLimit} increaseLimit={()=> setproductLimit((prev) => prev + prev)} />*/}
            {/*</>   */}


            {/*}*/}
            {StringifiedProducts.length > 0 && <>

                <AllMyProducts AllProducts={StringifiedProducts} setItems={(newItems) => setProducts(newItems)} />
            </>   


            }
            
            
        </div>
    );
}
            
export default PopUp;

