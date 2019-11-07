/* eslint-disable react/no-unescaped-entities */
import Avatar from 'ferly/components/Avatar';
import SearchBar from 'ferly/components/SearchBar';
import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post} from 'ferly/utils/fetch';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet
} from 'react-native';

export class Market extends React.Component {
  static navigationOptions = {
    title: 'Marketplace'
  };

  constructor (props) {
    super(props);
    this.state = {
      searchResults: null,
      searchText: ''
    };
  }

  componentDidMount () {
    this.props.apiRequire(this.props.designsUrl);
  }

  onChangeText (text) {
    if (text === '') {
      this.setState({searchResults: null});
    } else {
      fetch(createUrl('search-market', {query: text}), {
        headers: {
          Authorization: 'Bearer ' + this.props.deviceToken
        }})
        .then((response) => response.json())
        .then((json) => {
          if (this.state.searchText === text) { // The customer is done typing.
            this.setState({searchResults: json.results});
          }
        });
    }
    this.setState({searchText: text});
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Market'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
    const {designs, navigation} = this.props;
    const {searchResults} = this.state;
    let body;
    if (searchResults && searchResults.length === 0) {
      body = (
        <Text style={styles.noResults}>
          We're sorry, no results found.
        </Text>
      );
    } else {
      const display = searchResults || designs;
      body = (
        <ScrollView style={{flex: 1}}>
          {
            display.map((design) => {
              return (
                <TestElement
                  parent={TouchableOpacity}
                  label='test-id-market-merchant'
                  key={design.id}
                  onPress={() => navigation.navigate('Purchase', {design})}>
                  <View style={styles.customer}>
                    <Avatar
                      size={30}
                      pictureUrl={design.logo_image_url}/>
                    <View style={{flex: 1, paddingHorizontal: 10}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        {design.title}
                      </Text>
                    </View>
                  </View>
                </TestElement>
              );
            })
          }
        </ScrollView>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <SearchBar
          placeholder='Search for gift value'
          onChangeText={this.onChangeText.bind(this)} />
        {body}
      </View>
    );
  }
}

let count = 0;

Market.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  designs: PropTypes.array.isRequired,
  designsUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  noResults: {paddingHorizontal: 20},
  customer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15
  }
});

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const designsUrl = createUrl('list-designs');
  const apiStore = state.api.apiStore;
  const designs = apiStore[designsUrl] || [];

  return {
    designsUrl,
    designs,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Market);
