const fetch = require('node-fetch');
const marked = require('marked');

module.exports = async function (context, req) {

    const urls = ["https://qa-go-covid-001.azurewebsites.net/qnamaker/knowledgebases/714baa2f-18e8-4849-9d7d-6645e954aea0/generateAnswer"];

    if (req.query.q || (req.body && req.body.q)) {
        let query = req.query.q;
        if(!query) query = req.body.q;
        let data = unMarkDown(await getAllUrls(urls, query));
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
async function getAllUrls(urls, q) {
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
                        body: JSON.stringify({'question':q, 'top': 15})
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

