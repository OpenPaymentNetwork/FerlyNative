import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {envId, post} from 'ferly/utils/fetch';
import {Notifications, Updates} from 'expo';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AsyncStorage,
  Dimensions
} from 'react-native';
import {setDeviceToken, setIsCustomer, setExpoToken} from 'ferly/store/settings';
import {apiErase} from 'ferly/store/api';

export class Settings extends React.Component {
  static navigationOptions = {
    title: 'Settings'
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

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Settings'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {navigation, updateDownloaded} = this.props;
    const {version} = Constants.manifest;
    const arrowIcon = (
      <Icon
        name="angle-right"
        color="gray"
        size={28} />
    );

    const updateIcon = (
      <Icon
        name="exclamation-circle"
        color="red"
        size={28} />
    );

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Recovery')}>
          <View style={styles.sectionContainer}>
            <View>
              <Text style={styles.title}>{'Account Recovery'}</Text>
              <Text style={styles.description}>
                {'Because you don\'t want to lose anything.'}
              </Text>
            </View>
            {arrowIcon}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          disabled={!updateDownloaded}
          onPress={this.handleUpdateClick.bind(this)}>
          <View style={styles.sectionContainer}>
            <View>
              <Text style={styles.title}>{'About'}</Text>
              <Text style={styles.description}>
                {`Version ${version}/${envId}`}
              </Text>
            </View>
            {updateDownloaded ? updateIcon : null}
          </View>
        </TouchableOpacity>
        <View style={{height: 40, flexDirection: 'row', paddingRight: 20}}>
          <View style={{flexGrow: 1}} />
          <TouchableOpacity style={{
            backgroundColor: Theme.lightBlue,
            justifyContent: 'center',
            alignItems: 'center',
            width: width > 600 ? 110 : 90,
            height: width > 600 ? 45 : 35,
            borderRadius: width > 600 ? 15 : 10
          }}
          onPress={() => this.SignOut()}>
            <Text style={{color: 'white', fontSize: width > 600 ? 20 : 18, fontWeight: 'bold'}} >
              Sign Out
            </Text>
          </TouchableOpacity>
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
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  updateDownloaded: PropTypes.bool.isRequired,
  deviceToken: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: width > 600 ? 22 : 20
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
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  item: {
    height: width > 600 ? 90 : 80
  }
});

function mapStateToProps (state) {
  const {updateDownloaded, deviceToken} = state.settings;
  return {
    updateDownloaded,
    deviceToken
  };
}
export default connect(mapStateToProps)(Settings);
