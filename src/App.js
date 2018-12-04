import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    loading: true,
    tracks: '',
    trackName: '',
    player: '',
    image: '',
    newImage: '',
    name: '',
    placeHolder: {
      display: 'grid'
    },
    userImageId: ""
  }

  uploadInput = React.createRef()
  userImage = React.createRef()

  handleUserImage = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('file', this.uploadInput.current.files[0])
    fetch('/labelimage', { method: 'post', body: data }).then(res => res.json()).then((response) => {
      this.setState({
        tracks: [response.tracks.items[0].uri.split(":").pop(), response.tracks.items[1].uri.split(":").pop(), response.tracks.items[2].uri.split(":").pop()],
        trackName: [response.tracks.items[0].name, response.tracks.items[1].name, response.tracks.items[2].name],
        newImage: [response.tracks.items[0].album.images[0].url, response.tracks.items[1].album.images[0].url, response.tracks.items[2].album.images[0].url],
        description: response.description

      })
    })
  }
  handleShowImage = (e) => {
    const reader = new FileReader()
    reader.onload = (aImg => {
      this.setState({
        placeHolder: { display: 'none' },
        userImageId: "userImageId"
      })
      return (e) => {
        aImg.src = e.target.result
      }
    })(this.userImage.current)
    console.log('reader', e.currentTarget.files[0])
    reader.readAsDataURL(e.currentTarget.files[0])
  }
  handleChange = (e) => {
    this.setState({
      query: e.target.value
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
        <header>
          <span><u>S</u>poti<u>V</u>ision</span>
          <p id="headerText">Upload a photo to search songs based on it's content using the Spotify and Google Cloud Vision API</p>
        </header>
        <div className="searchContent">
          <h1 >Upload your image!</h1>
          <form onSubmit={this.handleUserImage}>
            <input onChange={this.handleShowImage} type="file" ref={this.uploadInput}></input>
            <button>Upload</button>
          </form>
        </div>

        <div className="search">
        </div>
        <div id="images">
          <img id={this.state.userImageId} ref={this.userImage}></img>
          <div style={this.state.placeHolder} className='emptyContainer'></div>
          Top Search Result: {this.state.description}

        </div>
        <div className="playerTitle">Tracks</div>
        <div id="player">
          {this.state.tracks
            ? <iframe id="iframe" src={`https://open.spotify.com/embed/track/${this.state.tracks[0]}`} frameBorder="1" allowtransparency="true" allow="encrypted-media"></iframe>
            : <div className='emptyContainer'>Waiting for image</div>
          }
          {this.state.tracks
            ? <iframe id="iframe" src={`https://open.spotify.com/embed/track/${this.state.tracks[1]}`} frameBorder="1" allowtransparency="true" allow="encrypted-media"></iframe>
            : <div className='emptyContainer'>Waiting for image</div>
          }
          {this.state.tracks
            ? <iframe id="iframe" src={`https://open.spotify.com/embed/track/${this.state.tracks[2]}`} frameBorder="1" allowtransparency="true" allow="encrypted-media"></iframe>
            : <div className='emptyContainer'>Waiting for image</div>
          }
        </div>
        <footer></footer>
      </div >
    );
  }
}
export default App;
