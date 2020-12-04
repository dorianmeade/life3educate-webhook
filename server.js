const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require("node-fetch");

require('dotenv').config()

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/test', (req, res) => res.status(200).send('ok'));

//const esco = require('./routes/esco')
//app.use('/api/v1/esco', esco)

//app.get('/api/v1', (req, res) => res.json({'success': true}));

app.post('/api/v1', async (req, res) => {
    console.log(req.params)
    if(req.params.type === 'esco')
    {
        var myURL = "https://ec.europa.eu/esco/api/resource/occupation?language=en&uri=";
        
        if (req.params.job == "developer")
        {
            var uri = "http://data.europa.eu/esco/occupation/c40a2919-48a9-40ea-b506-1f34f693496d";
        }
        else if (req.params.job == "UI designer")
        {
            var uri = "http://data.europa.eu/esco/occupation/96e20037-0a25-4bf6-a25e-808d1605d890";
        }
        else if (req.params.job == "UX designer")
        {
            var uri = "http://data.europa.eu/esco/occupation/faed411a-f920-4100-86a8-b877928b429c";
        }
        else if (!req.params.skill)//search for career? 
        {
           // myURL = "https://ec.europa.eu/esco/api/search?language=en&text="
        //    myURL = myURL + params.job;
            res.json({ result: 'We do not have information for that career field yet.' });
        }

        let response = await fetch(myURL + uri, {headers: {'Accept': 'application/json'} });
        let data = await response.json();
        if (!req.params.skill)
        {
            //console.log(data)
            res.json({result: data.description.en.literal});
        }
        else
        {
            let skills = data._links.hasEssentialSkill.map((v) => {
                return `${v.title}`;
            });
            res.json({ result: `Skills of a ${params.skill} include: ` + skills.join(", ") });
        }

    }
    else if (req.params.type == 'discovery') {
        res.json({'success': true});
    }
    else {
        res.json({'success': false});
    }
    
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
})



