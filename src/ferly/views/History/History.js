import HistoryEntry from 'ferly/components/HistoryEntry';
import Spinner from 'ferly/components/Spinner';
import PropTypes from 'prop-types';
import React from 'react';
import {View, FlatList, Text} from 'react-native';
import {apiRequire, apiInject, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {urls} from 'ferly/utils/fetch';

export class History extends React.Component {
  static navigationOptions = {
    title: 'History'
  };

  constructor (props) {
    super(props);
    this.state = {
      updating: false
    };
  }

  componentDidMount () {
    this.props.apiRequire(urls.history);
  }

  loadMore () {
    const {hasMore, history} = this.props;
    const {updating} = this.state;
    this.setState({updating: true});
    if (!hasMore || updating) {
      return;
    }
    const nextUrl = `${urls.history}&offset=${history.length}`;
    fetch(nextUrl, {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceId
      }})
      .then((response) => response.json())
      .then((responseJson) => {
        const newHistory = history.concat(responseJson.history);
        this.props.apiInject(urls.history, {
          'history': newHistory,
          'has_more': responseJson.has_more
        });

        // TODO don't set state here in case they navigate away while loading
        this.setState({updating: false});
      });
  }

  render () {
    const {history, navigation} = this.props;
    if (!history) {
      return <Spinner />;
    }
    return (
      <View>
        <FlatList
          onRefresh={() => this.props.apiRefresh(urls.history)}
          refreshing={false}
          ListEmptyComponent={<Text>You have no history</Text>}
          initialNumToRender={10}
          getItemLayout={(data, index) => (
            {length: 90, offset: index * 90, index})}
          onEndReached={(info) => this.loadMore()}
          onEndReachedThreshold={10}
          keyExtractor={(entry) => entry.timestamp}
          data={history}
          renderItem={
            (entry) => (
              <HistoryEntry navigation={navigation} entry={entry.item} />
            )} />
      </View>
    );
  }
}

History.propTypes = {
  apiInject: PropTypes.func.isRequired,
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  navigation: PropTypes.object.isRequired,
  history: PropTypes.array,
  deviceId: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceId} = state.settings;
  const apiStore = state.api.apiStore;
  const historyResponse = apiStore[urls.history] || {};
  const history = historyResponse.history;
  const hasMore = historyResponse.has_more;
  return {
    hasMore,
    history,
    deviceId
  };
}

const mapDispatchToProps = {
  apiInject,
  apiRequire,
  apiRefresh
};

export default connect(mapStateToProps, mapDispatchToProps)(History);
