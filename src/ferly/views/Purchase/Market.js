import CashDisplay from 'ferly/components/CashDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire} from 'ferly/store/api'
import {View, TouchableOpacity} from 'react-native'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

export class Market extends React.Component {
  static navigationOptions = {
    title: 'Marketplace'
  };

  componentDidMount () {
    this.props.apiRequire(this.props.designsUrl)
  }

  render () {
    const {designs} = this.props
    return (
      <View style={{flex: 1, paddingHorizontal: 20}}>
        {
          designs.map((design) => {
            return (
              <TouchableOpacity
                key={design.id}
                onPress={
                  () => this.props.navigation.navigate('Purchase', {design})}>
                <CashDisplay design={design} />
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }
}

Market.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  designs: PropTypes.array.isRequired,
  designsUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  const designsUrl = createUrl('list-designs')
  const apiStore = state.apiStore
  const designs = apiStore[designsUrl] || []

  return {
    designsUrl,
    designs
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Market)
