import React from "react";
import "./App.css";
import {
    Link,
    withRouter
} from "react-router-dom";

class SignInScreen extends React.Component {
    render () {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Sign In Screen Screen</h1>
                </header>
            </div>
        );
    }
    
}

export default withRouter(SignInScreen);