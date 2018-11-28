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
                // console.log("this is labels", results[0].labelAnnotations)
                const labels = results[0].labelAnnotations;
                resolve(labels[0].description)
            })
            .catch(err => {
                console.error('ERROR:', err);
                reject(err)
            });
    })
}

router.post("/labelimage", upload.any(), async (req, res) => {
    console.log("this is reqbody", req.files)
    const description = await labelImages(req.files[0]['filename'], "uploads")
    getSpotifyTracks(description)
        .then(
            function (data) {
                res.send(data.body)
            },
            function (err) {
                console.error(err);
            }
        );
    //return new promise from label images function and resolve it with the label[0] and pass it to spotify call.
})

//instatiate New Spotify
// credentials are optional
let spotifyApi = new SpotifyWebApi({
    clientId: '8c5b0b3a7a2946c99a1f263a9fe7afbe',
    clientSecret: '4355750f8eff498bbb189804984be87f',
})

app.use(cors())
    .use(cookieParser());
spotifyApi.clientCredentialsGrant().then(
    (data) => {
        spotifyApi.setAccessToken(data.body['access_token'])
    },
    (error) => {
        console.log(error)
    }
)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join(__dirname, './server/uploads')))


router.route("/getalbum/:album")
    .get((req, res) => {
        // console.log(" get artist", req.params.artist)
        spotifyApi.searchAlbums(req.params.album, { limit: 1, offset: 20 })
            .then(
                function (data) {
                    // console.log('artist information');
                    res.send(data.body)
                },
                function (err) {
                    console.error(err);
                }
            );
    });
//  GET https://api.spotify.com/v1/artists/{id}
router.route("/getartist/:artist")
    .get((req, res) => {
        // console.log(" get artist", req.params.artist)
        spotifyApi.searchArtists(req.params.artist, { limit: 1, offset: 20 })
            .then(
                function (data) {
                    // console.log('artist information');
                    res.send(data.body)
                },
                function (err) {
                    console.error(err);
                }
            );
    });
// GET https://api.spotify.com/v1/tracks/{id}
router.route("/gettracks/:tracks")
    .get((req, res) => {
        getSpotifyTracks(req.params.tracks)
            .then(
                function (data) {
                    console.log('track information');
                    res.send(data.body)
                },
                function (err) {
                    console.error(err);
                }
            );
    });


function getSpotifyTracks(tracks) {
    return spotifyApi.searchTracks(tracks, { limit: 10, offset: 20 })

}

app.use(router)
console.log("running on 8888 my dude")
app.listen(8888)