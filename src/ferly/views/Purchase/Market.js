/* eslint-disable react/no-unescaped-entities */
import Avatar from 'ferly/components/Avatar';
import SearchBar from 'ferly/components/SearchBar';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import Icon from 'react-native-vector-icons/FontAwesome';
import I from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import TestElement from 'ferly/components/TestElement';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post} from 'ferly/utils/fetch';
import {
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions
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
          if (json.error || json.invalid) {
            const text = {'text': 'Unsuccessful search market'};
            post('log-info', this.props.deviceToken, text)
              .then((response) => response.json())
              .then((responseJson) => {
              })
              .catch(() => {
                console.log('log error');
              });
          }
          if (this.state.searchText === text) { // The customer is done typing.
            this.setState({searchResults: json.results});
          }
        })
        .catch(() => {
          const text = {'text': 'Call failed: search market'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error trying to search!');
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
        .catch(() => {
          Alert.alert('Error please check internet connection!');
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
        <ScrollView keyboardShouldPersistTaps='handled' style={{flex: 1}}>
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
                      size={width > 600 ? 40 : 30}
                      pictureUrl={design.logo_image_url}/>
                    <View style={{flex: 1, paddingHorizontal: 10}}>
                      <Text style={{fontSize: width > 600 ? 22 : 18, fontWeight: 'bold'}}>
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
        <TestElement
          parent={View}
          label='test-id-navbar'
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: width > 600 ? 95 : 75,
            width: width
          }}>
          <TouchableOpacity
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              width: width / 4
            }}
            onPress={() => this.props.navigation.navigate('Home')}>
            <I
              name="md-wallet"
              color={Theme.darkBlue}
              size={width < 330 ? 16 : 18 && width > 600 ? 24 : 18} />
            <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 16}}>
                Wallet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#C7EAEA',
              width: width / 4
            }}
            onPress={() => this.props.navigation.navigate('Market')}>
            <Icons
              name="store-alt"
              color={Theme.darkBlue}
              size={width < 330 ? 16 : 18 && width > 600 ? 24 : 18} />
            <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 16}}>
                Shop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              width: width / 4
            }}
            onPress={() => this.props.navigation.navigate('History')}>
            <Icon
              name="history"
              color={Theme.darkBlue}
              size={width < 330 ? 16 : 18 && width > 600 ? 24 : 18} />
            <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 16}}>
                History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              width: width / 4
            }}
            onPress={() => this.props.navigation.navigate('Menu')}>
            <Icon
              name="bars"
              color={Theme.darkBlue}
              size={width < 330 ? 16 : 18 && width > 600 ? 24 : 18} />
            <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 16}}>
                Menu
            </Text>
          </TouchableOpacity>
        </TestElement>
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

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
    height: width > 600 ? 80 : 70,
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
