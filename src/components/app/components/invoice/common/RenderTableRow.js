import React,{Component , Fragment} from 'react';
import {
    _documentTitle,
    _showExchangeRate,
    getAmountToDisplay,
    _calculateExchangeRate,
    _setCurrency
  } from '../../../../../utils/GlobalFunctions'
  import SelectBox from '../../../../../utils/formWrapper/SelectBox'
  import {ReactSVG} from 'react-svg'

export default class RenderTableRow extends Component{
    constructor(props){
        super(props);
    }


render(){
    const {
        products,
        handleProduct,
        handleDelete,
        items,
        itemsHtml,
        handleItemBlur,
        list,
        from,
        children
        } = this.props;

        const placeholder = <div className="placeholderContent">Drop Here!!!</div>
    return(

            items.length > 0
              ? items.map((item, i) => {
                  return (
                    <div key={i} >
                      {item.item === undefined ? (
                        <div className="invoice-item-table-body">
                          <div className="py-table__cell w-100">
                            <SelectBox
                              autoFocus={true}
                              defaultMenuIsOpen={true}
                              getOptionLabel={(value) => (from === "estimate" ? value["name"] : value["column1"])}
                              getOptionValue={(value) => (value["item"])}
                              className="h-100 select-height invoice-add-select"
                              placeholder="Type an item name"
                              value={undefined}
                              onChange={item => handleProduct(item, i)}
                              options={products}
                              onBlur={handleItemBlur}
                            />
                          </div>
                          {/*<div className="py-table__cell">
                            <ReactSVG
                              src="/assets/icons/ic_delete.svg"
                              afterInjection={(error, svg) => {
                                if (error) {
                                  return
                                }
                              }}
                              beforeInjection={svg => {
                                svg.classList.add('py-svg-icon')
                              }}
                              renumerateIRIElements={false}
                              className="Icon py-table__action__danger"
                              onClick={() => handleDelete(i)}
                            />
                          </div>*/}
                        </div>
                      ) : (
                        i === 0 && item.item!==undefined &&(
                        <div>{children}</div>
                        )


                          // <DragSortableList
                          //   items={list}
                          //   placeholder={placeholder}
                          //   onSort={onSort}
                          //   type="vertical"
                          // />

                      )}
                    </div>
                  )
                })
              : ''

    )
}

}