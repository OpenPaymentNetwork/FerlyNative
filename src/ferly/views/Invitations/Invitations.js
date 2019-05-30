import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import TestElement from 'ferly/components/TestElement'
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

  constructor (props) {
    super(props)
    this.state = {
      deleting: false
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.invitationsUrl)
  }

  deleteInvite (invite) {
    this.setState({deleting: true})
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
        } else {
          this.setState({deleting: false})
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
      <TestElement
        parent={View}
        label='test-id-invitations'
        key={invite.id} style={styles.invitationContainer}>
        <View style={styles.invitationHeader}>
          <Text style={{fontSize: 22, color: Theme.darkBlue}}>Invited</Text>
        </View>
        <View style={styles.invitationBody}>
          <View style={styles.invitationIconContainer}>
            <Icon
              name={invite.recipient.indexOf('@') > -1 ? 'envelope' : 'phone'}
              color="white"
              size={22} />
          </View>
          <View style={{marginLeft: 20}}>
            <Text style={styles.recipientText}>{invite.recipient}</Text>
            <Text style={{color: 'gray'}}>{dateDisplay}</Text>
          </View>
        </View>
        <View style={{flex: 1}}>
          <TouchableOpacity
            style={styles.invitationActionButton}
            disabled={this.state.deleting}
            onPress={() => this.deleteInvite(invite)}>
            <Text style={{fontSize: 20, color: Theme.lightBlue}}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </TestElement>
    )
  }

  render () {
    const {pending, navigation} = this.props

    let renderedPending
    if (pending && pending.length > 0) {
      renderedPending = (
        <View style={styles.pendingTitleContainer}>
          <Text style={styles.pendingTitle}>Pending Invitations</Text>
          {pending.map((invite) => this.renderInvite(invite))}
        </View>
      )
    }

    const addIcon = (
      <View style={styles.addIconContainer}>
        <Icon name='plus' color="white" size={16} />
      </View>
    )

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <ScrollView contentContainerStyle={{paddingVertical: 15}}>
          <Text style={styles.headerText}>Send</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Contacts')}>
            {addIcon}
            <Text style={styles.buttonText}>From Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ManualAdd')}>
            {addIcon}
            <Text style={styles.buttonText}>New</Text>
          </TouchableOpacity>
          <View style={{marginTop: 10}} />
          {renderedPending}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  invitationContainer: {
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
  },
  invitationHeader: {
    paddingLeft: 20,
    height: 40,
    backgroundColor: Theme.lightBlue,
    justifyContent: 'center'
  },
  invitationBody: {
    height: 80,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'lightgray',
    alignItems: 'center',
    paddingLeft: 20
  },
  invitationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center'
  },
  invitationActionButton: {
    width: 110,
    paddingLeft: 20,
    height: 40,
    justifyContent: 'center'
  },
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
  buttonText: {color: Theme.lightBlue, fontSize: 18},
  headerText: {color: Theme.darkBlue, fontSize: 22, paddingLeft: 20},
  pendingTitleContainer: {
    borderTopWidth: 1,
    borderColor: 'lightgray',
    paddingHorizontal: 20
  },
  pendingTitle: {color: Theme.darkBlue, fontSize: 22, paddingVertical: 12},
  recipientText: {fontSize: 18, color: Theme.darkBlue}
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
  const {results: pending = []} = apiStore[invitationsUrl] || {}

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
