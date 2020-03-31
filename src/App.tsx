import React from 'react';
import './App.scss';
import AddressSearchBar from "./components/AddressSearchBar/AddressSearchBar";

function App() {
    return (
        <div className="App">
            {
                [1, 2, 3].map((i) => {
                    return <AddressSearchBar key={i}/>;
                })
            }
        </div>
    );
}

export default App;
