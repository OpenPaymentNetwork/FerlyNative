import PropTypes from 'prop-types'
import React from 'react'
import {createUrl} from 'ferly/utils/fetch'
import {TextInput} from 'react-native'

export default class SearchBar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
      searchResults: null
    }
  }

  onSearch (text) {
    const {onSearch, url} = this.props
    if (text === '') {
      onSearch(null)
    } else {
      fetch(createUrl(url, {query: text}))
        .then((response) => response.json())
        .then((json) => {
          if (this.state.searchText === text) { // The user is done typing.
            onSearch(json.results)
          }
        })
    }
    this.setState({searchText: text})
  }

  render () {
    return (
      <TextInput
        underlineColorAndroid='transparent'
        style={{
          backgroundColor: 'white',
          borderColor: '#E4E4E4',
          borderWidth: 9,
          flex: 1,
          fontSize: 22,
          maxHeight: 70,
          paddingLeft: 30
        }}
        onChangeText={this.onSearch.bind(this)}
        value={this.state.searchText}
        placeholder="Search" />
    )
  }
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired
}
