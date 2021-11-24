const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const redirectEndpoint =
      "https://cannabis.ca.gov/wp-json/redirection/v1/export-public/1/json";

    let output = await fetch(redirectEndpoint, {}).then((response) =>
      response.json()
    );
    delete output.plugin.date; // purpose of this proxy is to remove this hourly updating date field

    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(output),
    };
  } catch (error) {
    console.log(error);
    context.res = {
      body: error
    };
  }
};
