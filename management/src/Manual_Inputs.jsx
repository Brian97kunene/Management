import React, { useState, useEffect } from "react";
import MyClass from "./MyMethods";
import { CSSTransition } from 'react-transition-group';
import './UsersStyle.css'
import { Button } from "bootstrap";


// Main component showing list of users

const ManualList = ({ supplier}) => {
    const [products, setproducts] = useState([])
    const [product, setproduct] = useState([])




    useEffect(() => {

        const getEm = async () => {
            let prods = await MyClass.getProduct();
            if (prods) {

            setproducts(prods);
            }

        }
        getEm();


    }, []);


    const HandleSubmit = async (prods) => {

        try {

            const response = await fetch(`http://localhost:5552/api/createproduct`, {
                method: "POST", // or "PATCH" if partial updates
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({
                    rows: prods,
                    supplier: supplier
                }),
            });



            console.log(response);

            if (response.status) {

                alert("Product Created Successfully.")

            }

        }
        catch (err) { console.log(err); }

    }

    const HandleChange = (col) => (e) => {
        const val = e.target.value;
        setproduct({ ...product, [col]: val });
    };

    const columnsToExclude = ["id", "detailed_description", "updated_on", "data_source", "supplier_code", "created_on", "vat", "category", "delivery_cost", "price_after_mark_up","is_synced"];

    return (
        <div>
            {products.length > 0 && (
                <div className="wrappe">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {Object.keys(products[0])
                                    .filter((col) => !columnsToExclude.includes(col))
                                    .map((col, indx) => (
                                        <th key={indx}>{col.toUpperCase()}</th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {Object.entries(products[0])
                                    .filter(([key]) => !columnsToExclude.includes(key))
                                    .map(([colName, colValue], indx) => (
                                        <td key={indx}>
                                            <input
                                                type="text"
                                                id={indx}
                                                value={product[colName] || ""}
                                                onChange={HandleChange(colName)}
                                            />
                                        </td>
                                    ))}
                            </tr>
                        </tbody>
                    </table>

                    <button onClick={() => HandleSubmit(product)}>Create</button>
                </div>
            )}
        </div>
    );
}

export default ManualList;
