import React, { useState, useEffect } from "react";
import './UsersStyle.css'
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap/dist/css/bootstrap.min.css';


const DataRenderer = ({ data }) => {

    const [items, setitems] = useState(JSON.parse(data));
     
 
     

  return (
      <ul className="mongoListsz" >
          {Object.entries(items).map(([key, value],indx) => (

              
              <li className={typeof value !== 'object' && value !== null ? "mongoLisst" : ""} key={key}>
                  <strong>{typeof key === 'number' ? "" : key.toUpperCase() + " : "}</strong>

              {typeof value === 'object' && value !== null 
            ? <DataRenderer data={JSON.stringify(value)} />  // The component calls itself
                      : ` ${value}`}


        </li>
      ))}
    </ul>
  );
};


export default DataRenderer;