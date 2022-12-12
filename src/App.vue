<template>
  <div>
    <input type="file" id="fileDemo" class="input" @change="changeFileDemo">
    <br>
    <button @click="loadExcel">import</button>
    <button @click="saveFile">export</button>
    <button @click="test">test</button>
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
import {htmlTag} from "@/class/obj";

export default {
  name: "App",
  data() {
    return {
      hostClass: "spread-host",
      spread: null,
      importExcelFile: null,
      exportFileName: "export.xlsx",
      password: "",
      mp: new Map()
    };
  },
  methods: {
    initWorkbook: function (spread) {
      //initializing
      this.spread = spread;
      let worksheet = spread.getActiveSheet();
    },
    changeFileDemo(e) {
      this.importExcelFile = e.target.files[0];
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
    prepare() {
      // let s=this.spread.getActiveSheet()
      // s.getCell(1,1).text("cell object");
      // console.log(s.getValue(12,6))
      // console.log(s.getFormula(12,6))
      // console.log(s.getArray(0,0,10,10))
      // console.log(s.getArray(0,2,s.getRowCount(),1))
      // console.log(s.getArray(0,0,s.getRowCount(),s.getColumnCount()))
    },
    saveFile(e) {
      // let spread = this.spread;
      // let json = spread.toJSON();
      // console.log(json.sheets)
      // let tmp=JSON.stringify(json.sheets)
      let mpSheet = this.spread.getSheetFromName('__TC_Taxonomy_Core')
      //自定义输出文件流
      // let res = new htmlTag('div')
      // console.log(res.value)
      // let obj = new htmlTag('div', {conref: 123435}, 'hello')
      // res.add(obj)
      // console.log(res.value)
      let sheet = this.spread.getSheetFromName('A')
      let xhtml = sheet.getRange(-1, -1, -1, -1).toHtml(GC.Spread.Sheets.HeaderOptions.noHeaders);
      let __XbrlMatch = this.spread.getSheetFromName('__XbrlMatch')

      //这里可以调输出标签样式
      // let tmp=document.createElement('div')
      // tmp.innerHTML=xhtml
      // this.tmp=tmp
      // console.log(tmp.getElementsByTagName('tr'))

      //输出
      let urlObject = window.URL || window.webkitURL || window
      let export_blob = new Blob([xhtml])
      let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      save_link.href = urlObject.createObjectURL(export_blob)
      save_link.download = 'test.html'
      save_link.click()
    },
    test() {
      //建立name到data行号的映射表
      let mpSheet = this.spread.getSheetFromName('__TC_Taxonomy_Core')
      let mpNameColumnId = 0
      for (let r = 1; r < mpSheet.getRowCount(); r++) {
        let str = mpSheet.getValue(r, mpNameColumnId)
        if (str === null) {
          console.log('cell(' + r + ',' + mpNameColumnId + ').value is null!')
          continue
        }
        this.mp.set(str, r)
      }
      //预处理任务列表
      let taskMap = new Map()
      let xbrlMatch = this.spread.getSheetFromName('__XbrlMatch')
      let valueColumnId = 2, nameColumnId = 4
      for (let r = 1; r < xbrlMatch.getRowCount(); r++) {
        let str = xbrlMatch.getFormula(r, valueColumnId)
        let value = xbrlMatch.getValue(r, valueColumnId)
        if (str === null) {
          console.log('cell(' + r + ',' + valueColumnId + ').formula is null!')
          continue
        }
        let arr = str.split('!')
        let sheetName = arr[0][0] === "\'" ? arr[0].slice(1, arr[0].length - 1) : arr[0];
        let pos = arr[1]
        let ixbrlTag = this.getixbrlTag(xbrlMatch.getText(r, nameColumnId), value)
        let {posr, posc} = this.getPos(pos)
        if (!taskMap.has(sheetName)) {
          taskMap.set(sheetName, [])
        }
        let currentSheetTaskList = taskMap.get(sheetName)
        currentSheetTaskList.push({posr, posc, ixbrlTag})
        taskMap.set(sheetName, currentSheetTaskList)
      }

      //准备输出的文件
      let total = document.createElement('div')

      //生成表格要避开的sheetName
      let avoidSheet = {
        'Evaluation Version': 1,
        '__Contexts': 1,
        '__TC_Taxonomy_Core': 1,
        'BasicInfoSchema': 1,
        'ProfitsTaxReturn': 1,
        '__XbrlMatch': 1
      }

      //遍历sheet
      for (let i = 0; i < this.spread.getSheetCount(); i++) {
        let currentSheetName = this.spread.getSheet(i).name()
        if (avoidSheet[currentSheetName] > 0) {
          continue
        } else {

          //获得当前sheet
          let sheet = this.spread.getSheetFromName(currentSheetName)
          //获得隐藏行列数量的前缀和数组
          let hiddenRowsNum = [], hiddenColumnsNum = []
          hiddenRowsNum[0] = sheet.getCell(0, -1).visible() ? 0 : 1
          hiddenColumnsNum[0] = sheet.getCell(-1, 0).visible() ? 0 : 1
          for (let i = 1; i < sheet.getRowCount(); i++) {
            hiddenRowsNum[i] = sheet.getCell(i, -1).visible() ? hiddenRowsNum[i - 1] : hiddenRowsNum[i - 1] + 1
          }
          for (let i = 1; i < sheet.getColumnCount(); i++) {
            hiddenColumnsNum[i] = sheet.getCell(-1, i).visible() ? hiddenColumnsNum[i - 1] : hiddenColumnsNum[i - 1] + 1
          }
          //获得任务列表
          let tasklist = taskMap.get(currentSheetName)
          if(!tasklist){
            let xhtml = sheet.getRange(-1, -1, -1, -1).toHtml(GC.Spread.Sheets.HeaderOptions.noHeaders);
            total.innerHTML+=xhtml
            continue
          }
          tasklist.sort((a, b) => {
            if (a.posr > b.posr) {
              return 1
            } else if (a.posr < b.posr) {
              return -1
            } else {
              if (a.posc > b.posc)
                return 1
              else if (a.posc < b.posc)
                return -1
              else
                return 0
            }
          })
          // console.log(tasklist)

          //当前sheet先调用tohtml输出下
          let xhtml = sheet.getRange(-1, -1, -1, -1).toHtml(GC.Spread.Sheets.HeaderOptions.noHeaders);
          let tmp = document.createElement('div')
          tmp.innerHTML = xhtml
          // console.log(tmp.getElementsByTagName("tbody")[0])
          for (let i = 0; i < tasklist.length; i++) {
            this.changeTag(tmp.getElementsByTagName("tbody")[0], tasklist[i].posr - hiddenRowsNum[tasklist[i].posr], tasklist[i].posc - hiddenColumnsNum[tasklist[i].posc], tasklist[i].ixbrlTag.value)
          }
          total.innerHTML+=tmp.innerHTML
        }
      }
      // console.log(total.innerHTML)

      //输出
      let urlObject = window.URL || window.webkitURL || window
      let export_blob = new Blob([total.innerHTML])
      let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      save_link.href = urlObject.createObjectURL(export_blob)
      save_link.download = 'test.html'
      save_link.click()
    },
    changeTag(parent, r, c, str) {
      // console.log(parent)
      // console.log(r)
      // console.log(c)
      // console.log(str)
      parent.children[r].children[c].innerHTML = str
    },
    getixbrlTag(mpKey, value) {//获得生成的ixbrl标签
      let r = parseInt(this.mp.get(mpKey))
      if (r !== undefined) {
        let mpSheet = this.spread.getSheetFromName('__TC_Taxonomy_Core')
        let arr = mpSheet.getArray(r, 0, 1, mpSheet.getColumnCount())[0]
        let attr = {}
        attr['contextRef'] = arr[7]
        attr['id'] = '随机32位数字'
        attr['name'] = arr[0]
        let tg = null
        if (arr[1] === 'xbrli:monetaryItemType') {
          attr['scale'] = 0
          attr['decimals'] = 'INF'
          attr['format'] = 'ixt:num-dot-decimal'
          attr['unitRef'] = 'ird5b2f99d8-4a00-4b18-b5d9-9b62560aa916'
          tg = new htmlTag('ix:nonFraction', attr, value)
        } else if (arr[1] === 'xbrli:dateItemType') {
          attr['format'] = 'ixt:date-month-day-year'
          tg = new htmlTag('ix:nonNumeric', attr, value)
        } else {
          tg = new htmlTag('ix:nonNumeric', attr, value)
        }
        return tg
      }
    },
    getPos(pos) {//获取行列下标
      let posr = -1, posc = -1;
      let id = -1
      for (let i = 0; i < pos.length; i++) {
        if (parseInt(pos[i]) < 10) {
          id = i
          break;
        }
      }
      posr = parseInt(pos.slice(id)) - 1
      let poscName = pos.slice(0, id)
      posc = this.getColumnIndexFromName(poscName)
      return {posr, posc}
    },
    getColumnIndexFromName(colName) {//根据列名返回下标
      let res = 0
      for (let i = 0; i < colName.length; i++) {
        res = res * 26 + colName.charCodeAt(i) - 'A'.charCodeAt(0) + 1
      }
      return res - 1
    }
  },
};
</script>

<style>
.spread-host {
  width: 100%;
  height: 600px;
}
</style>
