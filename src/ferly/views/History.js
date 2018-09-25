import HistoryEntry from 'ferly/components/HistoryEntry'
import Spinner from 'ferly/components/Spinner'
import PropTypes from 'prop-types'
import React from 'react'
import {View, FlatList, Text} from 'react-native'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

export class History extends React.Component {
  static navigationOptions = {
    title: 'History'
  };

  componentDidMount () {
    this.props.apiRequire(this.props.historyUrl)
    // Use wallet url for keeping profile info in drawer for now.
    this.props.apiRequire(createUrl('wallet'))
  }

  render () {
    const {history} = this.props
    if (!history) {
      return <Spinner />
    } else if (history.length === 0) {
      return <Text>You have no history</Text>
    }

    return (
      <View>
        <FlatList
          // onEndReached={(info) => console.log('end!!:', info)}
          // onEndReachedThreshold={50}
          data={history}
          renderItem={(entry) => <HistoryEntry entry={entry.item} />} />
      </View>
    )
  }
}

History.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  history: PropTypes.array,
  historyUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const historyUrl = createUrl('history')
  const apiStore = state.apiStore
  const historyResponse = apiStore[historyUrl] || {}
  const history = historyResponse.history
  return {
    historyUrl,
    history
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(History)
