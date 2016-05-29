import React from 'react'
import ReactPaginate from 'react-paginate'

/** since react-paginate support css style only, we need a stylesheet */
import * as paginatorStyle from './style.css'

const styles = {
  container: {

  },
}

export default class Paginator extends React.Component {

  static propTypes = {
    handler: React.PropTypes.func.isRequired,
    totalItemCount: React.PropTypes.number.isRequired,
    currentPageOffset: React.PropTypes.number.isRequired,
    itemCountPerPage: React.PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props)

    this.handlePageChange = this.handlePageChange.bind(this)
  }

  handlePageChange(data) {
    const { handler, } = this.props

    if (data.selected || Number.isInteger(data.selected) || handler ) {
      handler(data.selected) /** return currentPageOffset (zero-based offset) */
    }
  }

  render() {
    const { totalItemCount, currentPageOffset, itemCountPerPage, } = this.props
    const totalPageCount = Math.ceil(totalItemCount / itemCountPerPage)

    return(
      <ReactPaginate previousLabel={"prev"}
                     nextLabel={"next"}
                     breakLabel={<li className="break"><a href="">...</a></li>}
                     forceSelected={currentPageOffset}
                     pageNum={totalPageCount}
                     marginPagesDisplayed={1}
                     pageRangeDisplayed={3}
                     clickCallback={this.handlePageChange}
                     containerClassName={"pagination"}
                     subContainerClassName={"pages pagination"}
                     activeClassName={paginatorStyle.activeLabel} />

    )
  }
}
