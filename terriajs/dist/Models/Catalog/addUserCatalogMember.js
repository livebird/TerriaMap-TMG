import i18next from "i18next";
import defaultValue from "terriajs-cesium/Source/Core/defaultValue";
import getDereferencedIfExists from "../../Core/getDereferencedIfExists";
import isDefined from "../../Core/isDefined";
import GroupMixin from "../../ModelMixins/GroupMixin";
import GroupTraits from "../../Traits/TraitsClasses/GroupTraits";
import CommonStrata from "../Definition/CommonStrata";
import hasTraits from "../Definition/hasTraits";
/**
 * Adds a user's catalog item or group to the catalog.
 *
 */
export default async function addUserCatalogMember(terria, newCatalogMemberOrPromise, options = {}) {
    const promise = newCatalogMemberOrPromise instanceof Promise
        ? newCatalogMemberOrPromise
        : Promise.resolve(newCatalogMemberOrPromise);
    try {
        const newCatalogItem = await promise;
        if (!isDefined(newCatalogItem)) {
            return;
        }
        terria.catalog.userAddedDataGroup.setTrait(CommonStrata.user, "isOpen", true);
        terria.catalog.userAddedDataGroup.add(CommonStrata.user, newCatalogItem);
        const dereferenced = getDereferencedIfExists(newCatalogItem);
        if (isDefined(options.open) &&
            hasTraits(dereferenced, GroupTraits, "isOpen")) {
            dereferenced.setTrait(CommonStrata.user, "isOpen", true);
        }
        if (defaultValue(options.enable, true) &&
            !GroupMixin.isMixedInto(dereferenced)) {
            (await terria.workbench.add(dereferenced)).throwIfError();
        }
        return newCatalogItem;
    }
    catch (e) {
        terria.raiseErrorToUser(e, {
            title: i18next.t("models.userData.addingDataErrorTitle"),
            message: i18next.t("models.userData.addingDataErrorTitle")
        });
        return e;
    }
}
//# sourceMappingURL=addUserCatalogMember.js.map