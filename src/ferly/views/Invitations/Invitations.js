import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native'
import {format as formatDate} from 'date-fns'

export class Invitations extends React.Component {
  static navigationOptions = {
    title: 'Invitations'
  }

  componentDidMount () {
    this.props.apiRequire(this.props.invitationsUrl)
  }

  deleteInvite (invite) {
    post('delete-invitation', {invite_id: invite.id.toString()})
      .then((response) => response.json())
      .then((json) => {
        if (Object.keys(json).length === 0) {
          this.props.apiExpire(this.props.invitationsUrl)
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Invitations'})]
          })
          this.props.navigation.dispatch(resetAction)
          Alert.alert('Deleted',
            `Your invitation to ${invite.recipient} has been deleted.`)
        }
      })
  }

  renderInvite (invite) {
    const b = invite.created.split(/\D+/)
    const date = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5]))
    // React Native doesn't fully support Date.toLocaleString() on Android
    // use date-fns. Expect the JavaScriptCore to be updated in SDK 31.
    const dateDisplay = formatDate(date, 'MMM D, YYYY h:mm A')
    return (
      <View key={invite.id} style={{
        marginBottom: 14,
        borderRadius: 5,
        height: 160,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'lightgray',
        elevation: 1.8,
        shadowOffset: {width: 2, height: 2},
        shadowColor: 'lightgray',
        shadowOpacity: 1
      }}>
        <View
          style={{
            paddingLeft: 20,
            height: 40,
            backgroundColor: Theme.lightBlue,
            justifyContent: 'center'
          }}>
          <Text style={{fontSize: 22, color: Theme.darkBlue}}>Invited</Text>
        </View>
        <View
          style={{
            height: 80,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: 'lightgray',
            alignItems: 'center',
            paddingLeft: 20
          }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'gray',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Icon
              name={invite.recipient.indexOf('@') > -1 ? 'envelope' : 'phone'}
              color="white"
              size={22} />
          </View>
          <View style={{marginLeft: 20}}>
            <Text style={{fontSize: 18, color: Theme.darkBlue}}>
              {invite.recipient}
            </Text>
            <Text style={{color: 'gray'}}>{dateDisplay}</Text>
          </View>
        </View>
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={{
              width: 110,
              paddingLeft: 20,
              height: 40,
              justifyContent: 'center'
            }}
            onPress={() => this.deleteInvite(invite)}>
            <Text style={{fontSize: 20, color: Theme.lightBlue}}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render () {
    const {pending, navigation} = this.props

    let renderedPending
    if (pending && pending.length > 0) {
      renderedPending = (
        <View
          style={{borderTopWidth: 1,
            borderColor: 'lightgray',
            paddingHorizontal: 20
          }}>
          <Text
            style={{color: Theme.darkBlue, fontSize: 22, paddingVertical: 12}}>
            Pending Invitations
          </Text>
          {pending.map((invite) => this.renderInvite(invite))}
        </View>
      )
    }

    return (
      <ScrollView contentContainerStyle={{paddingVertical: 15}}>
        <Text style={{color: Theme.darkBlue, fontSize: 22, paddingLeft: 20}}>
          Send
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Contacts')}>
          <View
            style={styles.iconContainer}>
            <Icon
              name='plus'
              color="white"
              size={16} />
          </View>
          <Text style={styles.buttonText}>From Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ManualAdd')}>
          <View
            style={styles.iconContainer}>
            <Icon
              name='plus'
              color="white"
              size={16} />
          </View>
          <Text style={styles.buttonText}>New</Text>
        </TouchableOpacity>
        <View style={{marginTop: 10}} />
        {renderedPending}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20
  },
  button: {alignItems: 'center', flexDirection: 'row', paddingVertical: 10},
  buttonText: {color: Theme.lightBlue, fontSize: 18}
})

Invitations.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  invitationsUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired,
  pending: PropTypes.array
}

function mapStateToProps (state) {
  const invitationsUrl = createUrl('existing-invitations', {status: 'pending'})
  const apiStore = state.api.apiStore
  const pendingInvitations = apiStore[invitationsUrl] || {}
  const pending = pendingInvitations.results

  return {
    invitationsUrl,
    pending
  }
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Invitations)
