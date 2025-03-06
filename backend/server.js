const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());

const config = {
    user: "HP",
    password: "t6k1#90g",
    server: "DESKTOP-5HVS36C\\SQLEXPRESS",
    database: "GameStore",
    options: {
        enableArithAbort: true,
        trustServerCertificate: true,
        trustedConnection: false,
        instancename: "SQLEXPRESS"
    },
    port: 1433
};

// this is the code which i know 

// Fetch Books from Database
app.get('/', async (req, res) => { //Users
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Users'); 
        res.json(result.recordset); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/Wishlist', async (req, res) => {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .input('genre', sql.VarChar, req.params.genre)
        .query('SELECT * FROM Wishlist,Users WHERE Users.UID = Wishlist.UserID');

    res.json(result.recordset);
});

app.get('/Games', async (req, res) => {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .input('genre', sql.VarChar, req.params.genre)
        .query('SELECT * FROM Games JOIN Media ON Games.game_id = Media.game_id');

    res.json(result.recordset);
});

app.get('/games/:genre', async (req, res) => {
    try {
        console.log("Received genre:", req.params.genre); // Debugging

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('genre', sql.VarChar, `%${req.params.genre}%`) // Proper usage
            .query(`SELECT * FROM Games WHERE genre LIKE @genre`); // Use @genre

        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching games:", err); // Log error
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Get game details
app.get('/game/:gameId', async (req, res) => {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .input('gameId', sql.Int, req.params.gameId)
        .query('SELECT * FROM Games WHERE game_id = @gameId');

    res.json(result.recordset[0]);
});

// Get screenshots for a game
app.get('/game/:gameId', async (req, res) => {
    const pool = await sql.connect(config);
    const result = await pool.request()
        .input('gameId', sql.Int, req.params.gameId)
        .query('SELECT * FROM Media WHERE game_id = @gameId');

    res.json(result.recordset);
});




app.get('/', (req, res) => {
    return res.send('Hello World');
});

app.listen(1000, () => {
    console.log('Server is running on port 1000');
});
