import ClientPropertyBinding from "sap/ui/model/ClientPropertyBinding";
import ChangeReason from "sap/ui/model/ChangeReason";
import deepEqual from "sap/base/util/deepEqual";

export default class ReduxPropertyBinding extends ClientPropertyBinding {


  setValue(oValue) {
    if (this.bSuspended) {
      return;
    }
    if (!deepEqual(this.oValue, oValue)) {
      if (this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
        this.oValue = oValue;
        this.getDataState().setValue(this.oValue);
        this.oModel.firePropertyChange({ reason: ChangeReason.Binding, path: this.sPath, context: this.oContext, value: oValue });
      }
    }
  }

  /**
   * Get the previous state
   */
  getPreState() {
    return this.oPreValue;
  }

  getState() {
    return this.getValue();
  }

  checkUpdate(bForceUpdate) {

    if (this.bSuspended) {
      return;
    }

    var oValue = this._getValue();

    if (!deepEqual(oValue, this.oValue) || bForceUpdate) {
      this.oPreValue = this.oValue;
      this.oValue = oValue;
      this.getDataState().setValue(this.oValue);
      this.checkDataState();
      this._fireChange({ reason: ChangeReason.Change });
    }
  }

}