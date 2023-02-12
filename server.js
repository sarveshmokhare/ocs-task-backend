require('dotenv').config()


const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const authRouter = require('./routes/authServer')
const userRouter = require('./routes/userRoutes')

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

const PORT = 4000
app.get('/', (req, res)=>{
    res.send(`Made request to port: ${PORT}`)
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})