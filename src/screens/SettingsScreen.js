import React from "react";
import "./App.css";
import {
    Link,
    withRouter
} from "react-router-dom";
import Divider from '@mui/material/Divider';


class SettingsScreen extends React.Component {
    render () {
        return (
            <div className="App">
                <header className='App-header'>
                    <h2>Settings</h2>
                </header>
                <Divider />
                <footer className='App-footer'>
                    <Divider />
                    <Link to="/">
                        <button className="Nav-button">Go back</button>
                    </Link>
                </footer>
            </div>
        );
    }
    
}

export default withRouter(SettingsScreen);