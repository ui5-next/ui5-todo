import Input from "sap/m/Input";
import List from "sap/m/List";
import CustomListItem from "sap/m/CustomListItem";
import Page from "sap/m/Page";
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
import MenuButton from "sap/m/MenuButton";
import Menu from "sap/m/Menu";
import MenuItem from "sap/m/MenuItem";
import ToolPage from "sap/tnt/ToolPage";
import SideNavigation from "sap/tnt/SideNavigation";
import NavigationList from "sap/tnt/NavigationList";
import NavigationListItem from "sap/tnt/NavigationListItem";
import App from "sap/m/App";
import ToolHeader from "sap/tnt/ToolHeader";
import "./index.css";

const actionAddNewToDo = GlobalStore.addReducer("Action.AddNewToDo", oState => {
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

const actionToggleItemFavorite = GlobalStore.addReducer("Action.ToggleItemFavorite", (oState, oParam) => {
  const oToDo = oState.ToDoList[oParam];
  if (oToDo) {
    oToDo.bFavorite = !oToDo.bFavorite;
  }
  return oState;
});

const actionToggleOnlyFavorite = GlobalStore.addReducer("Action.ToggleOnlyFavorite", oState => {
  oState.bShowFavorite = !oState.bShowFavorite;
  return oState;
});

const actionToggleShowFinished = GlobalStore.addReducer("Action.ToggleShowFinished", oState => {
  oState.bShowFinished = !oState.bShowFinished;
  return oState;
});

const actionToggleSideExpand = GlobalStore.addReducer("Action.ToggleSideExpand", oState => {
  oState.bSideExpand = !oState.bSideExpand;
  return oState;
});

var app = <App
  pages={
    <ToolPage

      sideExpanded="{/bSideExpand}"

      header={
        <ToolHeader>
          <Button press={actionToggleSideExpand} icon="sap-icon://menu" type={ButtonType.Transparent} />
          <Title class="appTitle">UI5 To Do List Application</Title>
          <ToolbarSpacer />
          <MenuButton
            type={ButtonType.Transparent}
            menu={
              <Menu
                items={[
                  <MenuItem press={actionToggleShowFinished} icon="{= ${/bShowFinished} ? 'sap-icon://accept' : 'sap-icon://decline'}">Show Finished</MenuItem>,
                  <MenuItem press={actionToggleOnlyFavorite} icon="{= ${/bShowFavorite} ? 'sap-icon://accept' : 'sap-icon://decline'}">Only Favorite</MenuItem>
                ]}
              />
            }
          />
        </ToolHeader>
      }

      sideContent={
        <SideNavigation
          selectedKey="all"
          item={
            <NavigationList
              items={[
                <NavigationListItem icon="sap-icon://list" key="all">All</NavigationListItem>
              ]}
            />
          }
          footer={
            <NavigationList
              items={[
                <NavigationListItem icon="sap-icon://add" key="add">Add New List</NavigationListItem>
              ]}
            />
          }
        />
      }

      mainContents={
        <App
          pages={
            <Page
              showHeader={false}
              floatingFooter={true}
              // for chinese input, it will cause some errors.
              footer={
                <Toolbar>
                  <Input placeholder="Add New To Do" value="{/NewToDoValue}" submit={actionAddNewToDo} valueLiveUpdate={true} />
                  <Button text="Add" enabled="{= ${/NewToDoValue}.length > 0}" type={ButtonType.Transparent} press={actionAddNewToDo} />
                </Toolbar>
              }
            >
              <List
                noDataText="No thing to do."
                items={{
                  path: "/ToDoList",
                  template: (
                    <CustomListItem
                      visible={{
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
                      }}
                    >
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
        />
      }
    />

  }
/>;

app.setModel(GlobalStore).placeAt("content");
