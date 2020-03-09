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
      type: '',
      searchText: '',
      pendingToggle: false,
      otherToggle: true
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

  toggle () {
    testBool = !testBool;
    this.setState({pendingToggle: !this.state.pendingToggle});
  }

  toggleOther () {
    testingBool = !testingBool;
    this.setState({otherToggle: !this.state.otherToggle});
  }

  onChangeText (text) {
    this.setState({searchText: text.toLowerCase()});
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
      const dateDisplay = formatDate(date, 'MMM D');
      let typeTitle;
      if (item.transfer_type === 'pending') {
        typeTitle = 'pending gift';
      } else if (item.transfer_type === 'send') {
        typeTitle = 'send gift';
      } else if (item.transfer_type === 'purchase') {
        typeTitle = 'add';
      } else if (item.transfer_type === 'canceled') {
        typeTitle = 'canceled gift';
      } else if (item.transfer_type === 'receive') {
        typeTitle = 'receive gift';
      } else if (item.transfer_type === 'redeem') {
        typeTitle = 'spend';
      }
      if (
        dateDisplay.toLowerCase().includes(this.state.searchText) ||
        typeTitle.toLowerCase().includes(this.state.searchText) ||
        item.amount.toLowerCase().includes(this.state.searchText)) {
        if (item.transfer_type === 'pending') {
          pendList.push(item);
        } else {
          othList.push(item);
        }
      }
    });

    let otherList;
    if (!testingBool) {
      otherList = (
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={() => this.toggleOther()} style={{
            backgroundColor: Theme.lightBlue,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            height: 30
          }}>
            <Text>
              Completed
            </Text>
            <Icon
              name="angle-right"
              color="black"
              size={24} />
          </TouchableOpacity>
        </View>
      );
    } else if (othList.length > 0) {
      otherList = (
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={() => this.toggleOther()} style={{
            backgroundColor: Theme.lightBlue,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            height: 30
          }}>
            <Text>
              Completed
            </Text>
            <Icon
              name="angle-down"
              color="black"
              size={24} />
          </TouchableOpacity>
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
            keyboardShouldPersistTaps='handled'
            onRefresh={() => this.props.apiRefresh(urls.history)}
            refreshing={false}
            ListEmptyComponent={<Text style={{padding: 15}}>No transactions.</Text>}
            initialNumToRender={6}
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
      otherList = (
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={() => this.toggleOther()} style={{
            backgroundColor: Theme.lightBlue,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            height: 30
          }}>
            <Text>
              Completed
            </Text>
            <Icon
              name="angle-down"
              color="black"
              size={24} />
          </TouchableOpacity>
          <Text style={{padding: 10}}>No complete transactions at this time.</Text>
        </View>
      );
    }

    let pendingList;
    if (!testBool) {
      pendingList = (
        <View style={{flex: 0.2}}>
          <TouchableOpacity onPress={() => this.toggle()} style={{
            backgroundColor: Theme.lightBlue,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            height: 30
          }}>
            <Text>
              Pending
            </Text>
            <Icon
              name="angle-right"
              color="black"
              size={24} />
          </TouchableOpacity>
        </View>
      );
    } else if (pendList.length > 0) {
      pendingList = (
        <View style={{flex: pendList.length > 1 ? 1 : 0.5}}>
          <TouchableOpacity onPress={() => this.toggle()} style={{
            backgroundColor: Theme.lightBlue,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            height: 30
          }}>
            <Text>
              Pending
            </Text>
            <Icon
              name="angle-down"
              color="black"
              size={24} />
          </TouchableOpacity>
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
            keyboardShouldPersistTaps='handled'
            onRefresh={() => this.props.apiRefresh(urls.history)}
            refreshing={false}
            ListEmptyComponent={<Text style={{padding: 15}}>No pending transactions.</Text>}
            initialNumToRender={10}
            getItemLayout={(data, index) => (
              {length: 90, offset: index * 90, index})}
            onEndReached={(info) => this.loadMore()}
            onEndReachedThreshold={10}
            keyExtractor={(entry) => entry.timestamp}
            data={pendList}
            renderItem={
              (entry) => (
                <HistoryEntry navigation={navigation} entry={entry.item} />
              )} />
        </View>
      );
    } else {
      pendingList = (
        <View style={{flex: 0.3}}>
          <TouchableOpacity onPress={() => this.toggle()} style={{
            backgroundColor: Theme.lightBlue,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            height: 30
          }}>
            <Text>
              Pending
            </Text>
            <Icon
              name="angle-down"
              color="black"
              size={24} />
          </TouchableOpacity>
          <Text style={{padding: 10}}>No pending transactions at this time.</Text>
        </View>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'space-between'}}>
        <SearchBar
          value={this.state.searchText}
          placeholder='Search'
          onChangeText={this.onChangeText.bind(this)}/>
        {pendingList}
        {otherList}
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

let fullHistory = [];
let pendList = [];
let othList = [];
let testBool = false;
let testingBool = true;
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
