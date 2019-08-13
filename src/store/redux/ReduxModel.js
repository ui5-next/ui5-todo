import ClientModel from "sap/ui/model/ClientModel";
import { createStore, applyMiddleware, compose } from "redux";
import ReduxPropertyBinding from "./ReduxPropertyBinding";
import Context from "sap/ui/model/Context";
import ReduxListBinding from "./ReduxListBinding";
import ReduxTreeBinding from './ReduxTreeBinding';
import { trimStart, trimEnd } from "lodash";
import ReduxThunk from 'redux-thunk';

import { get } from "./Util";

const CONST_SET_PROPERTY = "Internal.SetProperty";

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const DEFAULT_MODEL_LIST_MAX_SIZE = Number.MAX_SAFE_INTEGER || 100000000;

export interface ActionData {
  /**
   * action type
   */
  type: string,
  /**
   * action param
   */
  param: any,
}

export type ThunkAction<T> = (dispatch: (action: ActionData | ThunkAction) => void, getState: () => T) => Promise<void>;

/**
 * Redux Model
 */
export default class ReduxModel<T> extends ClientModel {

  metadata = {
    publicMethods: ["registerReducer", "dispatch"]
  }

  constructor(initializeState: T = {}) {

    super();

    this.setSizeLimit(DEFAULT_MODEL_LIST_MAX_SIZE);

    this._initStore(initializeState);

  }

  _initStore(initState: T) {

    this.reducers = {

      [CONST_SET_PROPERTY]: {
        type: CONST_SET_PROPERTY,
        perform: this._setPropertyReducer
      }

    };

    this._store = createStore(
      // reducer
      (oState = initState, oActionData: ActionData) => {
        const reducer = this.reducers[oActionData.type];
        if (reducer) {
          var tmpState = { ...oState };
          return reducer.perform(tmpState, oActionData.param) || tmpState;
        } else {
          return oState;
        }
      },
      // with redux devtools browser plugin
      composeEnhancer(applyMiddleware(ReduxThunk))
    );

    this._store.subscribe(() => {
      // once any data updated, perform check
      this.checkUpdate();
    });

  }

  _setPropertyReducer(oState, { sPath = "", oValue, oContext }) {

    // maybe need update with general way
    sPath = trimStart(trimEnd(sPath, "}"), "{");

    if (oContext) {

      // with context, need combine the context path and the input sPath
      var sProperty = sPath;
      sPath = oContext.getPath();
      const oUpdateBase = get(oState, sPath.split("/").filter(v => v)) || {};
      oUpdateBase[sProperty] = oValue;

    } else {

      const aParts = (sPath.split("/")).filter(v => v);
      const sProperty = aParts.pop();

      // fix root object reference
      if (aParts > 0) {
        const oUpdateBase = get(oState, aParts) || {};
        oUpdateBase[sProperty] = oValue;
      } else {
        oState[sProperty] = oValue;
      }
    }

    return oState;
  }

  /**
   * addReducer function
   *
   * Register new reducer to global store
   *
   * with function instead of transitional way just for single way dependency
   *
   * and more dynamic provided
   * @param {string} type reducer response action type
   * @param {function} perform logic
   * @param {boolean} bForce overwrite or not
   */
  addReducer(type: String, perform: (oState: T, oParam: any) => T, bForce: Boolean = false) {

    if (!this.reducers[type] || bForce) {
      this.reducers[type] = { type, perform };
    } else {
      throw new Error(`reducer for action ${type} has been registered`);
    }

  }

  setProperty(sPath, oValue, oContext, bAsyncUpdate) {
    this.dispatch({ type: CONST_SET_PROPERTY, param: { sPath, oValue, oContext } });
    return true;
  }

  getProperty(sPath, oContext) {
    return this._getObject(sPath, oContext);
  }

  _getObject(sPath, oContext, bWithOriginalStore) {
    var oNode = null;
    if (oContext instanceof Context) {
      oNode = this._getObject(oContext.getPath());
    } else if (oContext) {
      oNode = oContext;
    }
    if (!sPath) {
      return oNode;
    }

    var oState = { ...this._store.getState() }; // clone
    var iIndex = 0;
    var aParts = sPath.split('/');

    if (!aParts[0]) {
      // absolute path starting with slash
      if (aParts[1] === 'selector') {
        oNode = this.oSelectors[aParts[2]](oState, oContext);
        iIndex = 3;
      } else {
        oNode = oState[aParts[1]];
        iIndex = 2;
      }
    }

    while (oNode && aParts[iIndex]) {
      var sPart = aParts[iIndex];
      var oTmpNode = oNode[sPart];
      if (typeof oTmpNode === 'function') {
        oNode = oTmpNode(oState, oContext);
      } else {
        oNode = oTmpNode;
      }
      iIndex += 1;
    }

    return oNode;
  }

  /**
   * dispatch redux action
   *
   * @param {ActionData} oAction
   */
  dispatch(oAction: ActionData | ThunkAction<T>) {
    this._store.dispatch(oAction);
  }

  /**
   * dispatch action event
   * @param {string} type
   * @param {any} param
   */
  dispatchAction(type: String, param: any) {
    this.dispatch({ type, param });
  }

  /**
   * dispatch thunk action
   */
  dispatchFunction(thunk: ThunkAction<T>) {
    this.dispatch(thunk);
  }

  bindProperty(sPath, oContext, mParameters) {
    return new ReduxPropertyBinding(this, sPath, oContext, mParameters);
  }

  bindTree(sPath, oContext, aFilters, mParameters, aSorters) {
    return new ReduxTreeBinding(this, sPath, oContext, aFilters, mParameters, aSorters);
  }

  bindList(sPath, oContext, aSorters, aFilters, mParameters) {
    return new ReduxListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
  }

}

