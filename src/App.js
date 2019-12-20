import React from 'react';
import axios from 'axios';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: false,
      isError: false,
      searchTerm: localStorage.getItem('search') || 'React',
    };

    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleFetchStories = this.handleFetchStories.bind(this);
    this.handleRemoveStory = this.handleRemoveStory.bind(this);
  }

  componentDidMount() {
    this.handleFetchStories();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchTerm !== this.state.searchTerm) {
      localStorage.setItem('search', this.state.searchTerm);
    }
  }

  handleSearchInput(event) {
    this.setState({ searchTerm: event.target.value });
  }

  handleSearchSubmit(event) {
    this.handleFetchStories();

    event.preventDefault();
  }

  handleRemoveStory(item) {
    const newStories = this.state.data.filter(
      story => item.objectID !== story.objectID
    );

    this.setState({ data: newStories });
  }

  async handleFetchStories() {
    this.setState({ isLoading: true, isError: false });

    try {
      const result = await axios.get(
        `${API_ENDPOINT}${this.state.searchTerm}`
      );

      this.setState({
        data: result.data.hits,
        isLoading: false,
        isError: false,
      });
    } catch {
      this.setState({ isLoading: false, isError: true });
    }
  }

  render() {
    const { searchTerm, data, isLoading, isError } = this.state;

    return (
      <div>
        <h1>My Hacker Stories</h1>

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={this.handleSearchInput}
          onSearchSubmit={this.handleSearchSubmit}
        />

        <hr />

        {isError && <p>Something went wrong ...</p>}

        {isLoading ? (
          <p>Loading ...</p>
        ) : (
          <List list={data} onRemoveItem={this.handleRemoveStory} />
        )}
      </div>
    );
  }
}

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
);

class InputWithLabel extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.isFocused) {
      this.inputRef.current.focus();
    }
  }

  render() {
    const {
      id,
      value,
      type = 'text',
      onInputChange,
      children,
    } = this.props;

    return (
      <>
        <label htmlFor={id}>{children}</label>
        &nbsp;
        <input
          ref={this.inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onInputChange}
        />
      </>
    );
  }
}

const List = ({ list, onRemoveItem }) =>
  list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ));

const Item = ({ item, onRemoveItem }) => (
  <div>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </div>
);

export default App;
