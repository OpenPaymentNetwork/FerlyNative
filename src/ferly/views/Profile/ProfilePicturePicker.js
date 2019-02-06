import Avatar from 'ferly/components/Avatar'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {ImagePicker, Permissions} from 'expo'
import {Platform, TouchableOpacity, Alert, View} from 'react-native'

export default class ProfilePicturePicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      image: null,
      cameraRollPermission: '',
      cameraPermission: '',
      showModal: true
    }
  }

  componentDidMount () {
    this.askCameraRollPermission()
    this.askCameraPermission()
  }

  onImageChange (imageUri) {
    this.setState({image: imageUri})
    this.props.onImageChange(imageUri)
  }

  async askCameraRollPermission () {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.CAMERA_ROLL
    )
    let finalStatus = existingStatus

    // Android doesn't require permission to access the camera roll.
    if (Platform.OS === 'ios' && finalStatus !== 'granted') {
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      finalStatus = status
    }
    this.setState({'cameraRollPermission': finalStatus})
  }

  async askCameraPermission () {
    const {status: existingStatus} = await Permissions.getAsync(
      Permissions.CAMERA
    )
    let finalStatus = existingStatus
    if (finalStatus !== 'granted') {
      const {status} = await Permissions.askAsync(Permissions.CAMERA)
      finalStatus = status
    }
    this.setState({'cameraPermission': finalStatus})
  }

  async takeImage () {
    if (this.state.cameraRollPermission !== 'granted') {
      Alert.alert('Error', 'We need permission to access photos.')
    } else if (this.state.cameraPermission !== 'granted') {
      Alert.alert('Error', 'We need permission to access the camera.')
    } else {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.1,
        aspect: [4, 4]
      })
      if (!result.cancelled) {
        this.onImageChange(result.uri)
      }
    }
  }

  async pickImage () {
    if (Platform.OS === 'ios' &&
      this.state.cameraRollPermission !== 'granted') {
      Alert.alert('Error', 'We need permission to access to photos.')
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.1,
        aspect: [4, 4]
      })
      if (!result.cancelled) {
        this.onImageChange(result.uri)
      }
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
    ]
    if (Platform.OS === 'ios') {
      buttons.push({
        text: 'CLOSE',
        style: 'cancel'
      })
    }
    Alert.alert('Profile Picture', '', buttons)
  }

  render () {
    const {avatarProps} = this.props
    const {image} = this.state
    if (image) {
      avatarProps.pictureUrl = image
    }

    return (
      <TouchableOpacity onPress={this.showOptions.bind(this)}>
        <Avatar {...avatarProps} />
        <View style={{position: 'absolute', bottom: 0, right: 0}}>
          <Icon name='camera' color={Theme.lightBlue} size={24} />
        </View>
      </TouchableOpacity>
    )
  }
}

ProfilePicturePicker.propTypes = {
  avatarProps: PropTypes.object.isRequired,
  onImageChange: PropTypes.func.isRequired
}
