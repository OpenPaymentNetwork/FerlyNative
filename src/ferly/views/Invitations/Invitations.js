import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {apiRequire, apiExpire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post} from 'ferly/utils/fetch';
import {StackActions} from 'react-navigation';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';

export class Invitations extends React.Component {
  static navigationOptions = {
    title: 'Invitations'
  }

  constructor (props) {
    super(props);
    this.state = {
      deleting: false
    };
  }

  componentDidMount () {
    this.props.apiRequire(this.props.invitationsUrl);
  }

  deleteInvite (invite) {
    this.setState({deleting: true});
    post('delete-invitation', this.props.deviceToken, {invite_id: invite.id.toString()})
      .then((response) => response.json())
      .then((json) => {
        if (json.error || json.invalid) {
          const text = {'text': 'Unsuccessful delete invitation'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
        }
        const text = {'text': 'successful delete invitation'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        if (Object.keys(json).length === 0) {
          this.props.apiExpire(this.props.invitationsUrl);
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Invitations'})]
          });
          this.props.navigation.dispatch(resetAction);
          Alert.alert('Deleted',
            `Your invitation to ${invite.recipient} has been deleted.`);
        } else {
          this.setState({deleting: false});
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: delete invitation'};
        post('log-info-inital', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to delete invitation!');
        navigator.navigate('Home');
      });
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Invitations'};
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
    const {navigation} = this.props;

    const addIcon = (
      <View style={styles.addIconContainer}>
        <Icon name='plus' color="white" size={width > 600 ? 18 : 16} />
      </View>
    );

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{paddingVertical: 15}}>
          <Text
            allowFontScaling={false}
            style={styles.headerText}>Send</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Contacts')}>
            {addIcon}
            <Text
              allowFontScaling={false}
              style={styles.buttonText}>From Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ManualAdd')}>
            {addIcon}
            <Text
              allowFontScaling={false}
              style={styles.buttonText}>New</Text>
          </TouchableOpacity>
          <View style={{marginTop: 10}} />
        </ScrollView>
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  addIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20
  },
  button: {alignItems: 'center', flexDirection: 'row', paddingVertical: 10},
  buttonText: {color: Theme.lightBlue, fontSize: width > 600 ? 22 : 18},
  headerText: {color: Theme.darkBlue, fontSize: width > 600 ? 26 : 22, paddingLeft: 20}
});

Invitations.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  invitationsUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  pending: PropTypes.array,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const invitationsUrl = createUrl('existing-invitations', {status: 'pending'});
  const apiStore = state.api.apiStore;
  const {results: pending = []} = apiStore[invitationsUrl] || {};

  return {
    invitationsUrl,
    pending,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Invitations);
