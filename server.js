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

app.get('/api/v1', (req, res) => res.json({'success': true}));


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
})



