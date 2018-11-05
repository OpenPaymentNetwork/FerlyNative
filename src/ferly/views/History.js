import HistoryEntry from 'ferly/components/HistoryEntry'
import Spinner from 'ferly/components/Spinner'
import PropTypes from 'prop-types'
import React from 'react'
import {View, FlatList, Text} from 'react-native'
import {apiRequire, apiInject} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

export class History extends React.Component {
  static navigationOptions = {
    title: 'History'
  };

  constructor (props) {
    super(props)
    this.state = {
      updating: false
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.historyUrl)
  }

  loadMore () {
    const {hasMore, limit, history, historyUrl} = this.props
    const {updating} = this.state
    this.setState({updating: true})
    if (!hasMore || updating) {
      return
    }
    const nextUrl = createUrl('history', {limit: limit, offset: history.length})
    fetch(nextUrl)
      .then((response) => response.json())
      .then((responseJson) => {
        const newHistory = history.concat(responseJson.history)
        this.props.apiInject(historyUrl, {
          'history': newHistory,
          'has_more': responseJson.has_more
        })

        // TODO don't set state here in case they navigate away while loading
        this.setState({updating: false})
      })
  }

  render () {
    const {history} = this.props
    if (!history) {
      return <Spinner />
    }
    return (
      <View>
        <FlatList
          ListEmptyComponent={<Text>You have no history</Text>}
          initialNumToRender={10}
          getItemLayout={(data, index) => (
            {length: 90, offset: index * 90, index})}
          onEndReached={(info) => this.loadMore()}
          onEndReachedThreshold={10}
          keyExtractor={(entry) => entry.timestamp}
          data={history}
          renderItem={(entry) => <HistoryEntry entry={entry.item} />} />
      </View>
    )
  }
}

History.propTypes = {
  apiInject: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  history: PropTypes.array,
  historyUrl: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired
}

function mapStateToProps (state) {
  const limit = 30 // If you change this. change url in give/purchase also
  const historyUrl = createUrl('history', {limit: limit})
  const apiStore = state.apiStore
  const historyResponse = apiStore[historyUrl] || {}
  const history = historyResponse.history
  const hasMore = historyResponse.has_more
  return {
    hasMore,
    historyUrl,
    history,
    limit
  }
}

const mapDispatchToProps = {
  apiInject,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(History)
