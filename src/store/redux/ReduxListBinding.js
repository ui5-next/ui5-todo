import ClientListBinding from "sap/ui/model/ClientListBinding";
import deepEqual from "sap/base/util/deepEqual";
import ChangeReason from "sap/ui/model/ChangeReason";


export default class ReduxListBinding extends ClientListBinding {

  getContexts(iStartIndex, iLength) {

    // enhance here logic to impl the infinite scroll feature
    this.iLastStartIndex = iStartIndex;
    this.iLastLength = iLength;

    if (!iStartIndex) {
      iStartIndex = 0;
    }
    if (!iLength) {
      iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
    }

    return this._getContexts(iStartIndex, iLength);

  }

  getCurrentContexts() {
    return this.getContexts(this.iLastStartIndex, this.iLastLength);
  }

  updateIndices() {
    var i;

    this.aIndices = [];
    if (Array.isArray(this.oList)) {
      for (i = 0; i < this.oList.length; i++) {
        this.aIndices.push(i);
      }
    } else {
      for (i in this.oList) {
        this.aIndices.push(i);
      }
    }
  }

  update() {
    var oList = this.oModel._getObject(this.sPath, this.oContext);
    if (oList) {
      if (Array.isArray(oList)) {
        this.oList = oList.slice(0);
      } else {
        this.oList = jQuery.extend(true, {}, oList);
      }
      this.updateIndices();
      this.applyFilter();
      this.applySort();
      this.iLength = this._getLength();
    } else {
      this.oList = [];
      this.aIndices = [];
      this.iLength = 0;
    }
  }

  checkUpdate(bForceUpdate) {

    if (this.bSuspended && !this.bIgnoreSuspend && !bForceUpdate) {
      return;
    }

    var oList = this.oModel._getObject(this.sPath, this.oContext);
    if (!deepEqual(this.oList, oList) || bForceUpdate) {
      this.update();
      this._fireChange({ reason: ChangeReason.Change });
    }

  }

}
