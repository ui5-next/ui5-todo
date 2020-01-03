import ReduxModel from "./redux/ReduxModel";

/**
 * Application initialize state
 */
const AppInitState = {
  /**
   * tmp string to store new to-do string text
   */
  NewToDoValue: "",
  /**
   * only show favorite to-do items indicator
   */
  bShowFavorite: false,
  bShowFinished: true,
  bSideExpand: false,

  bDialogVisible: false,
  sNewListName: "",
  sSelectedList: "__ALL__",
  aListCategories: [
    {
      sKey: "__ALL__",
      sName: "All"
    }
  ],

  /**
   * to-do tasks list
   */
  ToDoList: [
    {
      sText: "Cooking",
      bFinished: true,
      sList: "",
      bFavorite: false
    },
    {
      sText: "Read 42",
      bFinished: false,
      sList: "",
      bFavorite: true
    }
  ]
};

export const GlobalStore = new ReduxModel(AppInitState, "UI5ToDoList");
