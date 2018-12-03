import CashDisplay from 'ferly/components/CashDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {TouchableOpacity, ScrollView} from 'react-native'

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
      <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
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
      </ScrollView>
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
  const apiStore = state.api.apiStore
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
