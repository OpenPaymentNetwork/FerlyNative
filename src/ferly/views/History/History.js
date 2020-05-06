import HistoryEntry from 'ferly/components/HistoryEntry';
import SearchBar from 'ferly/components/SearchBar';
import Spinner from 'ferly/components/Spinner';
import TestElement from 'ferly/components/TestElement';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import Icon from 'react-native-vector-icons/FontAwesome';
import I from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import {format as formatDate} from 'date-fns';
import {Alert, View, FlatList, Text, TouchableOpacity, Dimensions} from 'react-native';
import {apiRequire, apiInject, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {urls, post} from 'ferly/utils/fetch';

export class History extends React.Component {
  static navigationOptions = {
    title: 'History'
  };

  constructor (props) {
    super(props);
    this.state = {
      page: 'Completed',
      type: '',
      searchText: ''
    };
  }

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

  onChangeText (text) {
    this.setState({searchText: text});
  }

  changeToCompleted () {
    this.onChangeText('');
    this.setState({page: 'Completed'});
  }

  changeToPending () {
    this.onChangeText('');
    this.setState({page: 'Pending'});
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
    pendList = [];
    othList = [];
    fullHistory = [];
    history.forEach(item => {
      fullHistory.push(item);
      const b = item.timestamp.split(/\D+/);
      const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]));
      const dateDisplay = formatDate(date, 'MMMM D');
      let typeTitle = '';
      if (item.transfer_type === 'pending') {
        typeTitle = 'Pending Gift';
      } else if (item.workflow_type === 'receive_ach_confirm') {
        typeTitle = 'ACH Confirmation';
      } else if (item.workflow_type === 'receive_ach_prenote') {
        typeTitle = 'ACH Confirmation';
      } else if (item.transfer_type === 'purchase') {
        typeTitle = 'Add';
      } else if (item.transfer_type === 'send') {
        typeTitle = 'Send Gift';
      } else if (item.transfer_type === 'add') {
        typeTitle = 'Add';
      } else if (item.transfer_type === 'canceled') {
        typeTitle = 'Canceled Gift';
      } else if (item.transfer_type === 'receive') {
        typeTitle = 'Receive Gift';
      } else if (item.transfer_type === 'redeem') {
        typeTitle = 'Spend';
      } else if (item.transfer_type === 'trade') {
        if (item.trade_Designs_Received[1] === 'Ferly Rewards') {
          typeTitle = 'Reward';
        } else {
          typeTitle = 'Purchase';
        }
      }
      if (
        dateDisplay.toLowerCase().includes(this.state.searchText.toLowerCase()) ||
        typeTitle.toLowerCase().includes(this.state.searchText.toLowerCase()) ||
        item.amount.toLowerCase().includes(this.state.searchText.toLowerCase())) {
        if (item.transfer_type === 'pending') {
          pendList.push(item);
        } else {
          othList.push(item);
        }
      }
    });

    let list;
    if (this.state.page === 'Completed') {
      if (othList.length > 0) {
        list = (
          <View style={{flex: 1}}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15
            }}>
              <Text style={{
                color: Theme.darkBlue,
                width: width / 3,
                fontSize: width < 350 ? 14 : 16 && width > 600 ? 19 : 16,
                fontWeight: 'bold',
                paddingTop: 10
              }}>
              Date
              </Text>
              <Text style={{
                color: Theme.darkBlue,
                width: width / 3,
                fontSize: width < 350 ? 14 : 16 && width > 600 ? 19 : 16,
                fontWeight: 'bold',
                paddingTop: 10
              }}>
              Type
              </Text>
              <Text style={{
                color: Theme.darkBlue,
                width: width / 3,
                textAlign: 'right',
                fontSize: width < 350 ? 14 : 16 && width > 600 ? 19 : 16,
                fontWeight: 'bold',
                paddingTop: 10,
                paddingRight: 30
              }}>
              Amount
              </Text>
            </View>
            <FlatList
              disableVirtualization={true}
              keyboardShouldPersistTaps='handled'
              onRefresh={() => this.props.apiRefresh(urls.history)}
              refreshing={false}
              ListEmptyComponent={<Text style={{padding: 15}}>No transactions.</Text>}
              initialNumToRender={20}
              getItemLayout={(data, index) => (
                {length: 90, offset: index * 90, index})}
              onEndReached={(info) => this.loadMore()}
              onEndReachedThreshold={5}
              keyExtractor={(entry) => entry.timestamp}
              data={othList}
              renderItem={
                (entry) => (
                  <HistoryEntry navigation={navigation} entry={entry.item} />
                )} />
          </View>
        );
      } else {
        list = (
          <View style={{flex: 1}}>
            <Text style={{padding: 10}}>No complete transactions at this time.</Text>
          </View>
        );
      }
    } else if (this.state.page === 'Pending') {
      if (pendList.length > 0) {
        list = (
          <View style={{flex: 1}}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15
            }}>
              <Text style={{
                color: Theme.darkBlue,
                fontSize: width < 350 ? 14 : 16 && width > 600 ? 19 : 16,
                fontWeight: 'bold',
                paddingTop: 10
              }}>
              Date
              </Text>
              <Text style={{
                color: Theme.darkBlue,
                fontSize: width < 350 ? 14 : 16 && width > 600 ? 19 : 16,
                fontWeight: 'bold',
                paddingTop: 10
              }}>
              Type
              </Text>
              <Text style={{
                color: Theme.darkBlue,
                fontSize: width < 350 ? 14 : 16 && width > 600 ? 19 : 16,
                fontWeight: 'bold',
                paddingTop: 10
              }}>
              Amount
              </Text>
            </View>
            <FlatList
              disableVirtualization={true}
              keyboardShouldPersistTaps='handled'
              onRefresh={() => this.props.apiRefresh(urls.history)}
              refreshing={false}
              ListEmptyComponent={<Text style={{padding: 15}}>No pending transactions.</Text>}
              initialNumToRender={20}
              getItemLayout={(data, index) => (
                {length: 90, offset: index * 90, index})}
              onEndReached={(info) => this.loadMore()}
              onEndReachedThreshold={5}
              keyExtractor={(entry) => entry.timestamp}
              data={pendList}
              renderItem={
                (entry) => (
                  <HistoryEntry navigation={navigation} entry={entry.item} />
                )} />
          </View>
        );
      } else {
        list = (
          <View style={{flex: 1}}>
            <FlatList
              disableVirtualization={true}
              keyboardShouldPersistTaps='handled'
              onRefresh={() => this.props.apiRefresh(urls.history)}
              refreshing={false}
              ListEmptyComponent={<Text style={{padding: 15}}>No pending transactions.</Text>}
              initialNumToRender={20}
              getItemLayout={(data, index) => (
                {length: 90, offset: index * 90, index})}
              onEndReached={(info) => this.loadMore()}
              onEndReachedThreshold={5}
              keyExtractor={(entry) => entry.timestamp}
              data={pendList}
              renderItem={
                (entry) => (
                  <HistoryEntry navigation={navigation} entry={entry.item} />
                )} />
          </View>
        );
      }
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'space-between'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: Theme.darkBlue
          }}>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-history-type-pending'
            style={{
              borderBottomWidth: this.state.page === 'Pending' ? 4 : 0,
              borderColor: 'white',
              height: width > 600 ? 70 : 50,
              width: width > 600 ? 190 : 170 && width < 350 ? 150 : 170,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => this.changeToPending()}>
            <Text style={{color: 'white', fontSize: width > 600 ? 18 : 16}}>
              Pending
            </Text>
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-history-type-complete'
            style={{
              borderBottomWidth: this.state.page === 'Completed' ? 4 : 0,
              borderColor: 'white',
              height: width > 600 ? 70 : 50,
              width: width > 600 ? 190 : 170 && width < 350 ? 150 : 170,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => this.changeToCompleted()}>
            <Text style={{color: 'white', fontSize: width > 600 ? 18 : 16}}>
              Completed
            </Text>
          </TestElement>
        </View>
        <SearchBar
          value={this.state.searchText}
          placeholder='Search'
          onChangeText={this.onChangeText.bind(this)}/>
        {list}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: width > 600 ? 95 : 75,
            width: width
          }}>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-navbar-wallet'
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
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-navbar-shop'
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
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
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-navbar-history'
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#C7EAEA',
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
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-navbar-menu'
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
          </TestElement>
        </View>
      </View>
    );
  }
}

let fullHistory = [];
let pendList = [];
let othList = [];
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
