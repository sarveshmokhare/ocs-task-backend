require('dotenv').config()

const express = require('express')
const router = express.Router()
const pool = require('../dbPool')
const jwt = require('jsonwebtoken')

router.use(express.json())

//authenticateToken function
function authenticateUserToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const accessToken = authHeader && authHeader.split(' ')[1]  

    if (accessToken == null) {
        res.json({ message: 'Invalid token.', success: false });
        return;
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.json({ message: 'Invalid token.', success: false });

        req.user = user;
        next();
    })
}

router.get('/', authenticateUserToken, (req, res) => {
    // console.log(req.user);

    pool.query(`SELECT name, email, gender FROM user_details WHERE email='${req.user.email}'`, (err, result) => {
        if (err) {
            console.log('Error getting the details of the user with email: ', req.user.email);
            return res.json({ success: false, message: 'Error getting the details.' })
        }

        // console.log(result);//result is an array of one found user in the format of js object
        console.log('Sucessfully sent the user data: ', result[0]);
        res.json({ success: true, data: result[0] })
    })
})

function updateName(email, name) {
    pool.query(`UPDATE user_details SET name='${name}' WHERE email='${email}'`, (err, result) => {
        return err;
    })
}
function updateGender(email, gender) {
    pool.query(`UPDATE user_details SET gender='${gender}' WHERE email='${email}'`, (err, result) => {
        return err;
    })
}

router.put('/update', authenticateUserToken, (req, res) => {
    if (req.body.name && req.body.gender === undefined) {
        if (updateName(req.user.email, req.body.name)) {
            console.log('Error in updating name.');
            return res.json({ success: false, message: 'Error in updating the name.' })
        }
        console.log('Successfully updated the name to: ', req.body.name);
        res.json({ success: true, message: "Successfully updated the user's name." })
    }

    else if (req.body.name === undefined && req.body.gender) {
        if (updateGender(req.user.email, req.body.gender)) {
            console.log('Error in updating gender');
            return res.json({ success: false, message: 'Error in updating the gender.' })
        }
        console.log('Successfully updated the gender to: ', req.body.gender);
        res.json({ success: true, message: "Successfully updated the user's gender." })
    }

    else if (req.body.name && req.body.gender) {
        if (updateName(req.user.email, req.body.name)) {
            console.log('Error in updating name');
            return res.json({ success: false, message: 'Error in updating the name.' })
        }
        if (updateGender(req.user.email, req.body.gender)) {
            console.log('Error in updating gender');
            return res.json({ success: false, message: 'Error in updating the gender.' })
        }
        console.log('Successfully updated both name and gender');
        res.json({ success: true, message: "Successfully updated both name and gender." })
    }
})

router.delete('/delete', authenticateUserToken, (req, res) => {
    pool.query(`DELETE FROM user_details WHERE email='${req.user.email}'`, (err, result) => {
        if (err) {
            console.log('Error in deleting the user with email: ', req.user.email);
            return res.json({ success: false, message: 'Error in deleting the user' })
        }

        console.log('Successfully deleted the user with email: ', req.user.email);
        res.json({ success: true, message: 'Successfully deleted the user' })
    })
})

module.exports = router