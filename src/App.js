import * as React from 'react';

function welcome(title) {
  return title;
}

function App() {
  return (
    <div>
      <h1> Hello {welcome('React')}</h1>

      <label htmlFor="search">Search: </label>
      <input id="search" type="text" />
    </div>
  );
}

export default App;
