import * as Permissions from 'expo-permissions';
import accounting from 'ferly/utils/accounting';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import TestElement from 'ferly/components/TestElement';
import {Notifications, Updates} from 'expo';
import {apiRequire, apiRefresh} from 'ferly/store/api';
import {checkedUidPrompt} from 'ferly/store/settings';
import {connect} from 'react-redux';
import {urls, createUrl, post} from 'ferly/utils/fetch';
import {blankCard, logoHorizontal} from 'ferly/images/index';
import {
  Animated,
  AsyncStorage,
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
      width2: this.getDimensions(),
      scrollY: new Animated.Value(
        Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0
      ),
      refreshing: false
    };
    this.theWidth = this.theWidth.bind(this);
  }

  getDimensions () {
    let {width} = Dimensions.get('window');
    return width;
  }

  retrieveCodeRedeemed = async () => {
    try {
      codeRedeemed = await AsyncStorage.getItem('codeRedeemed') || '';
      AsyncStorage.setItem('codeRedeemed', '');
      return codeRedeemed;
    } catch (error) {
      Alert.alert('Error trying to retrieve customer info!');
    }
  }

  theWidth () {
    let {width} = Dimensions.get('window');
    this.setState({width2: width});
  }

  componentDidMount = async () => {
    Dimensions.addEventListener('change', this.theWidth);
    let expoToken = await AsyncStorage.getItem('expoToken') || '';
    if (!expoToken) {
      try {
        expoToken = await this.getToken();
      } catch (error) {
      }
    }
    post('get-expo-token', this.props.deviceToken)
      .then((response) => response.json())
      .then((json) => {
        if (json.error || json.invalid) {
          const text = {'text': 'Unsuccessful get expo token'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        if (!json.expo_token && expoToken) {
          const text = {'text': 'successful get expo token'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          const setParams = {
            expo_token: expoToken
          };
          post('set-expo-token', this.props.deviceToken, setParams)
            .then((response) => response.json())
            .then((json) => {
              if (json.error || json.invalid) {
                const text = {'text': 'Unsuccessful set expo token'};
                post('log-info', this.props.deviceToken, text)
                  .then((response) => response.json())
                  .then((responseJson) => {
                  })
                  .catch(() => {
                    console.log('log error');
                  });
              }
              const text = {'text': 'successful set expo token'};
              post('log-info', this.props.deviceToken, text)
                .then((response) => response.json())
                .then((responseJson) => {
                })
                .catch(() => {
                  console.log('log error');
                });
            })
            .catch(() => {
              const text = {'text': 'Call failed: set expo token'};
              post('log-info', this.props.deviceToken, text)
                .then((response) => response.json())
                .then((responseJson) => {
                })
                .catch(() => {
                  console.log('log error');
                });
              Alert.alert('Error trying to set token!');
            });
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: get expo token'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to get token!');
      });
    codeRedeemed = await this.retrieveCodeRedeemed();
    if (codeRedeemed === 'needed') {
      const {navigation} = this.props;
      const buttons = [
        {
          text: 'No',
          onPress: () => navigation.navigate('Wallet')
        },
        {
          text: 'Yes',
          onPress: () => navigation.navigate('EnterCode')
        }
      ];
      Alert.alert('Have an invite code?', '', buttons);
    }
    for (var i = 1; i <= 75; i++) {
      this.array.push(i);
    }
    try {
      this.props.apiRequire(urls.profile);
    } catch (error) {
      Alert.alert('Failed to refresh profile!');
    }
    fetch(createUrl('verify-address'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((json) => {
        if (json['verified'] === 'yes') {
          passed = 'true';
        } else if (json['verified'] === 'no') {
          passed = 'false';
        } else if (json['error']) {
          passed = 'false';
        } else {
          passed = '';
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Trying to get address!');
      });
  }

  onMarketClick () {
    fetch(createUrl('verify-account'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.Verified) {
          this.props.navigation.navigate('Market');
        } else {
          Alert.alert('Feature Unavailable', `This feature is available only for invitees. ` +
          `Coming soon to all users. In the meantime, enjoy previewing the Ferly App!`);
        }
      })
      .catch(() => {
        Alert.alert('Error please check internet connection!');
      });
  }

  onCardClick () {
    fetch(createUrl('verify-account'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.Verified) {
          this.props.navigation.navigate('Ferly Card');
        } else {
          Alert.alert('Feature Unavailable', `This feature is available only for invitees. ` +
          `Coming soon to all users. In the meantime, enjoy previewing the Ferly App!`);
        }
      })
      .catch(() => {
        Alert.alert('Error please check internet connection!');
      });
  }

  async getToken () {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      let token = await Notifications.getExpoPushTokenAsync();
      return token;
    }
  }

  componentWillUnmount () {
    Dimensions.removeEventListener('change', this.theWidth);
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
    if (!card) {
      if (passed === 'true') {
        return (
          'Activate Card'
        );
      } else if (passed === 'false' || passed === '') {
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
          <Text style={{fontSize: this.state.width2 < 330 ? 20 : 22, color: text}}>
            {formatted}
          </Text>
        </View>
        <View style={[styles.cardDetails, {borderColor: color}]}>
          <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 15}}>
            <Text style={{
              fontSize: this.state.width2 < 330 ? 16 : 18,
              fontWeight: 'bold',
              color: Theme.darkBlue}}>{title}</Text>
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
                size={this.state.width2 < 330 ? 16 : 18} />
              <Text style={{
                color: Theme.darkBlue,
                fontSize: this.state.width2 < 330 ? 11 : 12,
                fontWeight: 'bold'
              }}>
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
                size={this.state.width2 < 330 ? 16 : 18} />
              <Text style={{
                color: Theme.darkBlue,
                fontSize: this.state.width2 < 330 ? 11 : 12,
                fontWeight: 'bold'
              }}>
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
          keyboardShouldPersistTaps='handled'
          style={{
            marginTop: Platform.OS === 'android' ? 240 : 10 && this.state.width2 < 330 ? -10 : 50
          }}
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
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }

    const {firstName, checkUidPrompt, updateDownloaded} = this.props;
    if (!firstName) {
      return <Spinner />;
    }

    if (updateDownloaded) {
      const buttons = [
        {text: 'No', onPress: null, style: 'cancel'},
        {text: 'Yes', onPress: () => Updates.reloadFromCache()}
      ];
      Alert.alert(
        'New version available',
        'Would you like to update to the newest version?',
        buttons
      );
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
        <Text style={{
          padding: 20,
          fontSize: this.state.width2 < 330 ? 16 : 18,
          fontWeight: 'bold',
          paddingBottom: 40}}>
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

                width: this.state.width2 - 35,
                transform: [{ translateY: imageTranslate }]
              }
            ]}
            source={blankCard}
          />
          <Image resizeMode={'contain'}
            style={[
              styles.ferlyImg, {
                width: this.state.width2 / 2.5,
                marginLeft: 30}
            ]}
            source={logoHorizontal}/>
          <Text style={{
            padding: 20,
            marginTop: this.state.width2 < 330 ? 8 : 17,
            fontSize: this.state.width2 < 330 ? 16 : 18,
            fontWeight: 'bold',
            backgroundColor: 'white'
          }}>
            Other Cards
          </Text>
        </Animated.View>
        <Animated.View style={styles.bar}>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-card-page'
            style={[styles.theCard, {width: this.state.width2 / 3}]}
            onPress={() => this.onCardClick()}>
            <Text style={[styles.cardManager, {fontSize: this.state.width2 < 330 ? 14 : 16}]}>
              {this.cardPage()}
            </Text>
          </TestElement>
        </Animated.View>
        <TestElement
          parent={TouchableOpacity}
          label='test-id-fab'
          style={styles.fab}
          onPress={() => this.onMarketClick()}>
          <Icon name="plus" color="white" size={width < 330 ? 20 : 24} />
        </TestElement>
      </View>
    );
  }
}

let {width} = Dimensions.get('window');

let codeRedeemed = '';
let passed = '';
const HEADER_MAX_HEIGHT = 160;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
let count = 0;
const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden'
  },
  bar: {
    marginTop: width < 330 ? 65 : 80,
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
    color: Theme.darkBlue,
    fontWeight: 'bold'
  },
  title: {
    color: 'white',
    fontSize: 18
  },
  ferlyImg: {
    height: width < 330 ? 48 : 57,
    marginTop: width < 330 ? -50 : -65
  },
  backgroundImage: {
    height: width < 330 ? 160 : 190,
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
    height: width < 330 ? 90 : 100,
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
    height: width < 330 ? 35 : 40,
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
    width: width < 330 ? 50 : 60,
    height: width < 330 ? 50 : 60,
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
  updateDownloaded: PropTypes.bool.isRequired,
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
    updateDownloaded,
    card,
    firstName,
    uids,
    deviceToken,
    checkUidPrompt
  };
}

const mapDispatchToProps = {
  apiRefresh,
  apiRequire,
  checkedUidPrompt
};

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
