<template>
  <div>
    <input type="file" id="fileDemo" class="input" @change="changeFileDemo">
    <br>
    <button @click="loadExcel">import</button>
    <button @click="saveFile">export</button>
    <span>{{ progress }}</span>
    <gc-spread-sheets
        :hostClass="hostClass"
        @workbookInitialized="initWorkbook"
    >
    </gc-spread-sheets>
  </div>
</template>

<script>
import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css";
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-vue";
import {IO} from "@grapecity/spread-excelio";
import {HtmlTag} from "@/class/obj";

export default {
  name: "App",
  data() {
    return {
      hostClass: "spread-host",
      spread: null,
      importExcelFile: null,
      exportFileName: "export.xlsx",
      password: "",
      mp: new Map(),
      progress: 'tip'
    };
  },
  methods: {
    initWorkbook: function (spread) {
      //initializing
      this.spread = spread;
      // let worksheet = spread.getActiveSheet();
    },
    changeFileDemo(e) {
      this.importExcelFile = e.target.files[0];
      // this.exportFileName = this.importExcelFile.name.replace(/xlsx/, 'xhtml')
    },
    loadExcel(e) {
      let spread = this.spread;
      let excelIo = new IO();
      let excelFile = this.importExcelFile;
      let password = this.password;
      // here is excel IO API
      excelIo.open(excelFile, function (json) {
        let workbookObj = json;
        spread.fromJSON(workbookObj);
      }, function (e) {
        // process error
        alert(e.errorMessage);
      }, {
        password: password
      });
    },
    // prepare() {
    // let s=this.spread.getActiveSheet()
    // s.getCell(1,1).text("cell object");
    // console.log(s.getValue(12,6))
    // console.log(s.getFormula(12,6))
    // console.log(s.getArray(0,0,10,10))
    // console.log(s.getArray(0,2,s.getRowCount(),1))
    // console.log(s.getArray(0,0,s.getRowCount(),s.getColumnCount()))
    // },
    saveFile() {


    },

  },
};
</script>

<style>
.spread-host {
  width: 100%;
  height: 600px;
}
</style>
