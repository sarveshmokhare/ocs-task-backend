require('dotenv').config()

const express = require('express')
const bcrypt = require('bcrypt')
const pool = require('../dbPool')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.use(express.json())

// signup route
router.post('/signup', async (req, res) => {
    console.log('/signup');
    if (!req.body.name) return res.json({ success: false, message: 'name missing' })
    if (!req.body.email) return res.json({ success: false, message: 'email missing' })
    if (!req.body.gender) return res.json({ success: false, message: 'gender missing' })
    if (!req.body.password) return res.json({ success: false, message: 'password missing' })

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        pool.query(`INSERT INTO user_details (name, email, gender, password) VALUES ('${req.body.name}', '${req.body.email}', '${req.body.gender}', '${hashedPassword}')`,
            (err, results) => {
                if (err) {
                    res.json({
                        message: 'Error signing in the user. User may already exist.',
                        error: err,
                        success: false
                    })
                    console.log('Error adding the user in the database: ' + err);
                    return;
                }
                res.json({
                    success: true,
                    message: 'Created the user',
                    userEmail: req.body.email
                })
                console.log('Created the user with email: ', req.body.email);
            })
    } catch (err) {
        res.json({ message: 'Error signing in the user', error: err, success: false })
        console.log('Error signing in the user: ', err);
    }
})

function createAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '6h' })
}

// login route
router.post('/login', (req, res) => {
    console.log('/login');
    pool.query(`SELECT * FROM user_details WHERE email='${req.body.email}'`, async (err, result, fields) => {
        if (err) {
            res.json({
                message: 'Error searching user in the db',
                error: err,
                success: false
            })
            console.log('Error searching user in the db: ' + err);
            return;
        }
        else if (result[0] == null) {
            res.json({
                message: 'User not found',
                error: err,
                success: false
            })
            console.log('User not found');
            return;
        }
        try {
            if (await bcrypt.compare(req.body.password, result[0].password)) {
                const user = { email: result[0].email }
                const accessToken = createAccessToken(user)
                // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)

                // adding refresh token to the db
                // pool.query(`SELECT * FROM refresh_tokens WHERE token='${refreshToken}'`, (err, result) => {
                //     if (err) {
                //         console.log('Error searching refresh token in the db');
                //         return res.json({ success: false, message: 'Error searching refresh token in the db' })
                //     }

                //     // add refresh token only when it doesn't exist in the db
                //     if (result[0] == null) {
                //         pool.query(`INSERT INTO refresh_tokens (token) VALUES ('${refreshToken}')`, (err, result) => {
                //             if (err) {
                //                 console.log('Error adding token to db');
                //                 return res.json({ success: false, message: 'Error adding token to db' })
                //             }
                //             console.log('Successfully added the refresh token: ', refreshToken);
                //         })
                //     }
                // })
                res.json({
                    success: true,
                    message: 'Successfully logged in',
                    accessToken,
                    // refreshToken
                })
                console.log('Successfully logged in the user: ', result[0].email, ' with accessToken: ', accessToken);
            }
            else {
                res.json({
                    success: false,
                    message: 'Incorrect password.'
                })
            }
        }
        catch {
            res.json({success: false, message: 'Server error.'})
        }
    })
})

// this route is never used
router.post('/token', (req, res) => {
    const refreshToken = req.body.token;

    pool.query(`SELECT * FROM refresh_tokens WHERE token='${refreshToken}'`, (err, result) => {
        if (err) {
            console.log('Error searching refresh token in the db');
            return res.json({ success: false, message: 'Error searching refresh token in the db' })
        }

        if (result[0] == null) {
            console.log('Refresh token not found');
            return res.json({ message: 'Refresh token not found', success: false })
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log('Invalid refresh token');
                return res.json({ message: 'Invalid token', success: false });
            }

            const newAccessToken = createAccessToken({ email: user.email })

            res.json({ newAccessToken, success: true })
        })
    })
})

router.delete('/logout', (req, res) => {
    pool.query(`DELETE FROM refresh_tokens WHERE token='${req.body.token}'`, (err, result) => {
        if (err) {
            console.log('Error in deleting the refresh token from db');
            return res.json({ success: false, message: 'Error in deleting the refresh token from db' })
        }

        if (result.affectedRows == 0) {
            console.log("Refresh token doesn't exist")
            return res.json({ success: false, message: "Refresh token doesn't exist" })
        }

        console.log('Successfully deleted the token');
        res.json({success: true, message: 'Successfully deleted the token'})
    })
})

module.exports = router