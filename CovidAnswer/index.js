const fetch = require('node-fetch');
const marked = require('marked');

module.exports = async function (context, req) {

    const urls = ["https://qa-go-covid-001.azurewebsites.net/qnamaker/knowledgebases/714baa2f-18e8-4849-9d7d-6645e954aea0/generateAnswer"];

    if ((req.query && req.query.q) || (req.body && req.body.q)) {
        let query = req.query.q;
        if(!query) query = req.body.q;

        let lang = '';
        // check for presence of lang param.  if used, we assume a large knowledgebase 
        // and filter results appropriate for the language in use
        if (('lang' in req.query) || ('body' in req && 'lang' in req.body)) {
            lang = req.query.lang;
            if(!lang) lang = req.body.lang;
            // DEBUG DEBUG DEBUG
            // This will allow non-english search to work on staging until we roll out the code
            // across master and preprod.  This points to an alternate knowledgebase that contains 
            // a full crawl including non-english pages (~2300 questions). We can't perform this
            // crawl on the main knowledgebase until other code is deployed.
            urls[0] = 'https://qa-go-covid-001.azurewebsites.net/qnamaker/knowledgebases/7c68948f-06d8-4c18-aa71-c7340e32f34f/generateAnswer';
        }

        let limit = lang == ''? 15 : 200; // for language-specified search, there are roughly 7x search results

        let data = unMarkDown(await getAllUrls(urls, query, limit));
        if (lang != '') {
            const supported_languages = {
            'es-ES':{search:/^https:\/\/covid19.ca.gov\/es\//},
            'es':{search:/^https:\/\/covid19.ca.gov\/es\//},
            'ar':{search:/^https:\/\/covid19.ca.gov\/ar\//},
            'ar':{search:/^https:\/\/covid19.ca.gov\/ar\//},
            'ko':{search:/^https:\/\/covid19.ca.gov\/ko\//},
            'tl':{search:/^https:\/\/covid19.ca.gov\/tl\//},
            'vi':{search:/^https:\/\/covid19.ca.gov\/vi\//},
            'zh-hans':{search:/^https:\/\/covid19.ca.gov\/zh-hans\//},
            'zh-hant':{search:/^https:\/\/covid19.ca.gov\/zh-hant\//},
            'zh-Hans':{search:/^https:\/\/covid19.ca.gov\/zh-hans\//},
            'zh-Hant':{search:/^https:\/\/covid19.ca.gov\/zh-hant\//},
            };
            let answers = data[0].answers;
            if (lang == 'en-US' || !(lang in supported_languages)) {
                // For English pages, or unknown-languages, filter out ALL non-english results
                const skip_pattern = /^https:\/\/covid19.ca.gov\/(es|ar|ko|tl|vi|zh-hans|zh-hant)\//;
                answers = answers.filter( ans => !(ans.source.match(skip_pattern)));
            }
            else {
				// For supported non-English pages, filter on the desired language
				if (lang in supported_languages) {
					// console.log("Skipping non ",lang);
					const match_pattern = supported_languages[lang].search;
					answers = answers.filter( ans => (ans.source.match(match_pattern)));
				} else {
                    // should never happen due to prior conditions
				    console.log("Unknown language, should not happen", lang);
				}
			}
            if (answers.length > 15) {
                answers.splice(15);
            }
            data[0].answers = answers;
        }
        // console.log("Len Answers",data[0].answers.length);
        context.res = {
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass q on the query string or in the request body"
        };
    }
};

function unMarkDown(data) {
    data[0].answers.forEach(d => {
        d.answer = marked(d.answer)
    })
    return data;
}
async function getAllUrls(urls, q, limit) {
    try {
        var data = await Promise.all(
            urls.map(
                url =>
                    fetch(url, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          "Authorization": "EndpointKey c1b8855b-2919-47ec-9387-6d9cc64dcb41"
                        },
                        redirect: 'follow', 
                        body: JSON.stringify({'question':q, 'top':limit})
                      }).then(
                        (response) => response.json()
                    )));
        return (data)

    } catch (error) {
        
        console.log(error)

        throw (error)
    }
}


// try fetch first
// then request
// wrap in promise to do both
// get query from url
// review query with spaces

