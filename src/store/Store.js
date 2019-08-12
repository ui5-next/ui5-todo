import ReduxModel from "./redux/ReduxModel";

const InitState = {
  NewToDoValue: "",
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
