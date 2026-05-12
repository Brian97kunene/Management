import React, { useState } from "react";
import './UsersStyle.css';
import logo from './log.jpg';
import File from "./createProduct.jsx";
import Products from "./products.jsx";




const CrystalCommunications = () => {
    //
  const [isVisible, setVisible] = useState(false);




    
    // CRYSTAL COMM BLUE: #0c086b
    // CRYSTAL COMM BLUE: #0c086b
    // CRYSTAL COMM BLUE: #0c086b


    return (
        <div class="main">
            <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ marginTop: "10px",width:"auto", border:"groove #0c086b 10px"}}>
            <img className="logo" src={logo} style={{ margin: "30px 50px 0px 100px" }} />
                <h1 style={{ marginTop: "0px", padding: "0px 50px 0px 50px", color: "#0c086b", fontFamily: "Century Schoolbook", fontWeight: "bold" }}>STOCK MANAGEMENT SYSTEM</h1>
            </div>
            </div>

            <br/>
            <div style={{ display: "flex", justifyContent: "center" }}>

            <button  onClick={() => {
                setVisible(!isVisible)
                
            }}>ADD NEW PRODUCT</button>         
            </div>
          
            {isVisible && <  >
                <File val={isVisible} close={() => setVisible(!isVisible)} />                

            </>} 
                               
                           </div >

    );
}

export default CrystalCommunications;
