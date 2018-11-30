import React, { Component } from 'react';
import './App.css';
import NavBar from './components/NavBar/NavBar'
import SearchBar from './components/SearchBar/SearchBar'

class App extends Component {
  state = {
    albums: [],
    artists: [],
    loading: true,
    query: '',
    tracks: '',
    trackName: '',
    player: '',
    image: '',
    newImage: '',
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
        trackName: response.tracks.items[0].name,
        newImage: response.tracks.items[0].album.images[0].url
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
        <div id="search">
          <h2>Upload your image!</h2>
          <form onSubmit={this.handleUserImage}>
            <input onChange={this.handleShowImage} type="file" ref={this.uploadInput}></input>
            <button>Upload</button>
          </form>
        </div>
        <div id="images">
          <img ref={this.userImage}></img>
          {this.state.newImage
            ? <img src={this.state.newImage} alt="picture"></img>
            : <p></p>}
        </div>
        <div id="player">
          {
            this.state.artists.map(artist =>
              <h3 key={Math.random() * 100}>{artist.name}</h3>
            )
          }

          <h3 >{this.state.trackName}</h3>
          {this.state.tracks
            ? <iframe src={`https://open.spotify.com/embed/track/${this.state.tracks}`} width="200" height="280" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
            : <p style={{ color: "white" }}></p>
          }
        </div>
        <footer></footer>
      </div >
    );
  }
}
export default App;
