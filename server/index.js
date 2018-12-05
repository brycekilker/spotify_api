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

// Your Google Cloud Platform project ID
const client = new vision.ImageAnnotatorClient();

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
    //return new promise from label images function and resolve it with the label[0] and pass it to spotify call.
})
//instatiate New Spotify
// credentials are optional
// let spotifyApi = new SpotifyWebApi({
//     clientId: '8c5b0b3a7a2946c99a1f263a9fe7afbe',
//     clientSecret: '4355750f8eff498bbb189804984be87f',
//     redirectUri: 'http://localhost:8888'
// })
// var scopes = ['user-read-private', 'user-read-email'],
//     redirectUri = 'http://localhost:8888/callback',
//     clientId = '8c5b0b3a7a2946c99a1f263a9fe7afbe',
//     state = 'some-state-of-my-choice';

// // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
// var spotifyApi = new SpotifyWebApi({
//     redirectUri: redirectUri,
//     clientId: clientId
// });

// Create the authorization URL

// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
// console.log(authorizeURL);

router.get("/callback", (req, res) => {
    console.log("hello")

    res.redirect('/')
})

var credentials = {
    clientId: '8c5b0b3a7a2946c99a1f263a9fe7afbe',
    clientSecret: '4355750f8eff498bbb189804984be87f',
    redirectUri: 'http://localhost:8888/callback',
    scopes: ['user-read-private', 'user-read-email']
};

var spotifyApi = new SpotifyWebApi(credentials);

spotifyApi.clientCredentialsGrant().then(
    function (data) {
        console.log(data)
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function (err) {
        console.log(
            'Something went wrong when retrieving an access token',
            err.message
        );
    }
);


// Retrieve an access token and a refresh token
// spotifyApi.authorizationCodeGrant(code).then(
//     function (data) {
//         console.log('The token expires in ' + data.body['expires_in']);
//         console.log('The access token is ' + data.body['access_token']);
//         console.log('The refresh token is ' + data.body['refresh_token']);

//         // Set the access token on the API object to use it in later calls
//         spotifyApi.setAccessToken(data.body['access_token']);
//         spotifyApi.setRefreshToken(data.body['refresh_token']);
//     },
//     function (err) {
//         console.log('Something went wrong!', err);
//     }
// );
// clientId, clientSecret and refreshToken has been set on the api object previous to this call.
// spotifyApi.refreshAccessToken().then(
//     function (data) {
//         console.log('The access token has been refreshed!');

//         // Save the access token so that it's used in future calls
//         spotifyApi.setAccessToken(data.body['access_token']);
//     },
//     function (err) {
//         console.log('Could not refresh access token', err);
//     }
// );
app.use(cors())
    .use(cookieParser());



app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});




app.use(express.static(path.join(__dirname, './server/uploads')))


app.use(router)
console.log("running on 8888 my dude")
app.listen(8888)