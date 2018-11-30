import React, { Component } from 'react';
import './App.css';
import NavBar from './components/NavBar/NavBar'
import SearchBar from './components/SearchBar/SearchBar'
// import GetAuth from './components/GetAuth/GetAuth'


//make function to get spotify access token client.createaccesstoken
//ideally build component that handles the spotify communicaiton

class App extends Component {
  state = {
    albumId: "43ZHCT0cAZBISjO8DG9PnE",
    albums: [],
    artists: [],
    loading: true,
    query: '',
    tracks: '',
    trackName: '',
    player: '',
    image: '',
  }

  uploadInput = React.createRef()
  userImage = React.createRef()

  handleUserImage = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('file', this.uploadInput.current.files[0])
    fetch('/labelimage', { method: 'post', body: data }).then(res => res.json()).then((response) => {
      this.setState({
        tracks: response.tracks.items[0].uri.split(":").pop(),
        trackName: response.tracks.items[0].name
      })
    })
  }
  handleShowImage = (e) => {
    const reader = new FileReader()
    reader.onload = (aImg => {
      return (e) => {
        aImg.src = e.target.result
      }
    })(this.userImage.current)
    reader.readAsDataURL(e.currentTarget.files[0])
  }
  handleChange = (e) => {
    this.setState({
      query: e.target.value
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.getArtist()
    this.getTrack()
  }
  getArtist = () => {
    fetch(`/getartist/${this.state.query}`).then(
      res => res.json()
    ).then(body => this.setState({
      artists: body.artists.items
    }))
  }
  getTrack = () => {
    fetch(`/gettracks/${this.state.query}`).then(
      res => res.json()
    ).then(body => this.setState({
      tracks: body.tracks.items[Math.floor(Math.random() * 10)].external_urls
    }))
  }
  getImage = () => {
    fetch(`/getartist/${this.state.query}`).then(
      res => res.json()
    ).then(body => this.setState({
      image: body.artists.items[0].images[0].url
    }))
  }
  getAlbum = () => {
    fetch(`/getalbum/${this.state.albumId}`).then(
      res => res.json()
    ).then(body => this.setState({
      albums: body.items
    }))
  }
  getPlayer = () => {
    this.setState({
      player: this.state.artists[0].uri.split(":").pop()
    })
  }
  authorize = (e) => {
    e.preventDefault();
    console.log('its working')
    fetch('/login')
  }
  render() {
    console.log(this.state)
    return (
      <div className="App" >
        <header>Spotivision</header>
        <div id='one'>1.<SearchBar handleSubmit={this.handleSubmit} handleChange={this.handleChange} query={this.state.query} /></div>
        <div id='two'>2.<button onClick={this.getPlayer}>what a button</button></div>
        <div id='three'>3. <button onClick={this.getImage}>image</button>
        </div>
        <div id='four'>4.
          {
            this.state.artists.map(artist =>
              <h3 key={Math.random() * 100}>{artist.name}</h3>
            )
          }</div>
        <div id='five'>5.{this.state.player
          ? <iframe src={`https://open.spotify.com/embed/artist/${this.state.player}`} width="200" height="280" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
          : <p style={{ color: "white" }}></p>
        } </div>
        <div id='six'>6.
          {this.state.image
            ? <img src={this.state.image} alt="picture"></img>
            : <p></p>}</div>
        <div id='seven'>7.
          <form onSubmit={this.handleUserImage}>
            <input onChange={this.handleShowImage} type="file" ref={this.uploadInput}></input>
            <button>Upload</button>
          </form></div>
        <div id='eight'>8. <h3 style={{ color: "white" }}>{this.state.trackName}</h3></div>
        <div id='nine'>9.
          {this.state.tracks
            ? <iframe src={`https://open.spotify.com/embed/track/${this.state.tracks}`} width="200" height="280" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            : <p style={{ color: "white" }}></p>
          }
        </div>
        <div id='ten'>10.<img width="100" height="100" ref={this.userImage}></img> </div>
        <footer></footer>
      </div >
    );
  }
}
export default App;
