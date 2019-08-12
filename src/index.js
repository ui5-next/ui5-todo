import Input from "sap/m/Input";
import List from "sap/m/List";
import CustomListItem from "sap/m/CustomListItem";
import Page from "sap/m/Page";
import App from "sap/m/App";
import CheckBox from "sap/m/CheckBox";
import HBox from "sap/m/HBox";
import FlexJustifyContent from "sap/m/FlexJustifyContent";
import Button from "sap/m/Button";
import ButtonType from "sap/m/ButtonType";
import FlexItemData from "sap/m/FlexItemData";
import { GlobalStore } from "./store/Store";
import Toolbar from "sap/m/Toolbar";

GlobalStore.registerReducer({
  type: "Action.AddNewToDo", perform: (oParam, oState) => {
    // add state to value
    oState.ToDoList = oState.ToDoList.concat({
      sText: oState.NewToDoValue,
      bFinished: false,
      bFavorite: false
    });
    // clean
    oState.NewToDoValue = "";
    return oState;
  }
});

GlobalStore.registerReducer({
  type: "Action.ToggleFavorite",
  perform: ({ param }, oState) => {
    const oToDo = oState.ToDoList[param.iIndex];
    if (oToDo) {
      oToDo.bFavorite = !oToDo.bFavorite;
    }
    return oState;
  }
});

const actionAddNewToDo = () => GlobalStore.dispatch({ type: "Action.AddNewToDo" });

const actionToggleFavorite = (iIndex) => GlobalStore.dispatch({ type: "Action.ToggleFavorite", param: { iIndex } });

var root: App = <App
  pages={
    <Page
      title="UI5 To Do List Application"
      floatingFooter={true}
      // for chinese input, it will cause some errors.
      footer={<Toolbar><Input placeholder="Add To Do" value="{/NewToDoValue}" submit={actionAddNewToDo} /></Toolbar>}
    >
      <List
        noDataText="No thing to do."
        items={{
          path: "/ToDoList",
          template: (
            <CustomListItem>
              <HBox
                justifyContent={FlexJustifyContent.SpaceBetween}
                items={[
                  <CheckBox selected="{bFinished}" />,
                  <Input value="{sText}" layoutData={<FlexItemData growFactor={1} />} />,
                  <Button
                    press={(e) => {
                      var oButtonBindingPath = e.getSource().getBindingContext().getPath();
                      if (oButtonBindingPath) {
                        var iIndex = oButtonBindingPath.split("/").pop();
                        if (iIndex) {
                          actionToggleFavorite(parseInt(iIndex, 10));
                        }
                      }
                    }}
                    icon={{ path: "bFavorite", formatter: v => v ? "sap-icon://favorite" : "sap-icon://unfavorite" }}
                    type={ButtonType.Transparent}
                  />
                ]}
              />
            </CustomListItem>
          )
        }}
      />
    </Page>
  }
/>;

root.setModel(GlobalStore).placeAt("content");
