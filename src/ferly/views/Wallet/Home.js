import * as Permissions from 'expo-permissions';
import accounting from 'ferly/utils/accounting';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icones from 'react-native-vector-icons/Feather';
import I from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Ico from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import Theme from 'ferly/utils/theme';
import TestElement from 'ferly/components/TestElement';
import {Notifications, Updates} from 'expo';
import {apiRequire, apiRefresh, apiErase} from 'ferly/store/api';
import {checkedUidPrompt, setDeviceToken, setIsCustomer, setExpoToken} from 'ferly/store/settings';
import {connect} from 'react-redux';
import {urls, createUrl, post} from 'ferly/utils/fetch';
import {
  Animated,
  AsyncStorage,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  RefreshControl,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';

export class Wallet extends React.Component {
  static navigationOptions = {
    title: 'Wallet'
  }

  constructor () {
    super();
    this.scrollYAnimatedValue = new Animated.Value(0);
    this.array = [];
    this.state = {
      refresh: false,
      isScrolled: false,
      loaded: false,
      width2: this.getDimensions(),
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
    count2++;
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
    if (codeRedeemed === 'needed' && count2 < 2) {
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
    } else {
      count2 = 0;
    }
    for (var i = 1; i <= 75; i++) {
      this.array.push(i);
    }
    try {
      this.props.dispatch(apiRequire(urls.profile));
    } catch (error) {
      Alert.alert('Failed to refresh profile!');
    }
  }

  onCardClick () {
    fetch(createUrl('verify-account'), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.Verified) {
          this.props.navigation.navigate('FerlyCard');
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

  renderCard (design, count) {
    const {navigation} = this.props;
    const {amount, id, title} = design;
    if (cash.title === 'Ferly Cash') {
      cashDesign = design;
    } else if (rewards.title === 'Ferly Rewards') {
      rewardsDesign = design;
    }
    if (title !== 'Ferly Cash' && title !== 'Ferly Rewards') {
      let loyal = design.loyaltyAmount;
      let formatted;
      if (design.loyaltyAmount) {
        formatted = accounting.formatMoney(parseFloat(amount) + parseFloat(loyal));
      } else {
        formatted = accounting.formatMoney(parseFloat(amount));
      }
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
          onPress={() => navigation.navigate('Value', {design, cashDesign, rewardsDesign})}
          style={[styles.cardContainer, {borderColor: color}]}>
          <View style={[styles.cardImage, {backgroundColor: color}]}>
            <Text style={{
              fontSize: width < 350 ? 20 : 22 && width > 600 ? 26 : 22, color: text
            }}>
              {formatted}
            </Text>
          </View>
          <View style={[styles.cardDetails, {borderColor: color}]}>
            <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 15}}>
              <Text style={{
                fontSize: width < 350 ? 16 : 18 && width > 600 ? 24 : 18,
                fontWeight: 'bold',
                color: Theme.darkBlue}}>{title}</Text>
            </View>
            <View style={[styles.buttonRow, {borderColor: color}]}>
              <TestElement
                parent={TouchableOpacity}
                label='test-id-give-button'
                style={styles.cashButton}
                onPress={() => navigation.navigate('Recipient', design)}>
                <Ico
                  style={{paddingRight: 8}}
                  name="card-giftcard"
                  color={Theme.darkBlue}
                  size={width < 350 ? 18 : 20 && width > 600 ? 26 : 20} />
                <Text style={{
                  color: Theme.darkBlue,
                  fontSize: width < 350 ? 11 : 12 && width > 600 ? 16 : 12,
                  fontWeight: 'bold'
                }}>
                GIVE
                </Text>
              </TestElement>
              <TestElement
                parent={TouchableOpacity}
                label='test-id-buy-button'
                style={[styles.cashButton, {borderLeftWidth: 1, borderColor: color}]}
                onPress={
                  () => navigation.navigate('Purchase', {design})
                }>
                <Icones
                  style={{paddingRight: 8}}
                  name="plus-circle"
                  color={Theme.darkBlue}
                  size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
                <Text style={{
                  color: Theme.darkBlue,
                  fontSize: width < 350 ? 11 : 12 && width > 600 ? 16 : 12,
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
  }

  renderAmounts () {
    const amounts = this.props.amounts || [];
    if (amounts.length === 0) {
      return (
        <View style={{alignItems: 'center'}}>
          <Text style={{
            marginTop: Platform.OS === 'ios' ? -20 : 235,
            marginHorizontal: 20,
            marginBottom: 20,
            fontSize: 18
          }}>
          There’s nothing here! Visit the Shop to browse your favorite brands.
          </Text>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-add'
            style={[styles.theCard, {
              width: width / 3,
              flexDirection: 'row',
              height: 30
            }]}
            onPress={() => this.props.navigation.navigate('Market')}>
            <Icons
              style={{paddingRight: 8}}
              name="store-alt"
              color={Theme.darkBlue}
              size={width < 350 ? 14 : 16 && width > 600 ? 20 : 18} />
            <Text style={[styles.cardManager, {
              fontSize: width < 350 || Platform.OS === 'ios' ? 14 : 16 && width > 600 ? 18 : 16
            }]}>
              {`Shop`}
            </Text>
          </TestElement>
        </View>
      );
    } else if (amounts.length < 2) {
      if (amounts[0].title === 'Ferly Cash' || amounts[0].title === 'Ferly Rewards') {
        return (
          <View style={{alignItems: 'center'}}>
            <Text style={{
              marginTop: Platform.OS === 'ios' ? -20 : 235,
              marginHorizontal: 20,
              marginBottom: 20,
              fontSize: 18
            }}>
              There’s nothing here! Visit the Shop to browse your favorite brands.
            </Text>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-add'
              style={[styles.theCard, {
                width: width / 3,
                flexDirection: 'row',
                height: 30
              }]}
              onPress={() => this.props.navigation.navigate('Market')}>
              <Icons
                style={{paddingRight: 8}}
                name="store-alt"
                color={Theme.darkBlue}
                size={width < 350 ? 14 : 16 && width > 600 ? 20 : 18} />
              <Text style={[styles.cardManager, {
                fontSize: width < 350 || Platform.OS === 'ios' ? 14 : 16 && width > 600 ? 18 : 16
              }]}>
                {`Shop`}
              </Text>
            </TestElement>
          </View>
        );
      } else {
        return (
          <ScrollView
            keyboardShouldPersistTaps='handled'
            style={{
              marginTop: Platform.OS === 'android' ? 150 : 10 &&
              width < 350 ? -20 : 50 && width > 600 ? 80 : 40
            }}
            refreshControl={
              <RefreshControl
                style={{position: 'absolute'}}
                refreshing={false}
                onRefresh={() => this.props.dispatch(apiRefresh(urls.profile))}
              />
            }>
            {amounts.map((cashRow, index) => this.renderCard(cashRow, index))}
            <View style={{height: 80}} />
          </ScrollView>
        );
      }
    } else {
      return (
        <ScrollView
          keyboardShouldPersistTaps='handled'
          style={{
            marginTop: Platform.OS === 'android' ? 150 : 10 &&
            width < 350 ? -20 : 50 && width > 600 ? 80 : 40
          }}
          refreshControl={
            <RefreshControl
              style={{position: 'absolute'}}
              refreshing={false}
              onRefresh={() => this.props.dispatch(apiRefresh(urls.profile))}
            />
          }>
          {amounts.map((cashRow, index) => this.renderCard(cashRow, index))}
          <View style={{height: 80}} />
        </ScrollView>
      );
    }
  }

  SignOut () {
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
        const text = {'text': 'successful get expo token'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        AsyncStorage.setItem('expoToken', json.expo_token).then(() => {
          this.props.dispatch(setExpoToken(json.expo_token));
        });
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
    post('delete-device-tokens', this.props.deviceToken)
      .then((response) => response.json())
      .then((json) => {
        if (json.error || json.invalid) {
          const text = {'text': 'Unsuccessful delete expo token'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        const text = {'text': 'successful delete device token'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
      })
      .catch(() => {
        const text = {'text': 'Call failed: delete expo token'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to sign out!');
      });
    this.props.dispatch(apiErase());
    device = makeid(32);
    AsyncStorage.setItem('deviceToken', device).then(() => {
      setTimeout(() => {
        const alertText = 'You have been successfully signed out.';
        Alert.alert('Done!', alertText);
        try {
          AsyncStorage.setItem('isCustomer', 'false').then((response) => {
            this.props.dispatch(setIsCustomer('false'));
            this.props.dispatch(setDeviceToken(device));
          });
        } catch (error) {
        }
      }, 500);
    });
  }

  showAddAccountRecoveryDialog () {
    const {navigation, amounts, uids} = this.props;
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
        keyboardShouldPersistTaps: 'handled',
        onPress: () => this.dispach(checkedUidPrompt())
      },
      {
        text: 'Add',
        keyboardShouldPersistTaps: 'handled',
        onPress: () => {
          this.dispach(checkedUidPrompt());
          navigation.navigate('Recovery');
        }
      }
    ];
    Alert.alert(title, message, buttons, {cancelable: false});
  }

  changeLoaded () {
    this.setState({
      loaded: true
    });
  }

  componentWillUnmount () {
    Dimensions.removeEventListener('change', this.theWidth);
    clearInterval(interval);
  }

  render () {
    cash = {};
    rewards = {};
    if (this.props.amounts) {
      this.props.amounts.forEach(function (item) {
        if (item) {
          if (item.title === 'Ferly Cash') {
            cash = item;
          } else if (item.title === 'Ferly Rewards') {
            rewards = item;
          }
        }
      });
    }
    if (this.props.deviceToken !== deviceId) {
      deviceId = this.props.deviceToken;
      cashDesign = [];
      rewardsDesign = [];
      deviceId = 0;
    }
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
      if (!this.state.loaded) {
        interval = setTimeout(() => {
          this.changeLoaded();
        }, 9000);
      }
      if (this.state.loaded) {
        const buttons = [
          {text: 'OK', onPress: null, style: 'cancel'},
          {text: 'Sign Out', onPress: () => this.SignOut()}
        ];
        Alert.alert('Error', `Unable to get profile information. Please check internet ` +
        `connection and try again.`, buttons);
      }
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

    const headerHeight = this.scrollYAnimatedValue.interpolate(
      {
        inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT)],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp'
      });

    const headerBackgroundColor = this.scrollYAnimatedValue.interpolate(
      {
        inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT)],
        outputRange: [Theme.darkBlue, Theme.darkBlue],
        extrapolate: 'clamp'
      });

    const titleTranslateY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [34, 30, 26],
      extrapolate: 'clamp'
    });

    const titleMiddleTranslateY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [38, 34, 30],
      extrapolate: 'clamp'
    });

    const rewardsTranslateY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [18, 16, 14],
      extrapolate: 'clamp'
    });

    const cashDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [-5, -20, -35],
      extrapolate: 'clamp'
    });

    const rewardsDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [38, 17, 0],
      extrapolate: 'clamp'
    });

    const iosRewardsDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [60, 25, 0],
      extrapolate: 'clamp'
    });

    const merchantDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [110, 70, 30],
      extrapolate: 'clamp'
    });

    const iosMerchantDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [170, 70, 30],
      extrapolate: 'clamp'
    });

    const buttonDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [15, 0, -15],
      extrapolate: 'clamp'
    });

    const cashMiddleDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [20, 10, 0],
      extrapolate: 'clamp'
    });

    const rewardsMiddleDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [80, 65, 50],
      extrapolate: 'clamp'
    });

    const buttonMiddleDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [35, 37, 30],
      extrapolate: 'clamp'
    });

    const iosbuttonMiddleDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [20, -20, -40],
      extrapolate: 'clamp'
    });

    const merchantMiddleDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [160, 120, 90],
      extrapolate: 'clamp'
    });

    const iconDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [-43, -46, -49],
      extrapolate: 'clamp'
    });

    const iconMiddleDistanceY = this.scrollYAnimatedValue.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [-40, -43, -46],
      extrapolate: 'clamp'
    });

    let renderPad;
    if (width < 350 && Platform.OS === 'ios') {
      renderPad = HEADER_MAX_HEIGHT + 30;
    } else if (width > 600 && Platform.OS === 'ios') {
      renderPad = HEADER_MAX_HEIGHT - 20;
    } else if (width > 350 && Platform.OS === 'ios') {
      renderPad = HEADER_MAX_HEIGHT - 10;
    } else if (width < 600 && Platform.OS === 'android') {
      renderPad = HEADER_MAX_HEIGHT - 120;
    }

    let body;
    if (cash.amount) {
      body = (
        <View style={{flexDirection: 'row'}}>
          <Animated.View style={{
            paddingRight: 20,
            marginTop: width < 350 ? buttonDistanceY : buttonMiddleDistanceY &&
            Platform.OS === 'ios' ? iosbuttonMiddleDistanceY : buttonMiddleDistanceY
          }}>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-give'
              style={[styles.theCard, {
                width: width / 4,
                flexDirection: 'row'
              }]}
              onPress={() => this.props.navigation.navigate('Recipient', cash, rewards)}>
              <Ico
                style={{paddingRight: 8}}
                name="card-giftcard"
                color={Theme.darkBlue}
                size={width < 350 ? 18 : 20 && width > 600 ? 26 : 20} />
              <Text style={[styles.cardManager, {
                fontSize: width < 350 && Platform.OS === 'ios' ? 14 : 16 &&
                width > 600 && Platform.OS === 'ios' ? 24 : 16
              }]}>
                {`Give`}
              </Text>
            </TestElement>
          </Animated.View>
          <Animated.View style={{
            marginTop: width < 350 ? buttonDistanceY : buttonMiddleDistanceY &&
            Platform.OS === 'ios' ? iosbuttonMiddleDistanceY : buttonMiddleDistanceY
          }}>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-add'
              style={[styles.theCard, {
                width: width / 4,
                flexDirection: 'row'
              }]}
              onPress={() => this.props.navigation.navigate('LoadingInstructions')}>
              <Icones
                style={{paddingRight: 8}}
                name="plus-circle"
                color={Theme.darkBlue}
                size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
              <Text style={[styles.cardManager, {
                fontSize: width < 350 && Platform.OS === 'ios' ? 14 : 16 &&
                width > 600 && Platform.OS === 'ios' ? 24 : 16
              }]}>
                {`Add`}
              </Text>
            </TestElement>
          </Animated.View>
        </View>
      );
    } else {
      body = (
        <Animated.View style={{
          marginTop: width < 350 ? buttonDistanceY : buttonMiddleDistanceY &&
          Platform.OS === 'ios' ? iosbuttonMiddleDistanceY : buttonMiddleDistanceY
        }}>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-card-page'
            style={[styles.theCard, {width: width / 3, flexDirection: 'row'}]}
            onPress={() => this.props.navigation.navigate('LoadingInstructions')}>
            <Text style={[styles.cardManager, {
              marginLeft: 10,
              fontSize: width < 350 ? 14 : 16 && width > 600 ? 18 : 16
            }]}>
              {'Learn More'}
            </Text>
            <Icones
              style={{paddingLeft: 8}}
              name="arrow-right"
              color={Theme.darkBlue}
              size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
          </TestElement>
        </Animated.View>
      );
    }

    return (
      <View keyboardShouldPersistTaps='handled' style={{flex: 1, backgroundColor: 'white'}}>
        <View>
          <Text style={{
            position: 'relative',
            backgroundColor: Theme.darkBlue,
            color: 'white',
            paddingHorizontal: 20,
            paddingVertical: 20,
            fontSize: width < 350 && Platform.OS === 'ios' ? 16 : 18 &&
            width < 350 && Platform.OS === 'android' ? 16 : 18
          }}>
            Ferly Cash
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            paddingTop: renderPad
          }}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.scrollYAnimatedValue } } }]
          )}>
          {this.renderAmounts()}
        </ScrollView>
        <TestElement
          parent={Animated.View}
          label='test-id-ferly-cash'
          style={[styles.animatedHeaderContainer, {
            height: headerHeight, backgroundColor: headerBackgroundColor
          }]}>
          <Animated.View style={{
            flexDirection: 'row',
            position: 'absolute',
            justifyContent: 'center',
            alignSelf: 'center',
            marginBottom: 50
          }}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('FerlyValue')}>
              <Animated.Text style={{
                marginTop: width < 350 || Platform.OS === 'ios' ? cashDistanceY : cashMiddleDistanceY &&
                width > 600 ? 160 : cashMiddleDistanceY,
                justifyContent: 'center',
                alignSelf: 'center',
                height: 50,
                color: 'white',
                fontSize: width < 350 ? titleTranslateY : titleMiddleTranslateY
              }}>
                {!cash.amount ? '$0.00' : `$${cash.amount}`}
              </Animated.Text>
              <Animated.View style={{
                marginTop: width < 350 || Platform.OS === 'ios' ? iconDistanceY : iconMiddleDistanceY,
                width: width / 2,
                alignItems: 'flex-end',
                marginLeft: 100
              }}>
                <Icon
                  name="angle-right"
                  color="white"
                  size={width < 350 ? 22 : 26} />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          <View>
            <Animated.Text style={{
              marginTop: width < 350 ? rewardsDistanceY : rewardsMiddleDistanceY &&
              Platform.OS === 'ios' ? iosRewardsDistanceY : rewardsMiddleDistanceY,
              position: 'absolute',
              alignSelf: 'center',
              color: 'white',
              fontSize: rewardsTranslateY
            }}>
              {
                !rewards.amount ? '+ Rewards: $0.00' : `+ Rewards: $${rewards.amount}`
              }
            </Animated.Text>
          </View>
          <View style={styles.bar}>
            {body}
          </View>
          <Animated.View style={{
            width: width,
            marginTop: width < 350 ? merchantDistanceY : merchantMiddleDistanceY &&
            Platform.OS === 'ios' ? iosMerchantDistanceY : merchantMiddleDistanceY,
            height: 60
          }}>
            <Text style={{
              paddingHorizontal: 20,
              paddingVertical: 15,
              marginTop: width < 330 ? 8 : 17,
              fontSize: width < 350 ? 16 : 18 && width > 600 ? 20 : 18,
              backgroundColor: 'white',
              color: Theme.darkBlue
            }}>
              Merchant Balances
            </Text>
          </Animated.View>
        </TestElement>
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
              backgroundColor: '#C7EAEA',
              width: width / 4
            }}
            onPress={() => this.props.navigation.navigate('Home')}>
            <I
              name="md-wallet"
              color={Theme.darkBlue}
              size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
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
              size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
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
              backgroundColor: 'white',
              width: width / 4
            }}
            onPress={() => this.props.navigation.navigate('History')}>
            <Icon
              name="history"
              color={Theme.darkBlue}
              size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
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
              size={width < 350 ? 16 : 18 && width > 600 ? 24 : 18} />
            <Text style={{color: Theme.darkBlue, fontSize: width > 600 ? 18 : 16}}>
              Menu
            </Text>
          </TestElement>
        </View>
      </View>
    );
  }
}

let {width} = Dimensions.get('window');
let interval = 0;
let cashDesign = [];
let rewardsDesign = [];
let deviceId = 0;
let cash = {};
let rewards = {};

let codeRedeemed = '';
const HEADER_MIN_HEIGHT = width < 350 ? 50 : 120 && Platform.OS === 'ios' ? 50 : 120;
const HEADER_MAX_HEIGHT = width < 350 ? 150 : 200;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
let count = 0;
let count2 = 0;
const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden'
  },
  animatedHeaderContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  bar: {
    marginTop: width < 350 ? 60 : 90,
    alignItems: 'center',
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
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    height: width < 350 ? 90 : 100 && width > 600 ? 110 : 100,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 1.8,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  cardImage: {
    width: width < 350 ? 120 : 130 && width > 600 ? 170 : 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  theCard: {
    backgroundColor: Theme.lightBlue,
    height: width < 350 ? 25 : 35 && width > 600 ? 35 : 35,
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
  cashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: width > 600 ? 45 : 40,
    flex: 1,
    maxWidth: width > 600 ? 450 : 275
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
  apiRefresh: PropTypes.func,
  apiRequire: PropTypes.func,
  checkUidPrompt: PropTypes.bool,
  checkedUidPrompt: PropTypes.func,
  firstName: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  uids: PropTypes.array
};

let device = makeid(32);
function makeid (length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function mapStateToProps (state) {
  const apiStore = state.api.apiStore;
  const {checkUidPrompt, updateDownloaded} = state.settings;
  let {
    amounts,
    first_name: firstName,
    uids = []
  } = apiStore[urls.profile] || {};
  let loyalty = {};
  if (amounts) {
    amounts.forEach(function (item) {
      if (item.title.includes('Loyalty')) {
        loyalty = item;
        let newTitle = item.title.replace(' Loyalty', '');
        amounts.forEach(function (items) {
          if (!items.title.includes('Loyalty')) {
            if (items.title === newTitle) {
              items['loyaltyAmount'] = loyalty.amount;
              items['expiringAmounts'] = loyalty.expiring;
              items['loyaltyId'] = loyalty.id;
            }
          }
        });
      }
    });
    amounts = amounts.filter((item) => !item.title.includes('Loyalty'));
  }
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

export default connect(mapStateToProps)(Wallet);
