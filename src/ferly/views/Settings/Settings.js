import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {envId, post} from 'ferly/utils/fetch';
import {Notifications, Updates} from 'expo';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native';

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
    if (count >= 2) {
      count = 0;
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
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

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
