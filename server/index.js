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
var authorizationCode =
    'AQAgjS78s64u1axMCBCRA0cViW_ZDDU0pbgENJ_-WpZr3cEO7V5O-JELcEPU6pGLPp08SfO3dnHmu6XJikKqrU8LX9W6J11NyoaetrXtZFW-Y58UGeV69tuyybcNUS2u6eyup1EgzbTEx4LqrP_eCHsc9xHJ0JUzEhi7xcqzQG70roE4WKM_YrlDZO-e7GDRMqunS9RMoSwF_ov-gOMpvy9OMb7O58nZoc3LSEdEwoZPCLU4N4TTJ-IF6YsQRhQkEOJK';
//instatiate New Spotify
// credentials are optional
let spotifyApi = new SpotifyWebApi({
    clientId: '8c5b0b3a7a2946c99a1f263a9fe7afbe',
    clientSecret: '4355750f8eff498bbb189804984be87f',
    redirectUri: 'http://localhost:8888'
})

app.use(cors())
    .use(cookieParser());

let tokenExpirationEpoch

spotifyApi.clientCredentialsGrant().then(
    (data) => {
        console.log(data)
        spotifyApi.setAccessToken(data.body['access_token'])
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        console.log("this is data.body!", data.body)

        // Save the amount of seconds until the access token expired
        tokenExpirationEpoch = new Date().getTime() / 1000 + data.body['expires_in'];
        console.log(
            'Retrieved token. It expires in ' +
            Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
            ' seconds!')
    },
    (error) => {
        console.log(error)
    }
);


// Continually print out the time left until the token expires..
let numberOfTimesUpdated = 0;

setInterval(function () {
    console.log(
        'Time left: ' +
        Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
        ' seconds left!'
    );

    // OK, we need to refresh the token. Stop printing and refresh.
    if (++numberOfTimesUpdated > 2) {
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
                console.log("this is err", err)
                console.log('Could not refresh the token!', err.message);
            }
        );
    }
}, 10000);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join(__dirname, './server/uploads')))


app.use(router)
console.log("running on 8888 my dude")
app.listen(8888)