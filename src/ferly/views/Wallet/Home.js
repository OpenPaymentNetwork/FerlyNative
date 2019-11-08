import accounting from 'ferly/utils/accounting';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import TestElement from 'ferly/components/TestElement';
import {apiRequire, apiRefresh} from 'ferly/store/api';
import {checkedUidPrompt} from 'ferly/store/settings';
import {connect} from 'react-redux';
import {urls, createUrl, post} from 'ferly/utils/fetch';
import {blankCard, logoHorizontal} from 'ferly/images/index';
import {
  Animated,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Alert,
  StyleSheet
} from 'react-native';

export class Wallet extends React.Component {
  static navigationOptions = {
    title: 'Wallet'
  }

  constructor () {
    super();
    this.array = [];
    this.state = {
      scrollY: new Animated.Value(
        Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0
      ),
      passed: '',
      refreshing: false
    };
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile);
    for (var i = 1; i <= 75; i++) {
      this.array.push(i);
    }
    fetch(createUrl('verify-address'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((json) => {
        this.setState({address: json});
        if (json['verified'] === 'yes') {
          this.setState({passed: 'true'});
        } else if (json['verified'] === 'no') {
          this.setState({passed: 'false'});
        } else if (json['error']) {
          this.setState({passed: 'false'});
        } else {
          this.setState({passed: ''});
        }
      });
  }

  renderScrollViewContent () {
    const data = Array.from({ length: 30 });
    return (
      <View style={styles.scrollViewContent}>
        {data.map((_, i) => (
          <View key={i} style={styles.row}>
            <Text>{i}</Text>
          </View>
        ))}
      </View>
    );
  }

  cardPage () {
    const {card} = this.props;
    const {passed} = this.state;
    if (!card) {
      if (passed === 'true') {
        return (
          'Activate Card'
        );
      } else if (passed === 'false' || '') {
        return (
          'Request Card'
        );
      }
    } else {
      return (
        'Manage Card'
      );
    }
  }

  renderCard (design, count) {
    const {navigation} = this.props;
    const {amount, id, title} = design;
    const formatted = accounting.formatMoney(parseFloat(amount));
    let color = 'white';
    let text = 'white';
    switch ((count % 6) + 1) {
      case 1: color = '#8FD6D6';
        text = '#1D3A54';
        break;
      case 2: color = '#5CB5B5';
        text = '#FFFFFF';
        break;
      case 3: color = '#C7EAEA';
        text = '#1D3A54';
        break;
      case 4: color = '#73CCCC';
        text = '#1D3A54';
        break;
      case 5: color = '#9DDBDB';
        text = '#1D3A54';
        break;
      case 6: color = '#4A9191';
        text = '#FFFFFF';
        break;
      default:break;
    }
    return (
      <TestElement
        parent={TouchableOpacity}
        label='test-id-cash-card'
        key={id}
        accessible={false}
        onPress={() => navigation.navigate('Value', design)}
        style={[styles.cardContainer, {borderColor: color}]}>
        <View style={[styles.cardImage, {backgroundColor: color}]}>
          <Text style={{fontSize: 22, color: text}}>{formatted}</Text>
        </View>
        <View style={[styles.cardDetails, {borderColor: color}]}>
          <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 15}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: Theme.darkBlue}}>{title}</Text>
          </View>
          <View style={[styles.buttonRow, {borderColor: color}]}>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-give-button'
              style={styles.cashButton}
              onPress={() => navigation.navigate('Give', design)}>
              <Icon
                style={{paddingRight: 8}}
                name="gift"
                color={Theme.darkBlue}
                size={18} />
              <Text style={{color: Theme.darkBlue, fontSize: 12, fontWeight: 'bold'}}>
                GIVE
              </Text>
            </TestElement>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-buy-button'
              style={[styles.cashButton, {borderLeftWidth: 1, borderColor: color}]}
              onPress={() => navigation.navigate('Purchase', {design})}>
              <Icon
                style={{paddingRight: 8}}
                name="credit-card"
                color={Theme.darkBlue}
                size={18} />
              <Text style={{color: Theme.darkBlue, fontSize: 12, fontWeight: 'bold'}}>
                BUY
              </Text>
            </TestElement>
          </View>
        </View>
      </TestElement>
    );
  }

  renderAmounts () {
    const amounts = this.props.amounts || [];
    if (amounts.length === 0) {
      return (
        <Text style={{marginTop: Platform.OS === 'ios' ? 20 : 235, margin: 20, fontSize: 18}}>
          There’s nothing here! Click ‘+’ below to purchase your first gift.
        </Text>
      );
    } else {
      return (
        <ScrollView
          style={{marginTop: Platform.OS === 'ios' ? 20 : 240}}
          refreshControl={
            <RefreshControl
              style={{position: 'absolute'}}
              refreshing={false}
              onRefresh={() => this.props.apiRefresh(urls.profile)}
            />
          }>
          {amounts.map((cashRow, index) => this.renderCard(cashRow, index))}
          <View style={{height: 80}} />
        </ScrollView>
      );
    }
  }

  showAddAccountRecoveryDialog () {
    const {navigation, amounts, uids, checkedUidPrompt} = this.props;
    if (uids.length > 0 || amounts.length === 0) {
      return;
    }
    const title = 'Add Account Recovery';
    const message = (
      'If you replace your phone or uninstall the app you\'ll need to ' +
      'recover your account using a verified email address or phone number. ' +
      'You may lose your gift value if account recovery is not set up prior ' +
      'to replacing your phone or uninstalling the app.'
    );
    const buttons = [
      {
        text: 'Close',
        onPress: () => checkedUidPrompt()
      },
      {
        text: 'Add',
        onPress: () => {
          checkedUidPrompt();
          navigation.navigate('Recovery');
        }
      }
    ];
    Alert.alert(title, message, buttons, {cancelable: false});
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Wallet'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch((error) => {
          console.log('error', error);
        });
    }

    const {firstName, navigation, checkUidPrompt} = this.props;
    if (!firstName) {
      return <Spinner />;
    }

    if (checkUidPrompt) {
      this.showAddAccountRecoveryDialog();
    }

    const scrollY = Animated.add(
      this.state.scrollY,
      Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0
    );

    const headerTranslate = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolate: 'clamp'
    });
    const imageTranslate = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 100],
      extrapolate: 'clamp'
    });

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <StatusBar
          translucent
          barStyle="light-content"
          backgroundColor="rgba(0, 0, 0, 0.251)"
        />
        <Text style={{padding: 20, fontSize: 18, fontWeight: 'bold', paddingBottom: 40}}>
          Ferly Card
        </Text>
        <Animated.ScrollView
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true }
          )}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true });
                setTimeout(
                  () => this.props.apiRefresh(urls.profile), this.setState({ refreshing: false }),
                  1000);
              }}
              // Android offset for RefreshControl
              progressViewOffset={250}
            />
          }
          // iOS offset for RefreshControl
          contentInset={{
            top: 220
          }}
          contentOffset={{
            y: -220
          }}
        >
          {this.renderAmounts()}
        </Animated.ScrollView>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.header,
            { transform: [{ translateY: headerTranslate }] }
          ]}
        >
          <Animated.Image
            style={[
              styles.backgroundImage,
              {
                transform: [{ translateY: imageTranslate }]
              }
            ]}
            source={blankCard}
          />
          <Image resizeMode={'contain'} style={styles.ferlyImg} source={logoHorizontal}/>
          <Text style={{
            padding: 20,
            marginTop: 17,
            fontSize: 18,
            fontWeight: 'bold',
            backgroundColor: 'white'
          }}>
            Other Cards
          </Text>
        </Animated.View>
        <Animated.View style={styles.bar}>
          <TouchableOpacity style={styles.theCard}onPress={() => navigation.navigate('Ferly Card')}>
            <Text style={styles.cardManager} >
              {this.cardPage()}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <TestElement
          parent={TouchableOpacity}
          label='test-id-fab'
          style={styles.fab}
          onPress={() => navigation.navigate('Market')}>
          <Icon name="plus" color="white" size={24} />
        </TestElement>
      </View>
    );
  }
}

const HEADER_MAX_HEIGHT = 160;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
let count = 0;
const {width} = Dimensions.get('window');
const newWidth = width / 3;
const logoWidth = width / 2.4;

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden'
  },
  bar: {
    marginTop: 82,
    height: 50,
    marginRight: 30,
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  cardManager: {
    fontSize: width < 330 ? 14 : 16,
    color: Theme.darkBlue,
    fontWeight: 'bold'
  },
  title: {
    color: 'white',
    fontSize: 18
  },
  ferlyImg: {
    width: logoWidth,
    height: 57,
    marginTop: -65,
    marginLeft: width < 330 ? 30 : 20
  },
  backgroundImage: {
    height: 190,
    width: width - 35,
    flexDirection: 'row-reverse',
    alignSelf: 'center',
    padding: 10,
    marginTop: 60,
    borderRadius: 10
  },
  ferlyCard: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'lightgray',
    paddingBottom: 15
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 1.8,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  cardImage: {
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  theCard: {
    backgroundColor: Theme.yellow,
    width: newWidth,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardDetails: {
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'column',
    borderLeftWidth: 0.5
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.yellow,
    position: 'absolute',
    bottom: 20,
    right: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.yellow,
    elevation: 5,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  cashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    flex: 1,
    maxWidth: 275
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: Theme.lightBlue
  }
});

Wallet.propTypes = {
  card: PropTypes.object,
  deviceToken: PropTypes.string,
  amounts: PropTypes.array,
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  checkUidPrompt: PropTypes.bool,
  checkedUidPrompt: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  uids: PropTypes.array
};

function mapStateToProps (state) {
  const apiStore = state.api.apiStore;
  const {checkUidPrompt, updateDownloaded} = state.settings;
  const {
    amounts,
    first_name: firstName,
    uids = []
  } = apiStore[urls.profile] || {};
  const {deviceToken} = state.settings;
  const data = apiStore[urls.profile];
  const {cards} = data || {};
  let card;
  if (cards) {
    card = cards[0];
  }

  return {
    amounts,
    card,
    firstName,
    uids,
    deviceToken,
    checkUidPrompt,
    updateDownloaded
  };
}

const mapDispatchToProps = {
  apiRefresh,
  apiRequire,
  checkedUidPrompt
};

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
