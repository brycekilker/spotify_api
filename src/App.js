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
        <NavBar />
        {/* <button onClick={this.getAlbum}> Get Album </button> */}
        {this.state.albums.map(album =>
          <h3 className="content" key={Math.floor(Math.random() * 100)}><div>{album.name}</div></h3>
        )}
        <SearchBar handleSubmit={this.handleSubmit} handleChange={this.handleChange} query={this.state.query} />

        <button onClick={this.getPlayer}>what a button</button>
        {
          this.state.artists.map(artist =>
            <h3 key={Math.random() * 100}>{artist.name}</h3>
            //Nail down what information exactly I want to retrieve and display
          )
        }
        <button onClick={this.getImage}>image</button>

        <img src={this.state.image} alt="picture"></img>
        {this.state.player
          ? <iframe src={`https://open.spotify.com/embed/artist/${this.state.player}`} width="200" height="280" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
          : <p style={{ color: "white" }}></p>
        }
        <form onSubmit={this.handleUserImage}>
          <input onChange={this.handleShowImage} type="file" ref={this.uploadInput}></input>
          <button>Upload</button>
        </form>
        <h3 style={{ color: "white" }}>{this.state.trackName}</h3>
        {this.state.tracks
          ? <iframe src={`https://open.spotify.com/embed/track/${this.state.tracks}`} width="200" height="280" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
          : <p style={{ color: "white" }}></p>
        }
        <img width="100" height="100" ref={this.userImage}></img>
        {/* {this.state.tracks
          ? <a href={this.state.tracks.spotify}>Link to an more songs!</a>
          : <p style={{ color: "white" }}> Search for an artist</p>
        } */}
      </div >
    );
  }
}
export default App;
