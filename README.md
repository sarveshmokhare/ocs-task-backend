# ocs-task-backend

Authentication routes (/api/auth) : 
1. /signup (POST): Salts and hashes the password with bcrypt and saves the user in the db
2. /login (POST): Logs the user in by checking the password and sends back the accessToken generated with JWT

User routes (/api/user) :
1. / (GET): Authenticates the user with the accessToken and sends back all the user details
2. /update (PUT): Authenticates the user with the accessToken and updates the requested user details in the db
3. /delete (DELETE): Deletes the user from the db

Also there is a js script namely populate_db.js to take up the users from https://gorest.co.in/public/v2/users and adds them all to the db.
