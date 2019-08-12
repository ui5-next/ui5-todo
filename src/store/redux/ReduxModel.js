import ClientModel from "sap/ui/model/ClientModel";
import { cloneDeep } from "lodash";
import { createStore, applyMiddleware, compose } from "redux";
import ReduxPropertyBinding from "./ReduxPropertyBinding";
import Context from "sap/ui/model/Context";
import ReduxListBinding from "./ReduxListBinding";
import ReduxTreeBinding from './ReduxTreeBinding';
import { get, trimStart, trimEnd } from "lodash";
import ReduxThunk from 'redux-thunk';

const CONST_SET_PROPERTY = "Internal.SetProperty";

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

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

export interface Reducer<T> {
  /**
   * action type
   */
  type: string,
  /**
   * consume action data and return new state
   */
  perform: (actionData: ActionData, state: T) => T
}

export default class ReduxModel<T> extends ClientModel {

  metadata = {
    publicMethods: ["registerReducer", "dispatch"]
  }

  constructor(initializeState: T = {}) {

    super();

    this.reducers = {

      [CONST_SET_PROPERTY]: {
        type: CONST_SET_PROPERTY,
        perform: ({ param: { sPath = "", oValue, oContext } }, oState) => {

          sPath = trimStart(trimEnd(sPath, "}"), "{");

          if (oContext) {
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
      }

    };

    this._store = createStore(
      // reducer
      (oState = initializeState, oActionData) => {
        const reducer: Reducer = this.reducers[oActionData.type];
        if (reducer) {
          return reducer.perform(oActionData, cloneDeep(oState)) || oState;
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

  /**
 * Register new reducer to global store
 *
 * with function instead of transitional way just for single way dependency
 *
 * and more dynamic provided
 *
* @param {Reducer} reducer
* @param {boolean} bForce
  */
  registerReducer(reducer: Reducer<T>, bForce = false) {

    if (!this.reducers[reducer.type] || bForce) {
      this.reducers[reducer.type] = reducer;
    } else {
      throw new Error(`reducer for action ${reducer.type} has been registered`);
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

    var oState = cloneDeep(this._store.getState());
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

  dispatch(...params) {
    this._store.dispatch(...params);
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

