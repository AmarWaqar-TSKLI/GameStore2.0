const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    user: "HP",
    password: "t6k1#90g",
    server: "DESKTOP-5HVS36C\\SQLEXPRESS",
    database: "GameStore",
    options: {
        enableArithAbort: true,
        encrypt: false,
        trustServerCertificate: true
    },
    port: 1433
};

// Fetch Users from Database
app.get('/Users', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/Games', async (req, res) => {
    try {
        const { page = 1, limit = 18 } = req.query;
        const offset = (page - 1) * limit;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('limit', sql.Int, parseInt(limit))
            .input('offset', sql.Int, parseInt(offset))
            .query(`
                SELECT Games.game_id, cover_path, name, genre, description, rating FROM Games 
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

app.get('/SearchGames', async (req, res) => {
    try {
        const { search } = req.query;
        
        if (!search) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('search', sql.VarChar, `%${search}%`)
            .query(`
                SELECT Games.game_id, cover_path, name, genre, description, rating 
                FROM Games 
                JOIN Media ON Games.game_id = Media.game_id 
                WHERE name LIKE @search OR genre LIKE @search
                ORDER BY Games.game_id
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 
// Get wishlist games for a user
app.get('/Wishlist/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log("Received userId:", userId);

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Wishlist, Games, Media WHERE Wishlist.UserID = @userId AND Games.game_id = Wishlist.GameID AND Media.game_id = Wishlist.GameID');
        console.log("Query executed successfully");

        res.json(result.recordset);
    } catch (err) {
        console.error("Error fetching wishlist games:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/games/:genre', async (req, res) => {
    try {
        console.log("Received genre:", req.params.genre);
        const { page = 1, limit = 18 } = req.query;
        const offset = (page - 1) * limit;

        const genreSearch = `%${req.params.genre}%`;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('genre', sql.VarChar, genreSearch)
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .query(`SELECT M.*, G.name, G.description, G.genre, G.rating FROM Games G
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

        const checkResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('game_id', sql.Int, game_id)
            .query('SELECT * FROM Wishlist WHERE UserID = @user_id AND GameID = @game_id');

        if (checkResult.recordset.length > 0) {
            return res.json({ message: 'Game already in wishlist' });
        }

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

// Get all reviews for a specific game with usernames
app.get('/review/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const pool = await sql.connect(config);
        
        const result = await pool.request()
            .input('gameId', sql.Int, gameId)
            .query(`
                SELECT r.ReviewID, r.GameID, r.Comment, r.Stars, u.Username, u.UID, r.Date
                FROM Reviews r
                JOIN Users u ON r.Uid = u.UID
                WHERE r.GameID = @gameId
                ORDER BY r.ReviewID DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// server.js
app.post('/review/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { GameID, Comment, Stars } = req.body;

        // Validate stars (1-5)
        if (Stars < 1 || Stars > 5) {
            return res.status(400).json({ error: 'Stars must be between 1 and 5' });
        }

        const pool = await sql.connect(config);
        
        // Check if user already reviewed this game
        const existingReview = await pool.request()
            .input('userId', sql.Int, userId)
            .input('gameId', sql.Int, GameID)
            .query('SELECT * FROM Reviews WHERE Uid = @userId AND GameID = @gameId');

        if (existingReview.recordset.length > 0) {
            // Update existing review
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('gameId', sql.Int, GameID)
                .input('comment', sql.VarChar, Comment)
                .input('stars', sql.Int, Stars)
                .query(`
                    UPDATE Reviews 
                    SET Comment = @comment, Stars = @stars, Date = CAST(GETDATE() AS DATE)
                    WHERE Uid = @userId AND GameID = @gameId
                `);
        } else {
            // Insert new review
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('gameId', sql.Int, GameID)
                .input('comment', sql.VarChar, Comment)
                .input('stars', sql.Int, Stars)
                .query(`
                    INSERT INTO Reviews (GameID, Uid, Comment, Stars, Date)
                    VALUES (@gameId, @userId, @comment, @stars, CAST(GETDATE() AS DATE))
                `);
        }

        // Get the updated reviews with usernames
        const updatedReviews = await pool.request()
            .input('gameId', sql.Int, GameID)
            .query(`
                SELECT r.ReviewID, r.GameID, r.Comment, r.Stars, u.Username, u.UID, r.Date
                FROM Reviews r
                JOIN Users u ON r.Uid = u.UID
                WHERE r.GameID = @gameId
                ORDER BY r.ReviewID DESC
            `);

        res.status(201).json(updatedReviews.recordset);
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const pool = await sql.connect(config);

        const checkEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(409).json({ error: 'Email already exists. Please use a different one.' });
        }

        await pool.request()
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
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
            .input('password', sql.VarChar, password)
            .query('SELECT UID, Username, Email FROM Users WHERE Email = @email AND Password = @password');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

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
            .query('DELETE FROM Wishlist WHERE UserID = @UserID AND GameID = @GameID');

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

app.get('/game/:name/requirements', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const name = req.params.name;
        const minReqResult = await pool.request()
            .input('name', sql.VarChar, name)
            .query('SELECT * FROM MinReq WHERE name = @name');

        const maxReqResult = await pool.request()
            .input('name', sql.VarChar, name)
            .query('SELECT * FROM MaxReq WHERE name = @name');

        res.json({
            min: minReqResult.recordset[0] || null,
            max: maxReqResult.recordset[0] || null
        });
    } catch (err) {
        console.error('Error fetching requirements:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    console.log(name, email, subject, message)
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.RECEIVER_EMAIL,
            subject: `New Contact Us Message from ${name}`,
            text: `From: ${name} <${email}>\n\nSubject: ${subject}\n\n${message}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.get('/', (req, res) => {
    return res.send('Hello World');
});

app.listen(1000, () => {
    console.log('Server is running on port 1000');
});