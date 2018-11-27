require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const vision = require('@google-cloud/vision')
const { Storage } = require('@google-cloud/storage');
const querystring = require('querystring');
const randomString = require('./helpers/randomString')
const request = require('request'); // "Request" library
const STATE_KEY = require('./helpers/constants').STATE_KEY
console.log(STATE_KEY)
const app = express()
const router = express.Router()

// Your Google Cloud Platform project ID
const client = new vision.ImageAnnotatorClient();
// Creates a client
const storage = new Storage()

// Makes an authenticated API request.
storage
    .getBuckets()
    .then((results) => {
        const buckets = results[0];

        console.log('Buckets:');
        buckets.forEach((bucket) => {
            getBucketFiles(bucket.name)
        });
    })
    .catch((err) => {
        console.error('ERROR:', err);
    });

function downloadFile(file) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("download file")
            const options = {
                destination: `./server/img/${file.name}`
            }
            await file.download(options)
            resolve()
            console.log("this is linke 42")
        } catch (err) {
            console.log("error", err)
            reject()
        }
    })

}
async function getBucketFiles(name) {
    const [files] = await storage.bucket(name).getFiles()
    await new Promise((resolve, reject) => {
        files.forEach(async (file, index) => {
            await downloadFile(file)
            if (index === files.length - 1) {
                resolve()
            }
        })
    })
    files.forEach(file => {
        labelImages(file.name)
    })
}

// Performs label detection on the image file
function labelImages(name) {
    console.log("this is the label images", name)
    client
        .labelDetection(`./server/img/${name}`)
        .then(results => {
            console.log("this is results", results)
            const labels = results[0].labelAnnotations;

            console.log('Labels:');
            labels.forEach(label => console.log(label.description));
        })
        .catch(err => {
            console.error('ERROR:', err);
        });

}











//instatiate New Spotify
// credentials are optional
let spotifyApi = new SpotifyWebApi({
    clientId: '8c5b0b3a7a2946c99a1f263a9fe7afbe',
    clientSecret: '4355750f8eff498bbb189804984be87f',
})

let client_id = '8c5b0b3a7a2946c99a1f263a9fe7afbe'
let client_secret = '4355750f8eff498bbb189804984be87f'
let redirect_uri = 'http://localhost:8888/callback'
//access token

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
//setting a range of information to get
// router.route("/getalbum/:albumid")
//     .get((req, res) => {
//         console.log("get album")
//         spotifyApi.getArtistAlbums(req.params.albumid, { limit: 1, offset: 20 })
//             .then(
//                 function (data) {
//                     console.log('Album information');
//                     res.send(data.body)
//                 },
//                 function (err) {
//                     console.error(err);
//                 }
//             );
//     });
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
        console.log("get track", req.params.tracks)
        spotifyApi.searchTracks(req.params.tracks, { limit: 10, offset: 20 })
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






// // router.route('/login')
// //     .get((req, res) => {
// //         var state = randomString(16);
// //         res.cookie(STATE_KEY, state);

// //         var scopes = ['user-read-private', 'user-read-email'];
// //         let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state)
// //         console.log(authorizeURL)
// //         res.redirect(authorizeURL);
// //     });

// // router.route('/callback')
// //     .get((req, res) => {
// //         console.log('callback!')
// //         // your application requests refresh and access tokens
// //         // after checking the state parameter

// //         var code = req.query.code || null;
// //         var state = req.query.state || null;
// //         var storedState = req.cookies ? req.cookies[STATE_KEY] : null;

// //         if (state === null || state !== storedState) {
// //             res.redirect('/#' +
// //                 querystring.stringify({
// //                     error: 'state_mismatch'
// //                 }));
// //         } else {
// //             res.clearCookie(STATE_KEY);
// //             var authOptions = {
// //                 url: 'https://accounts.spotify.com/api/token',
// //                 form: {
// //                     code: code,
// //                     redirect_uri: redirect_uri,
// //                     grant_type: 'authorization_code'
// //                 },
// //                 headers: {
// //                     'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
// //                 },
// //                 json: true
// //             };

// //             request.post(authOptions, function (error, response, body) {
// //                 if (!error && response.statusCode === 200) {

// //                     var access_token = body.access_token,
// //                         refresh_token = body.refresh_token;
// //                     spotifyApi.setAccessToken(access_token)
// //                     console.log(access_token)
// //                     var options = {
// //                         url: 'https://api.spotify.com/v1/me',
// //                         headers: { 'Authorization': 'Bearer ' + access_token },
// //                         json: true
// //                     };

// //                     // use the access token to access the Spotify Web API
// //                     request.get(options, function (error, response, body) {
// //                         console.log("this is line 108", body);
// //                     });

// //                     // we can also pass the token to the browser to make requests from there
// //                     res.redirect('/#' +
// //                         querystring.stringify({
// //                             access_token: access_token,
// //                             refresh_token: refresh_token
// //                         }));
// //                 } else {
// //                     res.redirect('/#' +
// //                         querystring.stringify({
// //                             error: 'invalid_token'
// //                         }));
// //                 }
// //             });
// //         }
// //     })

app.use(router)
console.log("running on 8888 my dude")
app.listen(8888)