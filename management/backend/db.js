import express from 'express';
  
import cors from 'cors';
import pkg from "pg";

const { Pool } = pkg;


const app = express();
const port = 5555;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'crystal_communications',
    user: 'postgres',
    password: 'GodUser'
});


function  timeStamp() {
    var f = new Date();
    var datee = f.getDate();
    var ff = f.getHours();
    var fff = f.getMinutes();

    return `${datee} - ${ff}:${fff}`;


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

// CREATE - Add new user
app.post('/createuser', async (req, res) => {
    try {
        const { name, sku, description } = req.body;
        const result = await pool.query(
            'INSERT INTO "Product" (name,sku,description)  VALUES ($1,$2,$3) RETURNING *', [name, sku, description]
            
            
        );
        

        console.log("Inside CREATE AT: " + timeStamp());
        
        
        res.status(201).json({ success: true, data: result.rows[0] +" TESTSSSS" });
 
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// READ - Get all users
app.get('/userr', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Product"');

        console.log("Inside GET 10:20 AT: " + timeStamp());
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// READ - Get single user
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM "Product" WHERE "Id" = $1', [id]);
        console.log("Inside GET by ID");
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE - Update user
app.put('/updateuser/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, sku } = req.body;
        const result = await pool.query(
            'UPDATE "Product" SET name = $1, description = $2, sku = $3 WHERE "Id" = $4 RETURNING *',
            [name, description, sku, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        console.log("Inside UPDATE, AT: " + timeStamp());
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE - Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM "Product" WHERE "Id" = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        console.log("Inside DELETE, AT: " + timeStamp());
        res.json({ success: true, message: 'User deleted', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});