import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import axios from 'axios';

import App, { Item, List, SearchForm } from './App';

jest.mock('axios');

describe('Item', () => {
  const item = {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  };
  const handleRemoveItem = jest.fn();

  it('renders all properties', () => {
    const { getByText } = render(<Item item={item} />);

    expect(getByText('Jordan Walke')).toBeTruthy();
    expect(getByText('React')).toHaveAttribute(
      'href',
      'https://reactjs.org/'
    );
  });

  it('calls onRemoveItem on button click', () => {
    const { getByText } = render(
      <Item item={item} onRemoveItem={handleRemoveItem} />
    );

    fireEvent.click(getByText('Dismiss'));

    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
    expect(handleRemoveItem).toHaveBeenCalledWith(item);
  });
});

describe('List', () => {
  const list = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  it('renders two items', () => {
    const { getAllByText, getAllByRole, container } = render(
      <List list={list} />
    );

    expect(getAllByText('Dismiss').length).toBe(2);
    expect(getAllByRole('button').length).toBe(2);
    expect(container.querySelectorAll('button').length).toBe(2);
  });
});

describe('SearchForm', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };

  it('renders the input field with its value', () => {
    const { getByDisplayValue } = render(
      <SearchForm {...searchFormProps} />
    );

    expect(getByDisplayValue('React')).toBeTruthy();
  });

  it('renders the correct label', () => {
    const { getByLabelText } = render(
      <SearchForm {...searchFormProps} />
    );

    expect(getByLabelText('Search:')).toBeTruthy();
  });

  it('renders a submit button', () => {
    const { getByText } = render(<SearchForm {...searchFormProps} />);

    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onSearchInput on input field change', () => {
    const { getByDisplayValue } = render(
      <SearchForm {...searchFormProps} />
    );

    fireEvent.change(getByDisplayValue('React'), {
      target: { value: 'Redux' },
    });

    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
  });

  it('calls onSearchSubmit on button submit click', () => {
    const { getByText } = render(<SearchForm {...searchFormProps} />);

    fireEvent.submit(getByText('Submit'));

    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('App', () => {
  const list = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  it('succeeds fetching data with a list', async () => {
    const promise = Promise.resolve({
      data: {
        hits: list,
      },
    });

    axios.get.mockImplementationOnce(() => promise);

    const { queryByText, queryAllByText } = render(<App />);

    expect(queryByText(/Loading/)).toBeTruthy();

    await act(() => promise);

    expect(queryByText(/Loading/)).toBeFalsy();

    expect(queryByText('Jordan Walke')).toBeTruthy();
    expect(queryByText('Dan Abramov, Andrew Clark')).toBeTruthy();
    expect(queryAllByText('Dismiss').length).toBe(2);
  });

  it('fails fetching data with a list', async () => {
    const promise = Promise.reject();

    axios.get.mockImplementationOnce(() => promise);

    const { queryByText } = render(<App />);

    expect(queryByText(/Loading/)).toBeTruthy();

    try {
      await act(() => promise);
    } catch (error) {
      expect(queryByText(/Loading/)).toBeFalsy();
      expect(queryByText(/Something went wrong/)).toBeTruthy();
    }
  });

  it('removes a story from the list', async () => {
    const promise = Promise.resolve({
      data: {
        hits: list,
      },
    });

    axios.get.mockImplementationOnce(() => promise);

    const { queryByText, getAllByText } = render(<App />);

    await act(() => promise);

    expect(queryByText('Jordan Walke')).toBeTruthy();
    fireEvent.click(getAllByText('Dismiss')[0]);
    expect(queryByText('Jordan Walke')).toBeFalsy();
  });

  it('searches for specific items in the list', async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: list,
      },
    });

    const javascriptPromise = Promise.resolve({
      data: {
        hits: [
          {
            title: 'JavaScript',
            url: 'https://en.wikipedia.org/wiki/JavaScript',
            author: 'Brendan Eich',
            num_comments: 15,
            points: 10,
            objectID: 3,
          },
        ],
      },
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('React')) {
        return reactPromise;
      }

      if (url.includes('JavaScript')) {
        return javascriptPromise;
      }

      throw Error();
    });

    const { queryByText, queryByDisplayValue } = render(<App />);

    await act(() => reactPromise);

    expect(queryByDisplayValue('React')).toBeTruthy();
    expect(queryByDisplayValue('JavaScript')).toBeFalsy();

    expect(queryByText('Jordan Walke')).toBeTruthy();
    expect(queryByText('Dan Abramov, Andrew Clark')).toBeTruthy();
    expect(queryByText('Brendan Eich')).toBeFalsy();

    fireEvent.change(queryByDisplayValue('React'), {
      target: { value: 'JavaScript' },
    });

    expect(queryByDisplayValue('React')).toBeFalsy();
    expect(queryByDisplayValue('JavaScript')).toBeTruthy();

    fireEvent.submit(queryByText('Submit'));

    await act(() => javascriptPromise);

    expect(queryByText('Jordan Walke')).toBeFalsy();
    expect(queryByText('Dan Abramov, Andrew Clark')).toBeFalsy();
    expect(queryByText('Brendan Eich')).toBeTruthy();
  });
});
