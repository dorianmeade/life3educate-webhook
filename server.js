const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require("node-fetch");
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const mysql = require('mysql');

require('dotenv').config()

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cors ({
    origin: ["https://life3.io"],
    methods: ["GET", "POST"],
    credentials: true,
}));

app.get('/test', (req, res) => res.status(200).send('ok'));

app.post('/api/v1', async (req, res) => {
    console.log(req.body)
    if(req.body.type === 'esco')
    {
        var myURL = process.env.ESCO_URL;
        
        if (req.body.job == "developer")
        {
            var uri = "http://data.europa.eu/esco/occupation/c40a2919-48a9-40ea-b506-1f34f693496d";
        }
        else if (req.body.job == "UI designer")
        {
            var uri = "http://data.europa.eu/esco/occupation/96e20037-0a25-4bf6-a25e-808d1605d890";
        }
        else if (req.body.job == "UX designer")
        {
            var uri = "http://data.europa.eu/esco/occupation/faed411a-f920-4100-86a8-b877928b429c";
        }
        else if (!req.body.skill)//search for career? 
        {
            res.json({ result: 'We do not have information for that career field yet.' });
        }

        let response = await fetch(myURL + uri, {headers: {'Accept': 'application/json'} });
        let data = await response.json();
        if (!req.body.skill)
        {
            res.json({result: data.description.en.literal});
        }
        else
        {
            let skills = data._links.hasEssentialSkill.map((v) => {
                return `${v.title}`;
            });
            res.json({ result: `${req.body.skill}'s ` + skills.join(", ") });
        }
    }
    else if (req.body.type == 'discovery') {
        const discovery = new DiscoveryV1({
            version: process.env.DISCOVERY_VERSION,
            authenticator: new IamAuthenticator({
                apikey: process.env.DISCOVERY_API_KEY,
            }),
            serviceUrl: process.env.DISCOVERY_URL,
        });
        
        let queryParams = {
            'environmentId': process.env.DISCOVERY_ENV,
            'collectionId': process.env.DISCOVERY_COL,
            'naturalLanguageQuery': req.body.job,
            'passages': true,
            'passagesCount': 3,
        };

        try {
            data = await discovery.query(queryParams);
            
            // get passage ids
            /*var ids = [];
            for(var i = 0; i < data.result.passages.length; i++) {
                ids.push(data.result.passages[i].document_id)
            }

            queryParams = {
                'environmentId': process.env.DISCOVERY_ENV,
                'collectionId': process.env.DISCOVERY_COL,
            };
            all = await discovery.query(queryParams);

            console.log(ids)
            // data = data.result.results.filter(id => {
            //     ids.includes(id.id);
            // })

            all.result.results.map(id =>{
                if (id.includes(id.id))
                    console.log(id.id)
            })
            res.json(data)*/

            let response = data.result.passages.map((v, i) => {
                return `${v.document_id}
                        ${v.passage_text}`;
                        // ${v.url}`;
                });
            res.json( {
                result: 
                `Here are some ${req.body.job}'s we can provide to you. \n\n` +
                    response.join("\n\n"),
            });
        } catch (err) {
            res.json({error: "it failed : " + err });
        }
    }
    else if (req.body.type == 'contact') {
        // save this email to contact page

        var con = mysql.createConnection({
            host: "localhost",
            user: "dorian",
            password: "sgUHJSUydyT2ruB", 
            database: 'chatContact'
        });

        con.connect(function(err) {
            if (err) 
                res.json({'success': false, 'error': err});
            else
                res.json({'success': true});
        });

        var query = `INSERT INTO emails (address) VALUES ('${req.body.email}')`
    
        con.query(query, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    
    }
    else {
        res.json({'success': false});
    }
    
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
})



