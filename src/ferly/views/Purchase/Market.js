import Avatar from 'ferly/components/Avatar'
import SearchBar from 'ferly/components/SearchBar'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, TouchableOpacity, ScrollView, Text} from 'react-native'

export class Market extends React.Component {
  static navigationOptions = {
    title: 'Marketplace'
  };

  constructor (props) {
    super(props)
    this.state = {
      searchResults: null,
      searchText: ''
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.designsUrl)
  }

  onChangeText (text) {
    if (text === '') {
      this.setState({searchResults: null})
    } else {
      fetch(createUrl('search-market', {query: text}))
        .then((response) => response.json())
        .then((json) => {
          if (this.state.searchText === text) { // The customer is done typing.
            this.setState({searchResults: json.results})
          }
        })
    }
    this.setState({searchText: text})
  }

  render () {
    const {designs, navigation} = this.props
    const display = this.state.searchResults || designs
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <SearchBar
          placeholder='Search for gift value'
          onChangeText={this.onChangeText.bind(this)} />
        <ScrollView style={{flex: 1}}>
          {
            display.map((design) => {
              return (
                <TouchableOpacity
                  key={design.id}
                  onPress={() => navigation.navigate('Purchase', {design})}>
                  <View style={{
                    flexDirection: 'row',
                    height: 90,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 15
                  }}>
                    <Avatar
                      size={68}
                      shade={true}
                      pictureUrl={design.logo_image_url}/>
                    <View style={{flex: 1, paddingHorizontal: 10}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        {design.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          }
        </ScrollView>
      </View>
    )
  }
}

Market.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  designs: PropTypes.array.isRequired,
  designsUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const designsUrl = createUrl('list-designs')
  const apiStore = state.api.apiStore
  const designs = apiStore[designsUrl] || []

  return {
    designsUrl,
    designs
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Market)
