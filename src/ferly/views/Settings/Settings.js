import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import I from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import React from 'react';
import TestElement from 'ferly/components/TestElement';
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
      <TestElement
        parent={View}
        label='test-id-settings-page'
        style={{flex: 1, backgroundColor: 'white'}}
      >
        <Text style={styles.title}>{'Account Recovery'}</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Recovery')}>
          <View style={styles.sectionContainer}>
            <View style={{flexDirection: 'row'}}>
              <I
                name="md-person"
                color={Theme.darkBlue}
                size={20} />
              <Text style={styles.description}>
                {'Edit Email/Phone'}
              </Text>
            </View>
            {arrowIcon}
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{'About'}</Text>
        <TouchableOpacity
          style={styles.item}
          disabled={!updateDownloaded}
          onPress={this.handleUpdateClick.bind(this)}>
          <View style={styles.sectionContainer}>
            <View style={{flexDirection: 'row'}}>
              <I
                name="md-information-circle-outline"
                color={Theme.darkBlue}
                size={22} />
              <Text style={styles.description}>
                {`Version: ${version}/${envId}`}
              </Text>
            </View>
            {updateDownloaded ? updateIcon : null}
          </View>
        </TouchableOpacity>
      </TestElement>
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
    fontSize: width > 600 ? 20 : 18,
    color: Theme.darkBlue,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 8
  },
  description: {
    fontSize: width > 600 ? 20 : 18,
    color: Theme.darkBlue,
    fontWeight: 'bold',
    paddingLeft: 10
  },
  sectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 20
  },
  item: {
    height: width > 600 ? 40 : 30
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
