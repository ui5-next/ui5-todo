import ClientTreeBinding from "sap/ui/model/ClientTreeBinding";

export default class ReduxTreeBinding extends ClientTreeBinding {

  _saveSubContext(oNode, aContexts, sContextPath, sName) {
    // only collect node if it is defined (and not null), because typeof null == "object"!
    if (oNode && typeof oNode == "object") {
      var oNodeContext = this.oModel.getContext(sContextPath + sName);
      // check if there is a filter on this level applied
      if (this.oCombinedFilter && !this.bIsFiltering) {
        if (this.filterInfo.aFilteredContexts && this.filterInfo.aFilteredContexts.indexOf(oNodeContext) != -1) {
          aContexts.push(oNodeContext);
        }
      } else {
        aContexts.push(oNodeContext);
      }
    }
  }


}