const axios = require('axios');

const pool = require('./dbPool')

function populateDB() {
    axios.get('https://gorest.co.in/public/v2/users')
        .then(res => {
            // console.log(res.data);
            // res.data is the array of js objects of users with id, name, email, gender, status as keys
            const usersData = res.data;

            const query = "INSERT INTO user_details (name, email, gender) VALUES ?";
            const values = [];
            usersData.forEach(obj => {
                values.push([obj.name, obj.email, obj.gender])
            });

            pool.query(query, [values], (error, results, fields) => {
                if (error) {
                    console.error('Error adding the users in the database: ' + error);
                    return;
                }
                
                console.log('Successfully added the users.');
                pool.end(() => {
                    console.log('Database connection released.');
                })
            });
        })
        .catch(err => {
            console.log(err);
        })

    return;
}

populateDB()

