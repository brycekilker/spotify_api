import React from "react";
import './NavBar.css'
const NavBar = (props) => {
    // setTimeout(() => {
    //     props.history.push('/about')
    // }, 2000)
    return (
        <nav className="nav">
            <div className="container">
                <ul>
                    <li>Login</li>
                    <li>Home</li>
                    <li>Playlists</li>
                </ul>
            </div>
        </nav>
    )
}

export default NavBar