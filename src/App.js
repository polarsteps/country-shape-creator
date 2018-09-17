import React, { Component } from 'react';
import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Country Shape generator</h1>
                </header>
                <div className="App-intro">
                    <label>
                        Load a GeoJsonFile with countries info:

                        <input
                            accept=".geojson, .json"
                            type="file"
                            onChange={
                                (event) => {
                                    const reader = new FileReader();
                                    reader.onload = onReaderLoad;
                                    reader.readAsText(event.target.files[0]);

                                    function onReaderLoad(event2){
                                        var obj = JSON.parse(event2.target.result);
                                        console.log(obj);
                                    }
                                }
                            }/>
                    </label>
                </div>
            </div>
        );
    }
}

export default App;
