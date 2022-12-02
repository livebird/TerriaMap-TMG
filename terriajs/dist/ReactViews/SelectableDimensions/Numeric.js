import { runInAction } from "mobx";
import React from "react";
import CommonStrata from "../../Models/Definition/CommonStrata";
import Input from "../../Styled/Input";
export const SelectableDimensionNumeric = ({ id, dim }) => {
    return (React.createElement(Input, { styledHeight: "34px", light: true, border: true, type: "number", name: id, value: dim.value, min: dim.min, max: dim.max, onChange: (evt) => {
            runInAction(() => dim.setDimensionValue(CommonStrata.user, parseFloat(evt.target.value)));
        } }));
};
//# sourceMappingURL=Numeric.js.map