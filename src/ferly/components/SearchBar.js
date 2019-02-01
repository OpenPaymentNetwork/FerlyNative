import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import {createUrl} from 'ferly/utils/fetch'
import {TextInput, View, StyleSheet} from 'react-native'

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
    const query = text[0] === '@' ? text.slice(1) : text
    if (query === '') {
      onSearch(null)
    } else {
      fetch(createUrl(url, {query: query}))
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
      <View style={styles.container}>
        <Icon
          name="search"
          color="black"
          style={{paddingHorizontal: 12}}
          size={20} />
        <TextInput
          underlineColorAndroid='transparent'
          style={styles.input}
          onChangeText={this.onSearch.bind(this)}
          value={this.state.searchText}
          placeholder="Search" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 9,
    borderColor: '#E4E4E4',
    maxHeight: 70
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    fontSize: 22
  }
})

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired
}
