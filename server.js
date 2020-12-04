const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

require('dotenv').config()

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/test', (req, res) => res.status(200).send('ok'));

//const esco = require('./routes/esco')
//app.use('/api/v1/esco', esco)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
})



