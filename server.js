const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const fetch = require("node-fetch");
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

require('dotenv').config()

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/test', (req, res) => res.status(200).send('ok'));

app.post('/api/v1', async (req, res) => {
    console.log(req.body)
    if(req.body.type === 'esco')
    {
        var myURL = "https://ec.europa.eu/esco/api/resource/occupation?language=en&uri=";
        
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
            version: '2019-04-30',
            authenticator: new IamAuthenticator({
                apikey: 'pTWrqgHEIYgMZNi5Wbn0G6Cqa3rQ0eE5KaFLTwbNv--C',
            }),
            serviceUrl: 'https://api.us-east.discovery.watson.cloud.ibm.com/instances/ffd0ed75-874f-4502-a65d-613228f0a71a',
        });
        
        const queryParams = {
            'environmentId': '5d9c5d49-b689-49ef-9a37-05343b4c44ff',
            'collectionId': '4251e13c-9d02-40f6-9d41-9a21d6ca7148',
            'naturalLanguageQuery': req.body.job,
            'passages': true,
            'passagesCount': 3,
          };

        try {
            data = await discovery.query(queryParams);
            
            var ids = [];
            
            // for(var i = 0; i < data.passages.length; i++) {
            //    var obj = data.passages.document_id[i];
            //    ids.push(obj)
            //}
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
    else {
        res.json({'success': false});
    }
    
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`)
})



