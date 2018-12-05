require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const cors = require('cors');
const multer = require('multer')
const vision = require('@google-cloud/vision')
const { Storage } = require('@google-cloud/storage');
const querystring = require('querystring');
const randomString = require('./helpers/randomString')
const request = require('request'); // "Request" library
const STATE_KEY = require('./helpers/constants').STATE_KEY
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// app.use(multer().array())
const router = express.Router()

router.get('/', (req, res) => {
    res.json({})
})

if (process.env.NODE_ENV !== 'dev') {
    app.use(express.static('build'))
}

// Your Google Cloud Platform project ID
const client = new vision.ImageAnnotatorClient();
var tokenExpirationEpoch = 0

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.split('.')[0] + '.' + file.mimetype.split('/')[1])
    }
})

const upload = multer({ storage })


// Performs label detection on the image file
function labelImages(name, path = "img") {
    console.log('can i see anything?')
    return new Promise((resolve, reject) => {
        client
            .labelDetection(`./server/${path}/${name}`)
            .then(results => {
                console.log("these are broad labels", results[0].labelAnnotations)
                console.log("this is labels", results[0].labelAnnotations[1].description)
                const labels = results[0].labelAnnotations;
                resolve(labels[0].description)
            })
            .catch(err => {
                console.error('ERROR:', err);
                reject(err)
            });
    })
}
function getSpotifyTracks(tracks) {
    console.log("TRACKS!!!!", tracks)
    return spotifyApi.searchTracks(tracks, { limit: 10, offset: 20 })

}

router.post("/labelimage", upload.any(), async (req, res) => {
    const description = await labelImages(req.files[0]['filename'], "uploads")
    const stuff = await getSpotifyTracks(description)
        .then(
            function (data) {
                return data.body
            },
            function (err) {
                console.error(err);
            }
        );
    stuff.description = description
    console.log("this is stuff", stuff)
    res.send(stuff)

    function tokenExpirationSet(token) {
    }
})

/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */


var client_id = '8c5b0b3a7a2946c99a1f263a9fe7afbe'; // Your client id
var client_secret = '4355750f8eff498bbb189804984be87f'; // Your secret
var redirect_uri = 'https://salty-citadel-82640.herokuapp.com/'; // Your redirect uri

const credentials = {
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
}
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

const spotifyApi = new SpotifyWebApi(credentials)

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-playback-state';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    console.log("this is the 1st!", req.query)
    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);

            tokenExpirationEpoch =
                new Date().getTime() / 1000 + data.body['expires_in'];
            console.log(
                'Retrieved token. It expires in ' +
                Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                ' seconds!'
            );
            if (tokenExpirationEpoch) {
                setInterval(function () {
                    console.log(
                        'Time left: ' +
                        Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                        ' seconds left!'
                    );

                    // OK, we need to refresh the token. Stop printing and refresh.
                    if (++numberOfTimesUpdated > 5) {
                        clearInterval(this);

                        // Refresh token and print the new time to expiration.
                        spotifyApi.refreshAccessToken().then(
                            function (data) {
                                tokenExpirationEpoch =
                                    new Date().getTime() / 1000 + data.body['expires_in'];
                                console.log(
                                    'Refreshed token. It now expires in ' +
                                    Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                                    ' seconds!'
                                );
                            },
                            function (err) {
                                console.log('Could not refresh the token!', err.message);
                            }
                        );
                    }
                }, 600000);

            }

        },
        function (err) {
            console.log(
                'Something went wrong when retrieving the access token!',
                err.message
            );
        }
    );
});


var numberOfTimesUpdated = 0;

app.use(router)
console.log('Listening on 8888');
app.listen(process.env.PORT || 8888);
