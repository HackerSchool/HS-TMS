import React from "react";
import DropdownBtn from "./DropdownBtn";
import SortIcon from "@mui/icons-material/Sort";

/**
 * @interface Option - { text, orderBy, order }, example: {text: 'Newest first', orderBy: 'date', order: 'DESC'}
 * with 'orderBy' and 'order' being allowed values by the API
 * @param {URLSearchParams} params - the current URL params
 * @param {Function} setParams - the function to change the URL params
 * @param {Function} refetch - callback to signal that params have been changed and a content refetch is needed
 * @param {Array} options - Array with all the sorting options, each one following the 'Option' interface
 * @param {boolean} loading - optional argument that specifies if the resource associated with options is loading
 * @returns a Dropdown with the {options} listed that is synchronized with the URL query params
 */
export default function SortButton({ params, setParams, refetch, options, loading = false }) {
  function getDefaultIndex() {
    let idx = -1;
    if (params.get("orderBy") && params.get("order")) {
      idx = options.findIndex(
        option => option.orderBy === params.get("orderBy") && option.order === params.get("order")
      );
    }
    return idx === -1 ? 0 : idx;
  }

  const onSortOptionSelection = chosenOption => {
    setParams(oldParams => {
      // If the order we are setting is the default, no need to use query params
      if (chosenOption.orderBy === options[0].orderBy && chosenOption.order === options[0].order) {
        oldParams.delete("orderBy");
        oldParams.delete("order");
        return oldParams;
      }

      return {
        ...Object.fromEntries(oldParams.entries()),
        orderBy: chosenOption.orderBy,
        order: chosenOption.order,
      };
    });
    refetch();
  };

  return (
    <DropdownBtn
      icon={<SortIcon />}
      options={options}
      onOptionSelection={onSortOptionSelection}
      defaultIndex={getDefaultIndex()}
      loading={loading}
    />
  );
}
