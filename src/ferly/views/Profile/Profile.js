import Avatar from 'ferly/components/Avatar';
import Icon from 'react-native-vector-icons/FontAwesome';
import PrimaryButton from 'ferly/components/PrimaryButton';
import ProfilePicturePicker from 'ferly/views/Profile/ProfilePicturePicker';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import TestElement from 'ferly/components/TestElement';
import Theme from 'ferly/utils/theme';
import {apiRequire, apiExpire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post, urls} from 'ferly/utils/fetch';
import {StackActions} from 'react-navigation';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions
} from 'react-native';

class Profile extends React.Component {
  static navigationOptions = {
    title: 'Profile'
  };

  constructor (props) {
    super(props);
    const {firstName, lastName, username} = props;
    this.state = {
      editing: false,
      submitting: false,
      form: {firstName, lastName, username},
      invalid: {},
      image: ''
    };
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile);
  }

  updateProfileImage () {
    const {image} = this.state;
    let uriParts = image.split('.');
    let fileType = uriParts[uriParts.length - 1];
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: `photo.${fileType}`,
      type: `image/${fileType}`
    });
    let options = {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + this.props.deviceToken
      }
    };
    return fetch(createUrl('upload-profile-image'), options);
  }

  updateProfileInfo () {
    const form = this.state.form;
    const postParams = {
      first_name: form.firstName,
      last_name: form.lastName,
      username: form.username
    };
    return post('edit-profile', this.props.deviceToken, postParams);
  }

  onSuccessfulEdit () {
    const {apiExpire, navigation} = this.props;
    apiExpire(urls.profile);
    const resetAction = StackActions.reset({
      index: 0,
      actions: [StackActions.push({routeName: 'Profile'})]
    });
    navigation.dispatch(resetAction);
  }

  formSubmit () {
    const {firstName, lastName, username} = this.props;
    const {form, image} = this.state;
    const {
      firstName: formFirstName,
      lastName: formLastName,
      username: formUsername
    } = form;
    const formChanged = (
      firstName !== formFirstName ||
      lastName !== formLastName ||
      username !== formUsername);
    const imageChanged = image !== '';
    this.setState({submitting: true});
    if (formChanged) {
      this.updateProfileInfo()
        .then((response) => response.json())
        .then((json) => {
          if (this.validateResponse(json)) {
            if (imageChanged) {
              this.updateProfileImage()
                .then((response) => response.json())
                .then((json) => {
                  this.onSuccessfulEdit();
                })
                .catch(() => {
                  const text = {'text': 'Call failed: edit profile 1'};
                  post('log-info-inital', this.props.deviceToken, text)
                    .then((response) => response.json())
                    .then((responseJson) => {
                    })
                    .catch(() => {
                      console.log('log error');
                    });
                  Alert.alert('Error trying to update!');
                  navigator.navigate('Home');
                });
            } else {
              this.onSuccessfulEdit();
            }
          } else {
            this.setState({submitting: false});
          }
        })
        .catch(() => {
          const text = {'text': 'Call failed: edit profile 2'};
          post('log-info-inital', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error trying to update!');
          navigator.navigate('Home');
        });
    } else if (imageChanged) {
      this.updateProfileImage()
        .then((response) => response.json())
        .then((json) => {
          if (json.error || json.invalid) {
            const text = {'text': 'Unsuccessful upload profile image'};
            post('log-info', this.props.deviceToken, text)
              .then((response) => response.json())
              .then((responseJson) => {
              })
              .catch(() => {
                console.log('log error');
              });
          }
          this.onSuccessfulEdit();
        })
        .catch(() => {
          const text = {'text': 'Call failed: upload profile image'};
          post('log-info-inital', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          Alert.alert('Error trying to update!');
          navigator.navigate('Home');
        });
    }
  }

  validateResponse (responseJson) {
    const text = {'text': 'Validate profile edit'};
    post('log-info', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
    if (responseJson.invalid) {
      const text = {'text': 'Unsuccessful profile edit invalid'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: responseJson.invalid});
      return false;
    } else if (responseJson.error === 'existing_username') {
      const text = {'text': 'Unsuccessful profile edit'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          console.log('log error');
        });
      this.setState({invalid: {username: 'Username already taken'}});
      return false;
    } else {
      return true;
    }
  }

  invalidUsernameMessage (username) {
    let msg;
    if (username.length < 4 || username.length > 20) {
      msg = 'Must be 4-20 characters long.';
    } else if (!username.charAt(0).match('^[a-zA-Z]$')) {
      msg = 'Must start with a letter.';
    } else if (!username.match('^[0-9a-zA-Z.]+$')) {
      msg = 'Must contain only letters, numbers, and periods.';
    }
    return msg;
  }

  validateUsername (username) {
    let msg = this.invalidUsernameMessage(username);
    if (msg) {
      this.setState({form: {username: username}, invalid: {username: msg}});
    } else {
      const newInvalid = Object.assign({}, this.state.invalid);
      delete newInvalid.username;
      this.setState({invalid: newInvalid});
    }
  }

  renderPage () {
    const {firstName, lastName, username, profileImage} = this.props;
    const {editing, submitting, invalid} = this.state;

    const avatarProps = {
      size: width > 600 ? 130 : 110,
      firstWord: firstName,
      secondWord: lastName,
      pictureUrl: profileImage
    };

    if (!editing) {
      return (
        <View style={{alignItems: 'center', paddingTop: 20}}>
          <Avatar {...avatarProps} />
          <Text style={styles.name}>{firstName + ' ' + lastName}</Text>
          <Text style={styles.username}>{'@' + username}</Text>
        </View>
      );
    } else {
      const {form, image} = this.state;
      const {
        firstName: formFirstName,
        lastName: formLastName,
        username: formUsername
      } = form;

      const formChanged = (
        firstName !== formFirstName ||
        lastName !== formLastName ||
        username !== formUsername);

      const imageChanged = image !== '';

      return (
        <View
          style={{flex: 1, justifyContent: 'space-between', width: '100%'}}>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={80}
            style={{flex: 1}}>
            <ScrollView
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={styles.scrollContainer}>
              <View style={{alignItems: 'center', width: '100%'}}>
                <ProfilePicturePicker
                  onImageChange={this.onImageChange.bind(this)}
                  avatarProps={avatarProps} />
              </View>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.field}
                underlineColorAndroid={'transparent'}
                onChangeText={(text) => {
                  this.setState({form: Object.assign(form, {firstName: text})});
                }}
                value={formFirstName} />
              {
                invalid.first_name
                  ? (<Text style={styles.error}>{invalid.first_name}</Text>)
                  : null
              }
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.field}
                underlineColorAndroid={'transparent'}
                onChangeText={(text) => {
                  this.setState({form: Object.assign(form, {lastName: text})});
                }}
                value={formLastName} />
              {
                invalid.last_name
                  ? (<Text style={styles.error}>{invalid.last_name}</Text>)
                  : null
              }
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.field}
                underlineColorAndroid={'transparent'}
                onChangeText={(text) => {
                  this.validateUsername(text);
                  this.setState({form: Object.assign(form, {username: text})});
                }}
                value={formUsername} />
              {
                invalid.username
                  ? (<Text style={styles.error}>{invalid.username}</Text>)
                  : null
              }
              <View style={{height: 80}} />
            </ScrollView>
          </KeyboardAvoidingView>
          <PrimaryButton
            title="Save"
            disabled={
              formFirstName === '' ||
              formLastName === '' ||
              !(formChanged || imageChanged) ||
              submitting ||
              !!invalid.username
            }
            color={Theme.lightBlue}
            onPress={() => this.formSubmit()} />
        </View>
      );
    }
  }

  toggleEdit () {
    const {editing} = this.state;
    const {firstName, lastName, username} = this.props;
    const refreshedFormState = {firstName, lastName, username};
    this.setState({editing: !editing, form: refreshedFormState, invalid: {}});
  }

  onImageChange (image) {
    this.setState({image: image});
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Profile'};
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
    const {editing} = this.state;

    if (!this.props.firstName) {
      return <Spinner />;
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white', alignItems: 'center'}}>
        {this.renderPage()}
        <TestElement
          parent={TouchableOpacity}
          label='test-id-profile-edit-toggle'
          style={{alignSelf: 'flex-end', position: 'absolute', padding: 20}}
          onPress={() => this.toggleEdit()}>
          <Icon
            name={editing ? 'times' : 'pencil'}
            color={Theme.lightBlue}
            size={width > 600 ? 28 : 24} />
        </TestElement>
      </View>
    );
  }
}

let count = 0;
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  avatarContainer: {
    width: width > 600 ? 150 : 110,
    height: width > 600 ? 150 : 110,
    borderRadius: width > 600 ? 65 : 55
  },
  label: {
    color: 'gray',
    marginTop: 12
  },
  profileText: {
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
    width: '100%',
    paddingHorizontal: 40
  },
  error: {color: 'red', width: '100%'},
  topView: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: Theme.darkBlue,
    alignItems: 'center'
  },
  name: {fontSize: width > 600 ? 35 : 30},
  username: {fontSize: width > 600 ? 25 : 20, color: 'gray'},
  field: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    fontSize: width > 600 ? 20 : 18,
    width: '100%'
  }
});

Profile.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  profileImage: PropTypes.string,
  username: PropTypes.string,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const apiStore = state.api.apiStore;
  const {
    amounts,
    username,
    profile_image_url: profileImage,
    first_name: firstName,
    last_name: lastName
  } = apiStore[urls.profile] || {};

  return {
    amounts,
    firstName,
    lastName,
    username,
    profileImage,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
