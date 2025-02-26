require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const {logger, logEvents} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookiePaser = require('cookie-parser')
const cors = require('cors')
const bodyParser = require('body-parser')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use(express.json())

app.use(cookiePaser())

app.use(express.static('public'))

app.use('/', require('./routes/root'))

app.use('/auth', require('./routes/authRoutes'))

app.use('/users', require('./routes/userRoutes'))

app.use('/conversations', require('./routes/conversationRoutes'))

app.use('/spotify', require('./routes/spotifyRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ error: 'Not found' })
    } else {
        res.type('txt').send('Not found')
    
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
    console.log('Connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
    console.error(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErr.log')
})
