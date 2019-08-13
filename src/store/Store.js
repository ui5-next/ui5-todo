import ReduxModel from "./redux/ReduxModel";

/**
 * Application initialize state
 */
const InitState = {
  /**
   * tmp string to store new to-do string text
   */
  NewToDoValue: "",
  /**
   * only show favorite to-do items indicator
   */
  bShowFavorite: false,
  /**
   * to-do tasks list
   */
  ToDoList: [
    {
      sText: "Cooking",
      bFinished: true,
      bFavorite: false
    },
    {
      sText: "Read 42",
      bFinished: false,
      bFavorite: true
    }
  ]
};

export const GlobalStore = new ReduxModel(InitState);
