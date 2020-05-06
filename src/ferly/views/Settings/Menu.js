import * as Permissions from 'expo-permissions';
import Avatar from 'ferly/components/Avatar';
import Icon from 'react-native-vector-icons/FontAwesome';
import I from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import Ic from 'react-native-vector-icons/MaterialCommunityIcons';
import Ico from 'react-native-vector-icons/Feather';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import TestElement from 'ferly/components/TestElement';
import {connect} from 'react-redux';
import {post, urls, createUrl} from 'ferly/utils/fetch';
import {Notifications, Updates} from 'expo';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  AsyncStorage,
  Dimensions
} from 'react-native';
import {setDeviceToken, setIsCustomer, setExpoToken} from 'ferly/store/settings';
import {apiErase} from 'ferly/store/api';

export class Settings extends React.Component {
  static navigationOptions = {
    title: 'Menu'
  };

  constructor (props) {
    super(props);
    this.state = {
      expoToken: '',
      showDebug: false
    };
  }

  componentDidMount () {
    try {
      this.getToken();
    } catch (error) {
      console.log('Unable to get expo token');
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

  async getToken () {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );

    if (existingStatus === 'granted') {
      let token = await Notifications.getExpoPushTokenAsync();
      this.setState({expoToken: token});
    }
  }

  handleUpdateClick () {
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

  render () {
    const {navigation, firstName, lastName, profileImage, username} = this.props;
    count++;
    if (count < 2) {
      const text = {'text': 'Menu'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    if (count >= 2) {
      count = 0;
    }
    const arrowIcon = (
      <Icon
        name="angle-right"
        color="gray"
        size={28} />
    );

    return (
      <View style={{flex: 1, backgroundColor: 'white', justifyContent: 'space-between'}}>
        <ScrollView style={{padding: 20}}>
          <Text style={{fontSize: 18, color: Theme.darkBlue}}>
            Profile
          </Text>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Profile')}>
            <View style={styles.sectionContainer}>
              <View style={{flexDirection: 'row'}}>
                <Avatar
                  size={width > 600 ? 70 : 60}
                  firstWord={firstName}
                  secondWord={lastName}
                  pictureUrl={profileImage} />
                <View style={{alignContent: 'center', paddingLeft: 10, justifyContent: 'center'}}>
                  <Text style={{fontSize: 18, fontWeight: 'bold', color: Theme.darkBlue}}>
                    {`${firstName} ${lastName}`}
                  </Text>
                  <Text style={{fontSize: 16, color: Theme.darkBlue}}>
                    {'@' + username}
                  </Text>
                </View>
              </View>
              {arrowIcon}
            </View>
          </TouchableOpacity>
          <Text style={{fontSize: 18, paddingTop: width > 330 ? 20 : 15, color: Theme.darkBlue}}>
            Ferly Card
          </Text>
          <TouchableOpacity
            style={styles.items}
            onPress={() => this.onCardClick()}>
            <View style={styles.sectionContainer}>
              <View style={{flexDirection: 'row'}}>
                <I
                  style={{paddingRight: 15}}
                  name="md-card"
                  color={Theme.darkBlue}
                  size={width < 330 ? 20 : 22 && width > 600 ? 28 : 22} />
                <Text style={{
                  alignSelf: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: Theme.darkBlue
                }}>
                  Manage Card
                </Text>
              </View>
              {arrowIcon}
            </View>
          </TouchableOpacity>
          <Text style={{fontSize: 18, paddingTop: width > 330 ? 20 : 15, color: Theme.darkBlue}}>
            Add Funds
          </Text>
          <TouchableOpacity
            style={[styles.items, {paddingLeft: 0.9}]}
            onPress={() => navigation.navigate('LoadingInstructions')}>
            <View style={[styles.sectionContainer, {marginLeft: -2}]}>
              <View style={{flexDirection: 'row'}}>
                <Ico
                  style={{paddingRight: 10}}
                  name="plus-circle"
                  color={Theme.darkBlue}
                  size={width < 330 ? 18 : 20 && width > 600 ? 26 : 20} />
                <Text style={styles.title}>{'Add Ferly Cash'}</Text>
              </View>
              {arrowIcon}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.items}
            onPress={() => navigation.navigate('EnterCode')}>
            <View style={styles.sectionContainer}>
              <View style={{flexDirection: 'row'}}>
                <I
                  style={{paddingRight: 15}}
                  name="md-gift"
                  color={Theme.darkBlue}
                  size={width < 330 ? 20 : 22 && width > 600 ? 28 : 22} />
                <Text style={styles.title}>{'Redeem gift code'}</Text>
              </View>
              {arrowIcon}
            </View>
          </TouchableOpacity>
          <Text style={{fontSize: 18, paddingTop: width > 330 ? 20 : 15, color: Theme.darkBlue}}>
            Other
          </Text>
          <TouchableOpacity
            style={{height: width > 600 ? 50 : 45}}
            onPress={() => navigation.navigate('Settings')}>
            <View style={styles.sectionContainer}>
              <View style={{flexDirection: 'row'}}>
                <I
                  style={{paddingRight: 15}}
                  name="md-settings"
                  color={Theme.darkBlue}
                  size={width < 330 ? 20 : 22 && width > 600 ? 28 : 22} />
                <Text style={styles.title}>{'Settings'}</Text>
              </View>
              {arrowIcon}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{height: width > 600 ? 50 : 45, marginBottom: 30}}
            onPress={() => this.SignOut()}>
            <View style={styles.sectionContainer}>
              <View style={{flexDirection: 'row'}}>
                <Ic
                  style={{paddingRight: 15}}
                  name="arrow-right-bold-box-outline"
                  color={Theme.darkBlue}
                  size={width < 330 ? 20 : 22 && width > 600 ? 28 : 22} />
                <Text style={styles.title}>{'Sign Out'}</Text>
              </View>
              {arrowIcon}
            </View>
          </TouchableOpacity>
        </ScrollView>
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
          </TestElement>
          <TestElement
            parent={TouchableOpacity}
            label='test-id-navbar-menu'
            style={{
              borderColor: 'white',
              height: width > 600 ? 95 : 75,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#C7EAEA',
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

let count = 0;
const {width} = Dimensions.get('window');

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

Settings.propTypes = {
  username: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  profileImage: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  updateDownloaded: PropTypes.bool.isRequired,
  deviceToken: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: width > 600 ? 20 : 18,
    color: Theme.darkBlue
  },
  description: {
    fontSize: width > 600 ? 18 : 16,
    color: 'gray',
    paddingLeft: 20
  },
  sectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  item: {
    height: width > 600 ? 90 : 80
  },
  items: {
    height: width > 600 ? 55 : 45
  }
});

function mapStateToProps (state) {
  const {updateDownloaded, deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const {
    username,
    profile_image_url: profileImage,
    first_name: firstName = '',
    last_name: lastName = ''
  } = apiStore[urls.profile] || {};

  return {
    firstName,
    lastName,
    profileImage,
    updateDownloaded,
    deviceToken,
    username
  };
}
export default connect(mapStateToProps)(Settings);
