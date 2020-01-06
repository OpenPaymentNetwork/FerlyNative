import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Avatar from 'ferly/components/Avatar';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {AsyncStorage, Platform, TouchableOpacity, Alert, View} from 'react-native';

export class ProfilePicturePicker extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      image: null,
      showModal: true
    };
  }

  onImageChange (imageUri) {
    this.setState({image: imageUri});
    this.props.onImageChange(imageUri);
  }

  async askCameraRollPermission () {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.CAMERA_ROLL
    );
    let finalStatus = existingStatus;

    if (finalStatus !== 'granted') {
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      finalStatus = status;
    }
    return finalStatus;
  }

  async askCameraPermission () {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.CAMERA
    );
    let finalStatus = existingStatus;
    if (finalStatus !== 'granted') {
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      finalStatus = status;
    }
    return finalStatus;
  }

  async takeImage () {
    const cameraRollPermission = await this.askCameraRollPermission();
    const cameraPermission = await this.askCameraPermission();
    if (cameraRollPermission === 'granted' && cameraPermission === 'granted') {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.1,
        aspect: [4, 4]
      });
      if (!result.cancelled) {
        this.onImageChange(result.uri);
      }
    } else {
      Alert.alert(
        'Error', 'We need permission to access the camera and photos.');
    }
  }

  async pickImage () {
    const cameraRollPermission = await this.askCameraRollPermission();
    if (cameraRollPermission === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.1,
        aspect: [4, 4]
      });
      if (!result.cancelled) {
        this.onImageChange(result.uri);
      }
    } else {
      Alert.alert('Error', 'We need permission to access photos.');
    }
  }

  showOptions () {
    const buttons = [
      {
        text: 'Take Photo',
        onPress: () => this.takeImage()
      },
      {
        text: 'Choose from Library',
        onPress: () => this.pickImage()
      }
    ];
    if (Platform.OS === 'ios') {
      buttons.push({
        text: 'CLOSE',
        style: 'cancel'
      });
    }
    Alert.alert('Profile Picture', '', buttons);
  }

  switch () {
    AsyncStorage.setItem('granted', 'true');
    return this.showOptions();
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Profile Picture Picker'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {avatarProps} = this.props;
    const {image} = this.state;
    if (image) {
      avatarProps.pictureUrl = image;
    }

    return (
      <TouchableOpacity onPress={this.showOptions.bind(this)}>
        <Avatar {...avatarProps} />
        <View style={{position: 'absolute', bottom: 0, right: 0}}>
          <Icon name='camera' color={Theme.lightBlue} size={24} />
        </View>
      </TouchableOpacity>
    );
  }
}

let count = 0;

ProfilePicturePicker.propTypes = {
  avatarProps: PropTypes.object.isRequired,
  onImageChange: PropTypes.func.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state, ownProps) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(ProfilePicturePicker);
