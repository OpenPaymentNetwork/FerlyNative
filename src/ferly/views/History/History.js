import HistoryEntry from 'ferly/components/HistoryEntry';
import Spinner from 'ferly/components/Spinner';
import TestElement from 'ferly/components/TestElement';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import Icon from 'react-native-vector-icons/FontAwesome';
import I from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import {Alert, View, FlatList, Text, TouchableOpacity, Dimensions} from 'react-native';
import {apiRequire, apiInject, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {urls, post} from 'ferly/utils/fetch';

export class History extends React.Component {
  static navigationOptions = {
    title: 'History'
  };

  componentDidMount () {
    this.props.apiRequire(urls.history);
  }

  loadMore () {
    const {hasMore, history} = this.props;
    if (!hasMore) {
      return;
    }
    const nextUrl = `${urls.history}&offset=${history.length}`;
    fetch(nextUrl, {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.error || responseJson.invalid) {
          const text = {'text': 'Unsuccessful history'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        const newHistory = history.concat(responseJson.history);
        this.props.apiInject(urls.history, {
          'history': newHistory,
          'has_more': responseJson.has_more
        });
      })
      .catch(() => {
        const text = {'text': 'Call failed: history'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to load!');
      });
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'History'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {history, navigation} = this.props;
    if (!history) {
      return <Spinner />;
    }
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <FlatList
          keyboardShouldPersistTaps='handled'
          onRefresh={() => this.props.apiRefresh(urls.history)}
          refreshing={false}
          ListEmptyComponent={<Text>You have no history</Text>}
          initialNumToRender={10}
          getItemLayout={(data, index) => (
            {length: 90, offset: index * 90, index})}
          onEndReached={(info) => this.loadMore()}
          onEndReachedThreshold={10}
          keyExtractor={(entry) => entry.timestamp}
          data={history}
          renderItem={
            (entry) => (
              <HistoryEntry navigation={navigation} entry={entry.item} />
            )} />
        <View style={{height: width > 600 ? 95 : 75, width: width}}>
          <TestElement
            parent={View}
            label='test-id-navbar'
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 10
            }}>
            <TouchableOpacity
              style={{
                borderColor: 'white',
                height: width > 600 ? 100 : 80,
                paddingHorizontal: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
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
                height: width > 600 ? 100 : 80,
                paddingHorizontal: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
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
                height: width > 600 ? 100 : 80,
                paddingHorizontal: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#C7EAEA'
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
                height: width > 600 ? 100 : 80,
                paddingHorizontal: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
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
      </View>
    );
  }
}

let count = 0;
let {width} = Dimensions.get('window');

History.propTypes = {
  apiInject: PropTypes.func.isRequired,
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  navigation: PropTypes.object.isRequired,
  history: PropTypes.array,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const historyResponse = apiStore[urls.history] || {};
  const history = historyResponse.history;
  const hasMore = historyResponse.has_more;
  return {
    hasMore,
    history,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiInject,
  apiRequire,
  apiRefresh
};

export default connect(mapStateToProps, mapDispatchToProps)(History);
