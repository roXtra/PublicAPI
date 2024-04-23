const authConfig = {
    authURL: "https://login.microsoftonline.com",
    tenant: "<your tenant id>",
    clientId: "<your client id>",
    roxtraURL: "<your roxtra url>"
};

const serverPort = 3000;
let nonce;


const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const crypto = require('node:crypto');
const open = require('open');


// disable self signed certificate verification for local testing only
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})


function openLoginRequestInBrowser() {
    const challenge = createChallenge();
    nonce = crypto.randomUUID();

    console.log("Performing login in browser window...");

    // Authorization request made to Microsoft oauth2 endpoint (line breaks and backslashes for legibility only)
    // For detailed information about authentication request parameters, visit:
    // https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-id-token-as-well-or-hybrid-flow
    open(encodeURI(`${authConfig.authURL}/${authConfig.tenant}/oauth2/v2.0/authorize \
            ?client_id=${authConfig.clientId} \
            &response_type=code id_token \
            &redirect_uri=http://localhost:${serverPort} \
            &response_mode=form_post \
            &scope=api://${authConfig.clientId}/user_impersonation openid profile offline_access \
            &nonce=${nonce} \
            &code_challenge=${challenge} \
            &code_challenge_method=S256`));
}


function createChallenge() {
    const NUM_OF_BYTES = 22;
    const HASH_ALG = "sha256";
    const randomVerifier = crypto.randomBytes(NUM_OF_BYTES).toString('hex');
    const hash = crypto.createHash(HASH_ALG).update(randomVerifier).digest('base64');
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}


// checks if the token contains the nonce created during the login request
function verifyToken(azureToken) {
    let parsedToken = JSON.parse(Buffer.from(azureToken.split('.')[1], 'base64').toString());

    if (parsedToken.nonce == nonce) {
        return true;
    }
    else {
        console.log("Got different token than requested");
        console.log(`Exp: ${nonce} - Got: ${parsedToken.nonce}`);
        process.exit(1);
    }
}


function getRoxtraToken(azureToken) {
    console.log("Requesting roXtra endpoint to convert azure token into roXtra token...");
    fetch(`${authConfig.roxtraURL}/api/roxApi.svc/rests/AuthenticateByToken`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            "Token": azureToken
        }),
        agent: httpsAgent
    })
    .then(response => response.json())
    .then(response => {
        console.log("Got roXtra token")
        getUser(response.LoginToken);
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    })
}


// Notice how the given roXtra token is used as 'authtoken' in the header.
function getUser(roxtraToken) {
    console.log("Getting current user with roXtra token...");
    fetch(`${authConfig.roxtraURL}/api/roxApi.svc/rests/GetMyUser`, {
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "authtoken": roxtraToken
        },
        agent: httpsAgent
    })
    .then(response => response.json())
    .then(response => {
        console.log(response);
        let username = response.FirstName?.length > 0 ? response.FirstName : response.Login;
        console.log(`Got current user, hello ${username}!`);
        process.exit(0);
    })
    .catch(error => {
        console.log(error);
        process.exit(1);
    })
}


http.createServer((req, res) => {

    if (req.method == 'POST') {
        var data = ""
        req.on('data', chunk => {
            data += chunk
        })

        req.on('end', () => {
            const params = new URLSearchParams(data);

            if (params.has('id_token')) {
                console.log("Got Azure token");
                if (verifyToken(params.get('id_token'))) {
                    getRoxtraToken(params.get('id_token'));
                }
            }
        })
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('Azure login successful, see node console for details');
}).listen(serverPort);

openLoginRequestInBrowser();