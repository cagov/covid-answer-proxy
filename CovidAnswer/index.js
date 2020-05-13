const fetch = require('node-fetch');

module.exports = async function (context, req) {

    const urls = ["https://qa-go-covid-001.azurewebsites.net/qnamaker/knowledgebases/714baa2f-18e8-4849-9d7d-6645e954aea0/generateAnswer"];

    if (req.query.name || (req.body && req.body.name)) {
        let data = await getAllUrls(urls, req.query.q);
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
            body: "Please pass a name on the query string or in the request body"
        };
    }
};

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
                        body: JSON.stringify({'question':q, 'top': 5})
                      }).then(
                        (response) => response.json()
                    )));
        console.log('don')
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

