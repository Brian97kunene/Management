import express from 'express';
  
import cors from 'cors';
import pkg from "pg";
import os from "os";
import { join } from 'path';

const { Pool } = pkg;


const app = express();

const port = 5552;

// Middleware
app.use(express.json({ limit: "20mb" }));

app.use(cors());
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173' }));







// PostgreSQL connection
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: "GodMode"
});


const BuildQuery = (dat, data) => {

    var query1 = "";

    if (dat == "insert") {


        data.forEach((i, indx) => {

            if (indx === data.length-1) {

                console.log(i);
                query1 += `('${JSON.stringify(Object.keys(i)).replace("{", "").replace("}", "").replace("]", "").replace("[", "")}')`
            }
            else {

                query1 += `('${JSON.stringify(Object.values(i)).replace("{", "").replace("}", "").replace("]", "").replace("[", "")}'),`

            }


            }
        );
    }
    else if (dat == "update") {


        query1 = `UPDATE supplier SET name = 'MTBTTF' where name='${JSON.stringify(data)}' RETURNING *;`;
    }
    return query1;


}


function SyncTransaction(query, query1, client,x) {
    // Express.js Backend Route
    app.post('/api/purchase', async (req, res) => {


        try {
            await client.query('BEGIN'); // 1. Start Transaction



            // 2. Deduct balance from user
            
            await client.query(BuildQuery("insert", query))
            await client.query('Savepoint firstpoint;'); // 4. Save changes


            // 3. Record the order
      

            res.status(200).send('Transaction successful');

         
            client.release(); // Always release the client back to the pool
            


        } catch (error) {
            await client.query('ROLLBACK'); // 5. Undo everything on error
            res.status(500).send(`Transaction failed: ${error.message}`);

        }
    });
}
function  timeStamp() {
    var f = new Date();
    var datee = f.getDate();
    var month = f.getMonth();
    var year = f.getFullYear();
    var ff = f.getHours();
    var fff = f.getMinutes();


    var t = os.totalmem() / 1000000000;

    var timee = "";


    if (ff < 9) {
        if (fff < 9) {

            timee = `0${ff}:0${fff} - ${datee}/${month}/${year}`;
            
        }
    }
    else {

        if (fff < 9) {
            timee = `${ff}:0${fff} -  ${datee}/${month}/${year}`;
           
        }   
        else {
            timee = `${ff}:${fff} -  ${datee}/${month}/${year}`;
           
        }
    }

    return timee + ` TOTAL MEMORY: ${t.toFixed(2)}GB`;

}

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database at:' + timeStamp());
        release();
    }
});



app.post('/api/purchase', async (req, res) => {
    const client = await pool.connect(); // Get a client from the pool
    const { query, query1 } = req.body; // Expecting SQL queries in request body
    try {
        SyncTransaction(query, query1,client);
;
    }
    catch (error) {
        res.status(500).send(`Transaction failed: ${error.message}`);

    }



    });
app.post('/api/getmarkups', async (req, res) => {
    const client = await pool.connect(); // Get a client from the pool
    const  supplier_code  = req.body; // Expecting SQL queries in request body
    try {

        console.log(supplier_code.code, " code");
        await client.query(
            `UPDATE product
SET price_after_mark_up = (bank_cost + price) * ((1 + (mark_up / 100.0)) * (1 + (vat / 100.0)))
WHERE supplier_code = $1 RETURNING *; `
            , [supplier_code.code]);


        res.status(200).send(`Transaction failed: ${res.status}`);
    }
    catch (error) {
        res.status(500).send(`Transaction failed: ${error.message}`);

    }
    finally {

        client.release();
    }



    });

// CREATE - Add new user
app.post('/createuser', async (req, res) => {
    try {
        const { name, sku, description, price, bank_cost, mark_up, vat,supplier,quantity,category } = req.body;
        const result = await pool.query(
            'INSERT INTO product (name,sku,description,price,bank_cost,mark_up,vat,supplier,quantity,category)  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [name, sku, description, price, bank_cost, mark_up, vat, supplier, quantity, category]
            
            
        );
        

        console.log("Inside CREATE AT: " + timeStamp());
        
        
        res.status(201).json({ success: true, data: result.rows[0] +" TESTSSSS" });
 
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// CREATE - Add new user from live feed
app.post('/api/createproduct', async (req, res) => {
    try {
        const  row = req.body.rows;
        
        console.log(row, " row");
        console.log([row.sku, row.name, row.description, row.price, row.quantity, row.mark_up, req.body.supplier.id, req.body.supplier.name]);
        console.log(req.body.supplier.id);
       // const count = req.body.rating?.count;
        const result = await pool.query(
            "INSERT INTO product(sku,name,description,price,quantity,mark_up,supplier_code,supplier,created_on,updated_on) VALUES($1, $2, $3, $4,$5,$6,$7,$8, NOW(), NOW()) RETURNING * "
            ,
            [
                row.sku,
                row.name,
                row.description,
                row.price,

                row.quantity,
                row.mark_up,
                req.body.supplier.id,
                req.body.supplier.name
            ]


        );


        console.log("Inside CREATE AT: " + timeStamp());


        res.status(201).json({ success: true, data: result[0] });

    } catch (error) {
       

        res.status(500).json({ success: false, error: error.message });
    }
});




app.get('/api/getsyncedproducts', async (req, res) => {
    try {
     
       // const count = req.body.rating?.count;
        const result = await pool.query(
            `SELECT p.*,
       CASE
         WHEN dup.count > 1 THEN true
         ELSE false
       END AS is_duplicate
FROM product p

LEFT JOIN (
    SELECT sku, COUNT(*) AS count
    FROM product

    GROUP BY sku
) dup ON p.sku = dup.sku
where is_synced = true; `            


        );


        console.log("Inside getsyncedproducts AT: " + timeStamp());

       
        res.status(200).json({ success: true, data: result.rows });

    } catch (error) {
       

        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/getothersuppliers', async (req, res) => {

    const { sku } = req.params;
    console.log(sku);
    try {
     
       // const count = req.body.rating?.count;
        const result = await pool.query(
            `SELECT sku, supplier.id as "supplier_id" ,product.name,supplier.name as "supplier", price, quantity
	FROM public.product
	join supplier on product.supplier_code = supplier.id

	` 


        );


        console.log("Inside getothersuppliers AT: " + timeStamp());

       
        res.status(200).json({ success: true, data: result.rows });

    } catch (error) {
       

        res.status(500).json({ success: false, error: error.message });
    }
});



// READ - Get all products count
app.get('/getproductcount', async (req, res) => {
    try {
        const result = await pool.query('SELECT count(*) as "total" FROM product');

        console.log("Inside GET 'product' count AT: " + timeStamp());
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// READ - Get all products count
app.get('/api/getothersuppliers', async (req, res) => {


    try {
        const result = await pool.query('SELECT * from synced_skus_and_suppliers ');

        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// for testing, lazy to open pga admin
// for testing, lazy to open pga admin
// for testing, lazy to open pga admin


app.delete('/fake', async (req, res) => {


    try {
        const result = await pool.query('DELETE from product where supplier_code is null');

        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// READ - Get all users with pagination
app.get('/userr/:x', async (req, res) => {
    try {
        var {x} = req.params
        const result = await pool.query(`SELECT * FROM product where  quantity >= 1 order by livefee_updated_on asc LIMIT 10 OFFSET ${x}`);

        console.log("Inside GET 'product' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// READ - Get all products
app.get('/allproducts/', async (req, res) => {
    try {
        
        const result = await pool.query(`SELECT * FROM product`);

        console.log("Inside GET 'product' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// READ - Get 1 products
app.get('/product/', async (req, res) => {
    try {
        
        const result = await pool.query(`SELECT * FROM product LIMIT 1`);

        console.log("Inside GET 'product' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// READ - Get all users
app.get('/getproduct/byname/:x', async (req, res) => {
    try {
        var { x} = req.params;
        const result = await pool.query("SELECT * FROM product where name ilike  $1 ", ["%"+x+"%"]);

        console.log("Inside GET 'getproduct' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.log(x+"    ");
        res.status(500).json({ success: false, error: error.message });
    }
});

// READ - Get all users
app.get('/getproduct/bysku/:x', async (req, res) => {
    try {
        var { x} = req.params;
       console.log(x)

        const result = await pool.query("SELECT * FROM product where sku ilike  $1 ", [x+"%"]);

        console.log("Inside GET 'getproduct' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.log(x+"    ");
        res.status(500).json({ success: false, error: error.message });
    }
});
// READ - Get all users
app.get('/api/precise/getproduct/byname/:x', async (req, res) => {
    try {
        var { x} = req.params;
        const result = await pool.query("SELECT * FROM product where name ilike  $1 ", [x]);

        console.log("Inside GET 'getproduct' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.log(x+"    ");
        res.status(500).json({ success: false, error: error.message });
    }
});

// READ - Get all users
app.get('/api/precise/getproduct/bysku/:x', async (req, res) => {
    try {
        var { x} = req.params;
       console.log(x)

        const result = await pool.query("SELECT * FROM product where sku ilike  $1 ", [x]);

        console.log("Inside GET 'getproduct' AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.log(x+"    ");
        res.status(500).json({ success: false, error: error.message });
    }
});

// READ - Get all products by supplier
app.get('/getproduct/bysupplier/:x/:y', async (req, res) => {
    try {
        var { x,y} = req.params;


        const result = await pool.query(`SELECT p.*,
       CASE
         WHEN dup.count > 1 THEN true
         ELSE false
       END AS is_duplicate
FROM product p

LEFT JOIN (
    SELECT sku, COUNT(*) AS count
    FROM product

    GROUP BY sku
) dup ON p.sku = dup.sku
where supplier_code = $1 limit $2`, [x,y]);

        console.log("Inside GET 'getproduct' by supplier_code AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.log(x+"    ");
        res.status(500).json({ success: false, error: error.message });
    }
});





// READ - Get last update
app.get('/lastupdate', async (req, res) => {
    try {
        const result = await pool.query('SELECT updated_on FROM product where updated_on is not null order by updated_on desc limit 1');

        console.log("Inside GET last update timestamp AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// READ - Get products by supplier
app.get('/api/getproducts/bysuppliercode/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM product WHERE supplier_code = $1 ', [id]);
        console.log("Supplier ", id);
        console.log("products ", result.rows.length);
      
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// READ - Get BY SKU
app.get('/api/sku/:sku', async (req, res) => {
    try {
        const sku = req.params;
        console.log(sku.sku);
        const result = await pool.query('SELECT * FROM product WHERE sku = $1', [sku.sku]);
        console.log("Inside GET by SKU");
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// UPDATE - Update user
app.post('/api/updateproduct', async (req, res) => {
    try {
        console.log([req.body])
        const rows = [req.body];
        
        console.log(rows)
        
        const updatePromises = rows.map(row => {
            return pool.query(
                'UPDATE product SET quantity = $1 ,updated_on = now() WHERE sku = $2 and supplier = $3 RETURNING *',
                [row.quantity, row.sku, row.supplier]
            );
        });

        await Promise.all(updatePromises);  

        console.log("Inside UPDATE, AT: "+ timeStamp());
        res.json({ success: true, data: res });
    } catch (error) {
        
        res.status(500).json({ success: false, error: error.message });
    }
});



// DELETE - Delete PRODUCT
app.delete('/api/deleteuser/:sku', async (req, res) => {
    try {
        const { sku } = req.params;
        const result = await pool.query('DELETE FROM product WHERE sku = $1', [sku]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        console.log("Inside DELETE, AT: " + timeStamp());
        res.json({ success: true, message: 'User deleted', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// UPDATE  PRODUCT
app.post('/api/updateproduct/:sku/:quantity', async (req, res) => {
    try {
        const { sku, quantity } = req.params;
        const result = await pool.query('UPDATE FROM product SET quantity = $1 WHERE sku = $2', [quantity,sku]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'PRODUCT not found' });
        }
        console.log("Inside UPDATE PRODUCT By SKU, AT: " + timeStamp());
        res.json({ success: true, message: 'Product Update', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



///                         MAPPED BULK OPERATIONS
///                         MAPPED BULK OPERATIONS
///                         MAPPED BULK OPERATIONS



app.post('/api/bulk-update-mark-up', async (req, res) => {
    try {
        const { rows } = req.body;

        let status = null;
        var t = [];

        console.log(rows);

        for (const row of rows) {
            console.log(row);

            // console.log(row);
            const result = await pool.query(
                `UPDATE product SET mark_up = $1,price_after_mark_up = $2, updated_on = Now() WHERE sku = $3 AND supplier_code =$4 returning *; `,
                [

                    row.mark_up,
                    row.price_after_mark_up,
                    row.sku,
                    row.supplier_code          //3


                    //11 description
                ]
            );
            t.push(row.sku);
            status = result.command; // "INSERT" or "UPDATE"
        }
        //  console.log(t);
        console.log("Last operation:", status);
        console.log(rows.length);
        res.json({ success: true, status });
    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});










app.post('/api/bulk-insert', async (req, res) => {
    try {
        const rows = req.body.rows;
        const supplier = req.body.supply;
        let status = null;
        console.log("WEDCA :",supplier);
        const supp_code = supplier.id;  

        console.log("supplier of bulk:", req.body.supply);
            console.log("bulk:",rows);
        
            
        for (const row in rows) {

            console.log("0000");
            console.log(rows[row])
           

            const result = await pool.query(
                `INSERT INTO product (
            name, detailed_description, sku, price, bank_cost, mark_up, quantity, category, supplier, updated_on, created_on, vat, description,supplier_code
         )
         VALUES (
            $1, $2, $3, $4, $5, $6, $7, '', '',NOW(),NOW(),15,'', $8        
         ) ON CONFLICT (sku)
         DO  UPDATE
         SET price = EXCLUDED.price
            ,quantity = EXCLUDED.quantity
            ,mark_up = EXCLUDED.mark_up
         RETURNING*;`,
                [
                    rows[row].name,
                    rows[row].description,
                    rows[row].sku,
                    rows[row].price,
                    rows[row].bank_cost,
                    rows[row].mark_up,
                    rows[row].quantity, // 7
                  
                    supp_code //12


                ]
            );
            status = result.command; // "INSERT" or "UPDATE"
            console.log("Last operation:", result.rows);
        }

        res.status(200).json({ success: true});

        console.log("Last operation:", status);


        



    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
    }
);


///                          BULK OPERATIONS


app.post('/api/bulk-update', async (req, res) => {
    try {
        const { rows, supplier } = req.body;
        //const supp_code_id = supply.id;

     console.log(`Starting bulk update for supplier: ${rows[0]}`);
  
         //We use a map to create an array of promises
        const updatePromises = rows.map(row => {
            return pool.query(
                `WITH updated AS (
    UPDATE product
    SET
        price = $4,
        quantity = $7,
        bank_cost = $5,
        mark_up = $6,
        price_after_mark_up = ($4::NUMERIC + $5::NUMERIC) * (1 + ($6::NUMERIC / 100.0) + (15 / 100.0)),
        updated_on = NOW()
    WHERE sku = $3 AND supplier_code = $9
    RETURNING *
)
INSERT INTO product (
    name, detailed_description, sku, price, bank_cost,
    mark_up, quantity, category, supplier, updated_on, created_on,
    vat, description, supplier_code,
    price_after_mark_up
)
SELECT
    $1, $2, $3, $4, $5,
    $6, $7, $8, $10, NOW(), NOW(),
    15, '', $9,
    (($4::NUMERIC + $5::NUMERIC) * (1 + ($6::NUMERIC / 100.0) + (15 / 100.0)))
WHERE NOT EXISTS (SELECT 1 FROM updated)
RETURNING *;`,
                [
                    row.name || 'PRODUCT_' + row.sku, // $1
                    row.description || '',            // $2
                    row.sku || "SKU_"+ Math.floor(Math.random()*100),                          // $3
                    row.price || 0,                   // $4
                    row.bank_cost || 50,            // $5
                    row.mark_up || 0,                  // $6
                    row.quantity || 0,                 // $7
                    row.category || 'Uncategorized',   // $8
                    supplier.id,                       // $9
                    supplier.name                      // $10
                ]
            );
        });

        // Execute all queries in parallel
        await Promise.all(updatePromises);

        res.status(200).json({ success: true, message: `Processed ${rows.length} rows.` });

    } catch (error) {
        console.error("Bulk update error:", error);
       
        res.status(500).json({ success: false, error: error.message });
    }
});



//SYNTECH BULK OPERATIONS
///                         SYNTECH BULK OPERATIONS
///                         SYNTECH BULK OPERATIONS



// NOTE : ALL '/SYNTECH , ENDPOINTS REFER TO DATA THAT IS PULLLED FROM FEED , KEY WORD : * FROM *'
// NOTE : ALL '/SYNTECH , ENDPOINTS REFER TO DATA THAT IS PULLLED FROM FEED , KEY WORD : * FROM *'
// NOTE : ALL '/SYNTECH , ENDPOINTS REFER TO DATA THAT IS PULLLED FROM FEED , KEY WORD : * FROM *'





app.delete('/api/syntech/bulk-delete', async (req, res) => {
    try {
        const rows = req.body.rows;
        const sup = req.body.supplier;
        let status = null;
        var t  = [];

        var p = req.body.rows;
        console.log("my rows: ", p);
        console.log("my sup: ", sup);


        for (const row of rows) {
           // console.log(row);
            const result = await pool.query(
                `DELETE FROM product WHERE sku = $1 and supplier_code = $2 returning *; `,
                [

                    row  ,sup        //3


                    //11 description
                ]
            );
            t.push(row.sku);
            status = result.command; // "INSERT" or "UPDATE"
        }
      //  console.log(t);
        console.log("Last operation:", status);
        console.log(rows.length);
        res.json({ success: true, status });
    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


app.post('/api/sync', async (req, res) => {
    try {
        const rows = req.body.products;
     

        let status = null;
        var t  = [];
        console.log(req.body);
       

       
            // console.log(row);
            const result = await pool.query(
                `UPDATE product SET is_synced = true WHERE sku = $1 AND supplier_code =$2 returning *; `,
                [

                    rows.sku,
                    rows.supplier_code


                    //11 description
                ]
            );
        
            status = result.command; // "INSERT" or "UPDATE"
        
        
      //  console.log(t);
        console.log("Last operation:", status);
        
        console.log(req.body.supplier);
        
        res.json({ success: true, status });
    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});





// READ - Get products by supplier
app.get('/api/getproducts/bysuppliercode/:id', async (req, res) => {
    try {
        const id = req.params;
        console.log(id);
        const result = await pool.query(`SELECT p.*,
       CASE
         WHEN dup.count > 1 THEN true
         ELSE false
       END AS is_duplicate
FROM product p

LEFT JOIN (
    SELECT sku, COUNT(*) AS count
    FROM product

    GROUP BY sku
) dup ON p.sku = dup.sku
WHERE supplier_code = $1 `, [id]);
        console.log("Supplier ", id);
        console.log("products ", result.rows.length);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




app.post('/api/getdetailed_supplier_info', async (req, res) => {
    try {
       

        let status = null;
        



        
           // console.log(row);
            const result = await pool.query(
                `SELECT p.*,
       CASE
         WHEN dup.count > 1 THEN true
         ELSE false
       END AS is_duplicate
FROM product p

LEFT JOIN (
    SELECT sku, COUNT(*) AS count
    FROM product

    GROUP BY sku
) dup ON p.sku = dup.sku

`,[]
            );
            
            status = result.command; // "INSERT" or "UPDATE"
        
      //  console.log(t);
        console.log("Last operation:", status);
    
        res.json({ success: true, data:result.rows});
    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/unsync', async (req, res) => {
    try {
        const { rows } = req.body;

        let status = null;
        var t  = [];

        console.log(req.body);

        for (const row of rows) {
           // console.log(row);
            const result = await pool.query(
                `UPDATE product SET is_synced = false WHERE sku = $1 AND supplier_code =$2 returning *; `,
                [

                    row.sku,row.supplier_code          //3


                    //11 description
                ]
            );
            t.push(row.sku);
            status = result.command; // "INSERT" or "UPDATE"
        }
      //  console.log(t);
        console.log("Last operation:", status);
        console.log(rows.length);
        res.json({ success: true, status });
    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});





app.post('/api/syntech/bulk-insert', async (req, res) => {
    try {
        const rows = req.body.rows;
        const supp = req.body.supplier;
        let status = null;


        console.log(rows);
            for (const row of rows) {
                var qty = Number(Number(row.dbnstock) + Number(row.cptstock) + Number(row.jhbstock)) || 0;
                //console.log(row);
                const result = await pool.query(
                    `INSERT INTO product (
            name, detailed_description, sku, price, bank_cost, mark_up, quantity, category, supplier, updated_on, created_on, vat, description,supplier_code
         )
         VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 15.00, $11, $12
         )RETURNING*;`,
                    [
                        row.name,         //1
                        row.description, //2  // detailed_description
                        row.sku,            //3
                        row.price,          //4
                        row.bank_cost,  //5
                        row.recommended_margin, //6 // mark_up
                        qty, //7 quantity
                        row.categorytree,                           //8 category
                        row.attributes?.brand || 'Unknown supplier',                   //9 supplier
                        row.last_modified,                       //10 livefee_updated_on
                        row.shortdesc,
                        supp.id                    ]
                );

                status = result.command; // "INSERT" or "UPDATE"

            console.log("Last operation:", status);
            

        }
        
    

    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Step 1: Begin transaction and perform CRUD
app.put('/api/syntech/bulk-update', async (req, res) => {
    
    try {
     
        
        const rows = req.body.rows;
        const myresults = [];

        console.log("typeof myrows: ");
        console.log(rows[0]);

        for (const row of rows) {
           
            

           
//         FROM FEED TO DATABASE 
         

        const result = await pool.query(
            `UPDATE product  SET mark_up = $1, price=$2 , quantity = $3 where sku = $4 RETURNING *;
           `, [row.recommended_margin, row.price, row.cptstock + row.jhbstock + row.dbnstock, row.sku]


        );
       






            myresults.push(result);

        }
            res.json({ success: true, message: 'Sync completed', data: myresults });
    } catch (error) {
        console.log("SERVER ERR: "+error);
    }
});
app.put('/api/syntech/bulk-update-qty', async (req, res) => {
    
    try {
     
        
        const rows = req.body.rows;
        const myresults = [];

        console.log("typeof myrows: ");
        console.log(rows[0]);

        for (const row of rows) {
           
            

           
//         FROM FEED TO DATABASE 
         

        const result = await pool.query(
            `UPDATE product  SET quantity = $1 where sku = $2 RETURNING *;
           `, [row.jhbstock + row.cptstock + row.dbnstock,row.sku]


        );
       






            myresults.push(result);

        }
            res.json({ success: true, message: 'Sync completed', data: myresults });
    } catch (error) {
        console.log("SERVER ERR: "+error);
    }
});







app.post('/api/bulk-upsert', async (req, res) => {
    try {
        const rows = req.body.rows;
        /// const supplier = req.body.supply;
        let status = null;



        //console.log("supplier of bulk:", req.body);
        //console.log("bulk:", rows);








        //var t = Object.keys(rows[0]);
        //console.log(t);


        


        console.log(typeof Object.keys(rows[0]).join(",")," cols")
       // res.status(200).json({ success: true });
        //for (const row in rows) {

        //    console.log("0000");


        //    const result = await pool.query(
        //        `INSERT INTO product (
        //    name, detailed_description, sku, price, bank_cost, mark_up, quantity, category, supplier, updated_on, created_on, vat, description,supplier_code
        // )
        // VALUES (
        //    $1, $2, $3, $4, $5, $6, $7, '', '',NOW(),NOW(),15,'', $8
        // ) ON CONFLICT (sku)
        // DO  UPDATE
        // SET price = EXCLUDED.price
        //    ,quantity = EXCLUDED.quantity
        //    ,mark_up = EXCLUDED.mark_up
        // RETURNING*;`,
        //        [
        //            rows[row].name,
        //            rows[row].description,
        //            rows[row].sku,
        //            rows[row].price,
        //            rows[row].bank_cost,
        //            rows[row].mark_up,
        //            rows[row].quantity, // 7

        //            supp_code //12


        //        ]
        //    );
            //status = result.command; // "INSERT" or "UPDATE"
          //  console.log("Last operation:", result.rows);
        //}


       
        res.status(200).json({ success: true });

        console.log("Last operation:", status);






    } catch (error) {
        console.error("Bulk insert error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
);






///                         SYNTECH BULK OPERATIONS ABOVE 
///                         SYNTECH BULK OPERATIONS ABOVE
///                         SYNTECH BULK OPERATIONS ABOVE





// Step 3: Commit after user confirms
app.post('/commit/:transactionId', async (req, res) => {
    const client = req.app.locals.transactions[req.params.transactionId];
    if (!client) return res.status(400).json({ success: false, error: 'Invalid transaction ID' });

    try {
        await client.query('COMMIT');
        client.release();
        delete req.app.locals.transactions[req.params.transactionId];
        res.json({ success: true, message: 'Transaction committed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Step 4: Rollback if user cancels
app.post('/rollback/:transactionId', async (req, res) => {
    const client = req.app.locals.transactions[req.params.transactionId];
    if (!client) return res.status(400).json({ success: false, error: 'Invalid transaction ID' });

    try {
        await client.query('ROLLBACK');
        client.release();
        delete req.app.locals.transactions[req.params.transactionId];
        res.json({ success: true, message: 'Transaction rolled back' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


 


///                         supplier ROUTES BELOW
///                         supplier ROUTES BELOW
///                         supplier ROUTES BELOW



// READ - Get all suppliers
app.get('/suppliers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM supplier');

        console.log("Inside GET all suppliers : " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})



// READ - Get a supplier
app.get('/supplier/:id', async (req, res) => {

    const id = req.params;

    try {
        const result = await pool.query('SELECT * FROM supplier where id = $1',[id]);

        console.log("Inside GET a supplier : " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})
// READ - Get a supplier by name
app.get('/supplier/byname/:name', async (req, res) => {

    const name = req.params.name;
    var t = "";
    console.log(name);
    for (let i = 0; i <= name.length-1; i++) {


        console.log(name[i])

        if (name[i] != ",") {

            t += name[i];
        }
        else {


            t += " ";
        }

        console.log();
    }


    console.log("name :",t);


    
    console.log("**");
    try {
        const result = await pool.query('SELECT * FROM supplier where name ilike $1', [t]);

        console.log("Inside : " + name);
        console.log("res: " + result);
        console.log("Inside GET a supplier by name : " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})



// CREATE - Add new supplier
app.post('/createsupplier', async (req, res) => {
    try {
        const { name, phone, contact_name, email, address } = req.body.fom;
        const  data_format  = req.body.dataformat;

        console.log(data_format);
         
        const result = await pool.query(
            'INSERT INTO supplier (name,contact,contact_name,email,address,data_format,created_at,updated_at)  VALUES ($1,$2,$3,$4,$5,$6,now(),now()) RETURNING *', [name, phone, contact_name, email, address,data_format]


        );


        console.log("Inside CREATE supplier AT: " + timeStamp());


        res.status(201).json({ success: true, data: result.rows[0]  });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




// Example table: "csv_data"
// Columns: id SERIAL PRIMARY KEY, name TEXT, age INT, email TEXT

// Update database with edited rows
app.post("/api/update-csv", async (req, res) => {
    const rows = req.body.rows;

    try {
        // Clear existing data (optional, depends on your use case)
       

        // Insert updated rows
        for (const row of rows) {
            await pool.query(
                "INSERT INTO product(name, description,contact,contact_name,email,address) VALUES ($1,$2,$3,$4,$5,$6)",
                [row.name, row.age, row.email]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});






// UPDATE - Update supplier
app.post('/updatesupplier', async (req, res) => {
    try {
        
        const { name, contact, contact_name, email, address, id, data_format } = req.body;

        const result = await pool.query(
            'UPDATE supplier SET name = $1, contact = $2, contact_name = $3, email = $4, address = $5,data_format = $7  WHERE id = $6 RETURNING *',
            [name, contact, contact_name, email, address, id,data_format]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        console.log("Inside supplier UPDATE, AT: " + timeStamp());
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.log(req.body);
        res.status(500).json({ success: false, error: error.message });
    }
});



app.delete('/deletesupplier', async (req, res) => {
    try {

        const  rows  = req.body.rows;

        console.log(rows, " data");

       console.log(BuildQuery("insert",rows));
        for (const row of rows) {
            const result = await pool.query(
                'DELETE FROM supplier WHERE name = $1 AND id = $2  RETURNING *',
                [row.name, row.id]
            );
        }

        console.log("Inside supplier DELETE, AT: " + timeStamp());
        res.json({ success: true  });
    } catch (error) {
        
        res.status(500).json({ success: false, error: error.message });
    }
});


// fetch columns for comparision
app.get("/api/db-columns", async (req, res) => {
    const columns = ["price", "name", "sku", "description", "brand", "category", "mark_up","quantity"]; // Example: fetch from DB schema
    res.json({ success: true, columns });
});





app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});




