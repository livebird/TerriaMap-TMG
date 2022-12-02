import React from "react";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import SearchResult from "./SearchResult";
import classNames from "classnames";
import Icon from "../../Styled/Icon";
import Styles from "./sidebar-dataset-search-results.scss";
import { withTranslation } from "react-i18next";
const SideBarDatasetSearchResults = observer(createReactClass({
    displayName: "SideBarDatasetSearchResults",
    propTypes: {
        viewState: PropTypes.object.isRequired,
        terria: PropTypes.object.isRequired,
        theme: PropTypes.string,
        t: PropTypes.func.isRequired
    },
    getDefaultProps() {
        return {
            theme: "light"
        };
    },
    getInitialState() {
        return {
            isOpen: true
        };
    },
    searchInDataCatalog() {
        const { searchState } = this.props.viewState;
        runInAction(() => {
            // Set text here so that it doesn't get batched up and the catalog
            // search text has a chance to set isWaitingToStartCatalogSearch
            searchState.catalogSearchText = searchState.locationSearchText;
        });
        this.props.viewState.searchInCatalog(searchState.locationSearchText);
    },
    toggleGroup() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    },
    render() {
        const { t } = this.props;
        return (React.createElement("div", { key: "data", className: classNames(Styles.providerResult, {
                [Styles.isOpen]: this.state.isOpen,
                [Styles.dark]: this.props.theme === "dark",
                [Styles.light]: this.props.theme === "light"
            }) },
            React.createElement("button", { onClick: this.toggleGroup, className: Styles.heading },
                React.createElement("span", null, t("search.data")),
                React.createElement(Icon, { glyph: this.state.isOpen ? Icon.GLYPHS.opened : Icon.GLYPHS.closed })),
            React.createElement("ul", { className: Styles.items }, this.props.viewState.searchState.catalogSearchProvider && (React.createElement(SearchResult, { clickAction: this.searchInDataCatalog, icon: "data", name: t("search.search", {
                    searchText: this.props.viewState.searchState.locationSearchText
                }) })))));
    }
}));
module.exports = withTranslation()(SideBarDatasetSearchResults);
//# sourceMappingURL=SideBarDatasetSearchResults.js.map