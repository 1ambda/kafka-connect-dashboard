import React from 'react'
import ReactPaginate from 'react-paginate'

/** since react-paginate support css style only, we need a stylesheet */
import * as paginatorStyle from './style.css'

const styles = {
  container: {

  },
}

export default class Paginator extends React.Component {

  handlePageChange(data) {
    const { handler, } = this.props

    if (data.selected || Number.isInteger(data.selected) || handler ) {
      handler(data.selected) /** return currentPageOffset (zero-based offset) */
    }
  }

  render() {

    const { style, handler, totalItemCount, currentPageOffset, itemCountPerPage, } = this.props
    const mergedStyle = Object.assign({}, styles.container, style)

    const totalPageCount = Math.ceil(totalItemCount / itemCountPerPage)

    return(
      <ReactPaginate previousLabel={"prev"}
                     nextLabel={"next"}
                     breakLabel={<li className="break"><a href="">...</a></li>}
                     forceSelected={currentPageOffset}
                     pageNum={totalPageCount}
                     marginPagesDisplayed={1}
                     pageRangeDisplayed={3}
                     clickCallback={this.handlePageChange.bind(this)}
                     containerClassName={"pagination"}
                     subContainerClassName={"pages pagination"}
                     activeClassName={paginatorStyle.activeLabel} />

    )
  }
}

Paginator.propTypes = {
  style: React.PropTypes.object,
  handler: React.PropTypes.func.isRequired,
  totalItemCount: React.PropTypes.number.isRequired,
  currentPageOffset: React.PropTypes.number.isRequired,
  itemCountPerPage: React.PropTypes.number.isRequired,
}
