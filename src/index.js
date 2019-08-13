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
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import Title from "sap/m/Title";
import OverflowToolbar from "sap/m/OverflowToolbar";

GlobalStore.addReducer("Action.AddNewToDo", oState => {
  // add state to value
  oState.ToDoList = oState.ToDoList.concat({
    sText: oState.NewToDoValue,
    bFinished: false,
    bFavorite: false
  });
  // clean
  oState.NewToDoValue = "";
  return oState;
});

GlobalStore.addReducer("Action.ToggleItemFavorite", (oState, oParam) => {
  const oToDo = oState.ToDoList[oParam];
  if (oToDo) {
    oToDo.bFavorite = !oToDo.bFavorite;
  }
  return oState;
});

GlobalStore.addReducer("Action.ToggleShowFavorite", oState => {
  oState.bShowFavorite = !oState.bShowFavorite;
  return oState;
});

const actionAddNewToDo = () => GlobalStore.dispatchAction("Action.AddNewToDo");

const actionToggleItemFavorite = (iIndex) => GlobalStore.dispatchAction("Action.ToggleItemFavorite", iIndex);


var app: App = <App
  pages={
    <Page
      customHeader={
        <OverflowToolbar>
          <Button icon="sap-icon://sap-ui5" enabled={false} type={ButtonType.Transparent} />
          <Title >UI5 To Do List Application</Title>
          <ToolbarSpacer />
          <CheckBox
            text="Show Finished"
            selected="{/bShowFinished}"
          />
          <CheckBox
            text="Favorite Only"
            selected="{/bShowFavorite}"
          />
        </OverflowToolbar>
      }
      floatingFooter={true}
      // for chinese input, it will cause some errors.
      footer={
        <Toolbar>
          <Input placeholder="Add To Do" value="{/NewToDoValue}" submit={actionAddNewToDo} valueLiveUpdate={true} />
          <Button text="Add" enabled="{= ${/NewToDoValue}.length > 0}" type={ButtonType.Transparent} press={actionAddNewToDo} />
        </Toolbar>
      }
    >
      <List
        noDataText="No thing to do."
        items={{
          path: "/ToDoList",
          template: (
            <CustomListItem visible={{
              parts: [{ path: "bFavorite" }, { path: "bFinished" }, { path: "/bShowFavorite" }, { path: "/bShowFinished" }],
              formatter: (bFavorite, bFinished, bShowFavorite, bShowFinished) => {
                // real complex logic
                if (!bShowFinished && bFinished) {
                  return false;
                }
                if (bShowFavorite && !bFavorite) {
                  return false;
                }
                return true;
              }
            }}>
              <HBox
                justifyContent={FlexJustifyContent.SpaceBetween}
                items={[
                  <CheckBox selected="{bFinished}" />,
                  <Input
                    valueLiveUpdate={true}
                    enabled="{= !${bFinished}}"
                    value="{sText}"
                    layoutData={<FlexItemData growFactor={1} />}
                  />,
                  <Button
                    enabled="{= !${bFinished}}"
                    press={(e) => {
                      var oButtonBindingPath = e.getSource().getBindingContext().getPath();
                      if (oButtonBindingPath) {
                        var iIndex = oButtonBindingPath.split("/").pop();
                        if (iIndex) {
                          actionToggleItemFavorite(parseInt(iIndex, 10));
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

app.setModel(GlobalStore).placeAt("content");
