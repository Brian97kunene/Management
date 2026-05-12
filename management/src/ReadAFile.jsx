import { useState, useEffect } from "react";
import Papa from "papaparse";
import './UsersStyle.css';

function CsvDropEditor(supplier) {
    const [fileName, setFileName] = useState("");
    const [rows, setRows] = useState([]);
    const [vendors, setvendors] = useState([]);
    const [suppli, setsuppli] = useState({});
    const [vendor, setvendor] = useState({ name: "", address: "", contact:"", contact_name:"", email:"" });
    const [searchTerm, setSearchTerm] = useState("");
    const [dbColumns, setDbColumns] = useState([]);
    const [matchedColumns, setMatchedColumns] = useState([]);

    const [nearMatchedColumns, setNearMatchedColumns] = useState([]);
    const [missingColumns, setMissingColumns] = useState([]);
    const [extraColumns, setExtraColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [manualMappings, setManualMappings] = useState({});

    const [selectedRows, setSelectedRows] = useState([]);





    // Fetch database columns on mount
    useEffect(() => {
        const fetchDbColumns = async () => {
            try {
                const response = await fetch("http://localhost:5552/api/db-columns");
                const result = await response.json();
                if (result.success) {
                    setDbColumns(result.columns);
                    setsuppli(supplier.supplier)
                }
            } catch (error) {
                console.error("Error fetching DB columns:", error);
            }
        };
        fetchDbColumns();
    }, []);

    useEffect(() => {
        const fetchrows =  () => {
            try {
                console.log("selectedRows: ");
                console.log(selectedRows);
            } catch (error) {
                console.error("Error :", error);
            }
        };
        fetchrows();
    }, [selectedRows]);

    


    function addRow(row) { setRows(prevRows => [...prevRows, row]); }

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setLoading(true);
        setProgress(0);
        if (file) {
            setFileName(file.name);

            if (file.name.endsWith(".csv")) {
                // Parse CSV
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    step: (row) => {
                        //console.log(row.data);

                        addRow(row.data);

                        // Update progress based on rows parsed
                        // (approximate since we don’t know total rows until complete) 
                        setProgress((prev) => Math.min(prev + 1, 100));

                    }, complete: (result) => {
                        const parsedData = Array.isArray(result.data) ? result.data : [];

                        //console.log(parsedData);

                        setLoading(false);
                        setProgress(100);
                        if (result.data.length > 0) { compareColumns(Object.keys(parsedData[0])); }
                    },
                });
            } else if (file.name.endsWith(".xml")) {

                const reader = new FileReader();
                reader.onload = (event) => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(event.target.result, "application/xml");

                    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                        alert("Invalid XML file format.");
                        return;
                    }

                    // Get all ProductInformationForWeb nodes
                    const productNodes = Array.from(xmlDoc.getElementsByTagName("ProductInformationForWeb"));

                    const parsedRows = productNodes.map(node => {
                        const obj = {};

                        Array.from(node.children).forEach(child => {
                            if (child.children.length === 0) {
                                // Simple element
                                obj[child.tagName] = child.textContent;
                            } else {
                                // Nested element
                                if (child.tagName === "ProductDimensions") {
                                    Array.from(child.children).forEach(dim => {
                                        obj[`ProductDimensions_${dim.tagName}`] = dim.textContent;
                                    });
                                } else if (child.tagName === "PublishingCategory") {
                                    Array.from(child.children).forEach(cat => {
                                        obj[`PublishingCategory_${cat.tagName}`] = cat.textContent;
                                    });
                                } else if (child.tagName === "WarehouseStockLevels") {
                                    // Flatten each PortalWarehouseStockLevel
                                    Array.from(child.getElementsByTagName("PortalWarehouseStockLevel")).forEach((ws, idx) => {
                                        Array.from(ws.children).forEach(wsChild => {
                                            obj[`Warehouse_${idx + 1}_${wsChild.tagName}`] = wsChild.textContent;
                                        });
                                    });
                                } else {
                                    // Generic flatten for other nested nodes
                                    Array.from(child.children).forEach(sub => {
                                        obj[`${child.tagName}_${sub.tagName}`] = sub.textContent;
                                    });
                                }
                            }
                        });


                        setLoading(false);
                        setProgress(100);
                        return obj;
                    });

                    setRows(Array.isArray(parsedRows) ? parsedRows : []);

                    if (parsedRows.length > 0) {
                        compareColumns(Object.keys(parsedRows[0]));
                    }
                };
                reader.readAsText(file);
            }


            else {
                alert("Unsupported file type. Please drop a CSV or XML file.");
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleCellChange = (rowIndex, colKey, value) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex][colKey] = value;
        setRows(updatedRows);
    };

    const exportCsv = () => {
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "edited.csv";
        link.click();
    };

    const filteredRows = Array.isArray(rows)
        ? rows.filter((row) =>
            row &&
            Object.values(row).some((val) =>
                String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : [];







    const sendToMongo = async (products) => {
        const liveMap = new Map();

        console.log("Products count:", products?.length);
        console.log("Supplier:", supplier.supplier);

        // 1. Populate the Map with the added supplier field
        products.forEach(f => {
            liveMap.set(String(f.sku), { ...f, metadata: { SupplierName: supplier.supplier.name, data_format: supplier.supplier.data_format } });
        });


        // Inside Livefeed_Updates.jsx before calling fetch/axios
        const formattedData = products.map(item => ({
            ...item,
            // Convert metadata array [ {obj} ] to just {obj}
            metadata: { SupplierName: supplier.supplier.name, data_format: supplier.supplier.data_format },

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




        console.log(handleInsert());
        var t = handleInsert();


        const badItems = t.filter(p => !p.name || p.name.trim() === "");
        const goodItems = t.filter(p => p.name && p.name.trim() !== "");
        if (badItems.length > 0) {
            console.error("Found products with missing names:", badItems);
            badItems.forEach(prod => delete prod.name);
        }


        const cleanData = badItems.concat(goodItems);


        const supData = cleanData.map(item => ({
            ...item,
            // Convert metadata array [ {obj} ] to just {obj}
            metadata: { SupplierName: supplier.supplier.name, data_format: supplier.supplier.data_format }
        }));

        console.log(supData);

        if (formattedData.length !== 0) {
            try {
                const response = await fetch(`http://localhost:5000/api/createproducts`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    // 3. Send the UPDATED array, not the original 'products'
                    body: JSON.stringify({
                        productss:cleanData
                    })
                });

                const result = response.status;
                console.log("Server Response:", result);

            } catch (error) {
                console.error("Fetch error:", error);
            }
        }
    };



    const updateDatabase = async () => {
        try {
            const response = await fetch("http://localhost:5552/api/update-csv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Database updated successfully!");
            } else {
                alert("Failed to update database.");
                console.log(result);
            }
        } catch (error) {
            console.error("Error updating database:", error);
        }
    };

    const compareColumns = (fileColumns) => {
        const matches = fileColumns.filter((col) => dbColumns.includes(col));
        const missingInDb = fileColumns.filter((col) => !dbColumns.includes(col));
        const extraInDb = dbColumns.filter((col) => !fileColumns.includes(col));

        // Find near matches
        const nearMatches = [];
        missingInDb.forEach((col) => {
            dbColumns.forEach((dbCol) => {
                const score = similarityScore(col, dbCol);
                if (score >= 0.7) { // threshold for "close enough"
                    nearMatches.push({ fileCol: col, dbCol, score });

                    
                }
            });
        });

        setMatchedColumns(matches);
        setNearMatchedColumns(nearMatches);
        setMissingColumns(missingInDb);
        setExtraColumns(extraInDb);
    };

    useEffect(() => {

        console.log(manualMappings);

    }, [manualMappings]);
    useEffect(() => {
        if (rows.length > 0) {

            console.log("compare rowzzz");

 
            const lowerCaseKeys = Object.keys(rows[0]).map(key => key.toLowerCase());



            setManualMappings(lowerCaseKeys);

            console.log(lowerCaseKeys)

            // console.log( Object.keys(rows[0].join(',')));
            compareColumns(lowerCaseKeys);
        }
    }, [rows]);


    


    // VERY IMPORTANT, ALGORITHMIC WAY OF COMPARING STRINGS
    // VERY IMPORTANT, ALGORITHMIC WAY OF COMPARING STRINGS


    function levenshteinDistance(a, b) {
        const matrix = Array.from({ length: a.length + 1 }, () =>
            Array(b.length + 1).fill(0)
        );

        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[a.length][b.length];
    }

    function similarityScore(a, b) {
        const distance = levenshteinDistance(a, b);
        const maxLen = Math.max(a.length, b.length);
        return 1 - distance / maxLen; // 1 = identical, 0 = completely different
    }






    // Apply manual mappings to rows before insertion




    const getSupplier = (supp) => {


        console.log(supp);

    }

    const getSupplier1 = async (supp) => {


           console.log(supp, " our obj supp");
        console.log(JSON.stringify(supplier.supplier.id), " our supp");

        const na = supp.split(" ");

        var str = ""
        str = na.join("-");
        

            console.log(na, " our supp");
        console.log(`http://localhost:5552/vendor/byname/${na}`);
        try {
            const sup = await fetch(`http://localhost:5552/vendor/byname/${na}`);
            const result = await sup.json();

            console.log(result);


            if (result.success) {

                console.log("fetch val:", result.data)
         
            }
            console.log("res", result);
            

        }
        catch (err) {

            console.log( err);

        }


    }

    const insertRowsToDb = async (mappedRows) => {


        //const supplier_name = document.getElementById("vendorname").value;
        //const supplierdd = document.getElementById("vendordd").value;

        /*const v = await getSupplier1(supplier_name);*/
        //console.log(JSON.stringify(mappedRows), " mappedRows");
       // console.log(JSON.stringify(suppli), " supply");
      /* console.log(v," supplier obj");*/
        try {

       

            const response = await fetch("http://localhost:5552/api/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rows: mappedRows,
                    supplier: suppli
                }),
            });


           /* console.log(supplierdd, " Dropdown");*/
       //     console.log(suppli, " :fetch value");
            const result = await response.json();
            console.log("response: ",result);
            if (result.success) {
                alert("Rows inserted successfully!");
              //  console.log("Rows to add:  " + JSON.stringify(mappedRows, supplier));
            } else {
                alert("Failed to insert rows.");
                console.log(result);
                console.log("Mapped: ", JSON.stringify((mappedRows, supplier)));
            }
        } catch (error) {
            console.error("Error inserting rows:", error);
        }
    };













    const handleInsert = () => {
        // Map selected rows with manual column mappings

        const str = [];

        console.log("selected: ",selectedRows);
        console.log("manualMappings: ", manualMappings);

        const rowsToInsert = selectedRows.map((row) => { // FOR ROWS

            
            const mappedRow = {}; 

            Object.keys(row).forEach((fileCol) => { // FOR COLUMNS
               

                if (fileCol) {

                    mappedRow[fileCol] = row[fileCol];

                   
                }
            });
            str.push(mappedRow);
            return mappedRow;
        });


        return rowsToInsert;
        // Call your DB insert function
       // insertRowsToDb(rowsToInsert);

    };



    const createvendor = async (vend) => {

        
        console.log("creating...", vend);

        

            
            try {
                const response = await fetch("http://localhost:5552/createvendor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(vend),
                });



                alert("CREATED: ",vend);
                console.log(response);
            }
            catch (err) {


                alert(err);

            }
        }
        

            


        
    
    const BulkTick = () => {

        const cb = document.getElementById("tick_all");
        const bulk_cb = document.querySelectorAll(".bulk_add_cb");

        if (cb.checked) {
            bulk_cb.forEach(c => c.checked = true);
            setSelectedRows(filteredRows)
        }
        else {
            setSelectedRows([]);
        }
    }



    useEffect(() => {
        const fetchvendors = async () => {
            try {

               
                const response = await fetch("http://localhost:5552/vendors");
                const result = await response.json();
                if (result.success) {
                    setvendors(result.data);
                }
            } catch (error) {
                console.error("Error fetching DB columns:", error);
            }
        };
        fetchvendors();
    }, []);




    // PAGINATION
    // PAGINATION
    // PAGINATION


    const hovering = () => {

        let x = {
        }




    }

        return (
            <div
                class="Drag&Drop"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    border: "2px dashed #333",
                    padding: "20px",
                    width: "auto",
                    margin: "20px auto",
                    marginLeft: "0px",
                    textAlign: "center",
                    background: "#fafafa",
                }}
            >




                        

                {false && ( <div>
                <select id="vendordd">
                    {vendors.map(vendor =>

                        <option key={vendor.id} >
                            {vendor.name}
                    </option>
                
                       
                    )}
                        <option>None</option>
                            
                </select><br/>
              

                <input type="text" id="vendorname" className="form-control" value={vendor.name} placeholder="Supplier.." onChange={(e) => setvendor({ ...vendor, name: e.target.value })} /><br />

                <button onClick={() => createvendor(vendor) }>Create Supplier
                    </button>

                </div>
    )

}




                <p>Drag & Drop a CSV or XML file here</p>
                {fileName && <h4>File: {fileName}</h4>}

                {matchedColumns.length > 0 && (
                    <div style={{ margin: "10px 0", color: "green" }}>
                        ✅ Matched Columns: {matchedColumns.join(", ")}
                    </div>
                )}
                {/* Loading animation + progress bar */}
                {loading && (
                    <div style={{ margin: "20px 0" }}>
                        <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
                        <div style={{ marginTop: "10px", width: "100%", background: "#ddd", borderRadius: "5px", }}>
                            <div style={{ width: `${progress}%`, height: "10px", background: "#4CAF50", borderRadius: "5px", transition: "width 0.3s ease" }}></div>
                        </div>
                        <div style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: `${progress}%`, height: "30px", margin: "0 auto" }} >{progress}%</div>
                    </div>
                )}



                {nearMatchedColumns.length > 0 && (
                    <div style={{ margin: "10px 0", color: "blue" }}>
                        🔍 Suggested Near Matches:
                        <ul>
                            {nearMatchedColumns.map((m, idx) => (
                                <li key={idx}>
                                    File column <b>{m.fileCol}</b> ≈ DB column <b>{m.dbCol}</b> (score: {m.score.toFixed(2)})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}



                {rows.length > 0 &&
                    <div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                marginBottom: "10px",
                                padding: "8px",
                                width: "100%",
                                border: "1px solid #ccc",
                            }}
                        />




                        {rows.length > 0 && <div>






                            <div class="db_info_11">
                            <table style={{ width: "90px", marginTop: "10px", overflowX: "scroll" }}>
                                <thead>
                                    <tr>

                                            <th>ALL <input id="tick_all" type="checkbox" onChange={() => BulkTick(filteredRows)} /></th>
                                            {Object.keys(rows[0]).map((col, index) => (
                                            <th
                                                key={index}
                                                style={{
                                                    border: "1px solid black",
                                                    padding: "8px",
                                                    background: dbColumns.includes(col)
                                                        ? "#c8e6c9"
                                                        : "#ddd",
                                                }}
                                            >
                                                {col}<br />
                                                <select value={manualMappings[col] || ""} onChange={(e) =>
                                                    setManualMappings((prev) => ({
                                                        ...prev,
                                                        [col]: e.target.value
                                                    }))
                                                }
                                                >

                                                    <option value="">-- Map to DB column --</option>
                                                    {dbColumns.map((dbCol) => (
                                                        <option key={dbCol} value={dbCol}>
                                                            {dbCol}
                                                        </option>
                                                    ))}

                                                </select>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((row, i) => (
                                        <tr key={i}>

                                            <td>{(i + 1)})   
                                                <input
                                                    type="checkbox"
                                                    class="bulk_add_cb"
                                                    checked={selectedRows.includes(row)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRows((prev) => [...prev, row]);
                                                        } else {
                                                            setSelectedRows((prev) => prev.filter((r) => r !== row));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            {Object.entries(row).map(([colKey, val], j) => (
                                                <td
                                                    key={j}
                                                    style={{
                                                        border: "1px solid black",
                                                        padding: "8px",
                                                    }}
                                                >
                                                    <input
                                                        className="tbl_data"
                                                        type="text"
                                                        value={val}
                                                        onChange={(e) =>
                                                            handleCellChange(i, colKey, e.target.value)
                                                        }
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}


                                </tbody>
                            </table>

                            </div>

                         


                            <button
                                onClick={handleInsert}
                                style={{
                                    marginTop: "20px",
                                    padding: "10px 20px",
                                    background: "#673AB7",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Insert Mapped Columns as Rows into DB
                            </button>
                            <button
                                onClick={() => sendToMongo(selectedRows)}
                                style={{
                                    marginTop: "20px",
                                    padding: "10px 20px",
                                    background: "#673AC7",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Insert into MongoDB
                            </button>





                            <button
                                onClick={exportCsv}
                                style={{
                                    marginTop: "20px",
                                    padding: "10px 20px",
                                    background: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Export Edited CSV
                            </button>
                        </div>
                        }



                        <button
                            onClick={updateDatabase}
                            style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                background: "#2196F3",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Update Database
                        </button>
                    </div>




                }
            </div>);

    }


export default CsvDropEditor;
