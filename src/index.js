import Input from "sap/m/Input";
import List from "sap/m/List";
import CustomListItem from "sap/m/CustomListItem";
import Page from "sap/m/Page";
import OverflowToolbar from "sap/m/OverflowToolbar";
import App from "sap/m/App";
import CheckBox from "sap/m/CheckBox";
import HBox from "sap/m/HBox";
import FlexJustifyContent from "sap/m/FlexJustifyContent";
import Button from "sap/m/Button";
import ButtonType from "sap/m/ButtonType";
import FlexItemData from "sap/m/FlexItemData";

var root = <App
  pages={
    <Page
      title="UI5 To Do List Application"
      floatingFooter={true}
      footer={<OverflowToolbar><Input placeholder="To Do" /></OverflowToolbar>}
    >
      <List
        noDataText="No thing to do."
        items={[
          <CustomListItem>
            <HBox
              justifyContent={FlexJustifyContent.SpaceBetween}
              items={[<CheckBox />, <Input layoutData={<FlexItemData growFactor={1} />} />, <Button icon="sap-icon://favorite" type={ButtonType.Transparent} />]}
            />
          </CustomListItem>
        ]}
      />
    </Page>
  }
/>;

root.placeAt("content");
