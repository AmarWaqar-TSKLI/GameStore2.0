const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Required to parse JSON request body


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
    try {
        const { page = 1, limit = 18 } = req.query; // Default: page 1, 15 games per page
        const offset = (page - 1) * limit;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .input('offset', sql.Int, parseInt(offset))
            .query(`
                SELECT Games.game_id,cover_path,name,genre,description,rating FROM Games 
                JOIN Media ON Games.game_id = Media.game_id 
                ORDER BY Games.game_id 
                OFFSET @offset ROWS 
                FETCH NEXT @limit ROWS ONLY
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get wishlist games for a user
app.get('/Wishlist/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log("Received userId:", userId); // ✅ Log the received userId

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, userId) // ✅ Use sql.Int for integer input
            .query(`select * from Wishlist,Games,Media where Wishlist.UserID = @userId and Games.game_id = Wishlist.GameID and Media.game_id = Wishlist.GameID`);
        console.log("Query executed successfully"); // ✅ Log successful query execution

        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching wishlist games:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
);


app.get('/games/:genre', async (req, res) => {
    try {
        console.log("Received genre:", req.params.genre);
        const { page = 1, limit = 18 } = req.query;
        const offset = (page - 1) * limit;

        const genreSearch = `%${req.params.genre}%`; // ✅ Proper wildcard usage

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('genre', sql.VarChar, genreSearch) // ✅ Pass wildcard properly
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .query(`SELECT M.*,G.name,G.description,G.genre,G.rating FROM Games G
                    JOIN Media M ON G.game_id = M.game_id 
                    WHERE G.genre LIKE @genre 
                    ORDER BY M.game_id 
                    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`);

        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching games:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post('/WishlistInsertion', async (req, res) => {
    const { user_id, game_id } = req.body;
    console.log('Incoming Wishlist Request:', req.body);

    try {
        const pool = await sql.connect(config);

        // First, check if the entry already exists
        const checkResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('game_id', sql.Int, game_id)
            .query('SELECT * FROM Wishlist WHERE UserID = @user_id AND GameID = @game_id');

        if (checkResult.recordset.length > 0) {
            // Entry already exists, don't insert again
            return res.json({ message: 'Game already in wishlist' });
        }

        // Otherwise, insert it
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('game_id', sql.Int, game_id)
            .query('INSERT INTO Wishlist (UserID, GameID) VALUES (@user_id, @game_id)');

        res.json({ message: 'Game added to wishlist' });

    } catch (err) {
        console.error('Error inserting into Wishlist:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const pool = await sql.connect(config);

        // Check if email already exists
        const checkEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(409).json({ error: 'Email already exists. Please use a different one.' });
        }

        // Insert new user
        await pool.request()
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password) // In production: hash this
            .query('INSERT INTO Users (Username, Email, Password) VALUES (@username, @email, @password)');

        return res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during signup' });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const pool = await sql.connect(config);

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password) // Hashing needed in real world
            .query('SELECT UID, Username, Email FROM Users WHERE Email = @email AND Password = @password');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // ✅ Send user data to frontend
        const user = result.recordset[0];
        return res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.delete('/Wishlist/:userId/:gameId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const gameId = parseInt(req.params.gameId, 10);

        console.log('Received userId:', userId);
        console.log('Received gameId:', gameId);

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('GameID', sql.Int, gameId)
            .query(`
                DELETE FROM Wishlist 
                WHERE UserID = @UserID AND GameID = @GameID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ error: 'Game not found in wishlist' });
        } else {
            res.status(200).json({ message: 'Game removed from wishlist' });
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/game/:ID', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('gameId', sql.Int, req.params.ID)
            .query(`
                SELECT 
                    G.game_id, G.name, G.genre, G.description, G.rating,
                    M.cover_path, M.trailer_url, 
                    M.screenshot_1, M.screenshot_2, M.screenshot_3, M.screenshot_4, M.screenshot_5
                FROM Games G
                JOIN Media M ON G.game_id = M.game_id
                WHERE G.game_id = @gameId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching game:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    return res.send('Hello World');
});

app.listen(1000, () => {
    console.log('Server is running on port 1000');
});
