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
    saveFile(e) {
      //从名称管理器里取值
      const sheet = this.spread.getActiveSheet()
      const customNames = this.spread.getCustomNames()
      const nameObj = {}
      customNames.forEach((name) => {
        const nameFormula = GC.Spread.Sheets.CalcEngine.expressionToFormula(
            this.spread, name.getExpression(), 0, 0
        )
        const result = GC.Spread.Sheets.CalcEngine.evaluateFormula(
            sheet, nameFormula, 0, 0
        )
        // console.log(name.getName(), '的值为', result)
        nameObj[name.getName()] = result
      })
      //常量
      const CompanyName = nameObj['CompanyName'] || 'CompanyName'
      const IRDFileNumberRear = nameObj['IRDFileNumberRear'] || 'IRDFileNumberRear'
      const YearOfAssessment = nameObj['YearOfAssessment'] || 'YearOfAssessment'
      const ReturnType = nameObj['ReturnType'] || 'BIR51'

      //建立name到data行号的映射表
      let mpSheet = this.spread.getSheetFromName('__TC_Taxonomy_Core')
      if (mpSheet === null) {
        this.progress = 'Sheet:__TC_Taxonomy_Core未找到！'
        console.log('Sheet:__TC_Taxonomy_Core未找到！')
        return
      }
      let mpNameColumnId = 0
      for (let r = 1; r < mpSheet.getRowCount(); r++) {
        let str = mpSheet.getValue(r, mpNameColumnId)
        if (str === null) {
          console.log('__TC_Taxonomy_Core:cell(' + r + ',' + mpNameColumnId + ').value is null!')
          continue
        }
        this.mp.set(str, r)
      }
      //预处理任务列表
      let taskMap = new Map()
      let xbrlMatch = this.spread.getSheetFromName('__XbrlMatch')
      if (xbrlMatch === null) {
        this.progress = 'Sheet:__XbrlMatch未找到！'
        console.log('Sheet:__XbrlMatch未找到！')
        return
      }
      let valueColumnId = 2, nameColumnId = 1
      for (let r = 1; r < xbrlMatch.getRowCount(); r++) {
        let str = xbrlMatch.getFormula(r, valueColumnId)
        let value = xbrlMatch.getValue(r, valueColumnId)
        if (str === null) {
          console.log('__XbrlMatch:cell(' + r + ',' + valueColumnId + ').formula is null!')
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
      let wrap = new HtmlTag('html', {
        'xmlns': "http://www.w3.org/1999/xhtml",
        'xmlns:utr': "http://www.xbrl.org/2009/utr",
        'xmlns:xlink': "http://www.w3.org/1999/xlink",
        'xmlns:link': "http://www.xbrl.org/2003/linkbase",
        'xmlns:xbrli': "http://www.xbrl.org/2003/instance",
        'xmlns:ixt': "http://www.xbrl.org/inlineXBRL/transformation/2020-02-12",
        'xmlns:ix': "http://www.xbrl.org/2013/inlineXBRL",
        'xmlns:ird_tc': "http://xbrl.ird.gov.hk/taxonomy/2019-12-09/ird_tc",
        'xmlns:iso4217': "http://www.xbrl.org/2003/iso4217",
        'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
        'xmlns:xbrldi': "http://xbrl.org/2006/xbrldi",
        'xmlns:xs': "http://www.w3.org/2001/XMLSchema",
        'xmlns:xl': "http://www.xbrl.org/2003/XLink",
        'xmlns:nonnum': "http://www.xbrl.org/dtr/type/non-numeric",
        'xmlns:num': "http://www.xbrl.org/dtr/type/numeric",
        'xmlns:xbrldt': "http://xbrl.org/2005/xbrldt",
        'xmlns:ref': "http://www.xbrl.org/2006/ref",
        'xml:lang': "en"
      });
      let head = new HtmlTag('head')
      head.add(new HtmlTag('meta', {
        'http-equiv': "Content-Type",
        'content': "text/html;charset=utf-8",
      }))
      head.add(new HtmlTag('title', {}, CompanyName + ' - Tax Computation'))
      wrap.add(head)
      let body = new HtmlTag('body')
      //生成表格要避开的sheetName
      let avoidSheet = {
        'Evaluation Version': 1,
        '__IRD_TC_Preliminary Edition': 1,
        '__ISO4217': 1,
        '__Contexts': 1,
        '__TC_Taxonomy_Core': 1,
        '__Mandatory': 1,
        'InfoSchema': 1,
        '__InfoSchema': 1,
        'BasicInfoSchema': 1,
        'ProfitsTaxReturn': 1,
        '__XbrlMatch': 1
      }
      //body头部的隐藏标签
      let hdiv = new HtmlTag('div', {
        'style': 'display:none'
      })
      let ih = new HtmlTag('ix:header')
      let iref = new HtmlTag('ix:references', {
        'xml:lang': "en"
      })
      let ls = new HtmlTag('link:schemaRef', {
        'xlink:type': "simple",
        'xlink:href': "http://xbrl.ird.gov.hk/taxonomy/2019-12-09/ird_tc_entry_point_2019-12-09.xsd"
      })
      iref.add(ls)
      ih.add(iref)
      let ires = new HtmlTag('ix:resources')
      for (let i = 0; i < this.spread.getSheetCount(); i++) {
        let currentSheetName = this.spread.getSheet(i).name()
        if (currentSheetName === '__Contexts') {
          //context上下文
          let sheet = this.spread.getSheetFromName(currentSheetName)
          let sheetRc = sheet.getRowCount()
          let contextColumnId = 0, entityIdentifierColumnId = 1, entitySchemeColumnId = 2, periodTypeColumnId = 3,
              startDateColumnId = 4, endDateColumnId = 5
          for (let i = 1; i < sheetRc; i++) {
            let context = sheet.getValue(i, contextColumnId)
            let entityIdentifier = sheet.getValue(i, entityIdentifierColumnId)
            let entityScheme = sheet.getValue(i, entitySchemeColumnId)
            let periodType = sheet.getValue(i, periodTypeColumnId)
            let startDate = sheet.getText(i, startDateColumnId)
            let endDate = sheet.getText(i, endDateColumnId)
            if (endDate.includes('/')) {
              let arr = endDate.split('/')
              endDate = arr[2] + '/' + arr[0] + '/' + arr[1]
            }
            if (startDate.includes('/')) {
              let arr = startDate.split('/')
              startDate = arr[2] + '/' + arr[0] + '/' + arr[1]
            }
            let xp = new HtmlTag('xbrli:period')
            if (periodType === 'period') {
              xp.add(new HtmlTag('xbrli:startDate', {}, startDate))
              xp.add(new HtmlTag('xbrli:endDate', {}, endDate))
            } else if (periodType === 'instant') {
              xp.add(new HtmlTag('xbrli:instant', {}, endDate))
            } else {
              console.log(i + '行periodType不确定!')
              continue
            }
            let xc = new HtmlTag('xbrli:context', {
              'id': context
            })
            let xe = new HtmlTag('xbrli:entity')
            xe.add(new HtmlTag('xbrli:identifier', {
              'scheme': entityScheme
            }, entityIdentifier))
            xc.add(xe)
            xc.add(xp)
            ires.add(xc)
          }
          //tip进度提示
          this.progress = 'sheet ' + currentSheetName + ' is ok.'
          break;
        }
      }
      for (let i = 0; i < this.spread.getSheetCount(); i++) {
        let currentSheetName = this.spread.getSheet(i).name()
        if (currentSheetName === '__ISO4217') {
          //货币部分
          let sheet = this.spread.getSheetFromName(currentSheetName)
          let sheetRc = sheet.getRowCount()
          let isonameColumnId = 4, idColumnId = 5
          for (let i = 1; i < sheetRc; i++) {
            let isoname = sheet.getValue(i, isonameColumnId)
            let id = sheet.getValue(i, idColumnId)
            let xu = new HtmlTag('xbrli:unit', {id})
            xu.add(new HtmlTag('xbrli:measure', {}, isoname))
            ires.add(xu)
          }
          //tip进度提示
          this.progress = 'sheet ' + currentSheetName + ' is ok.'
          break;
        }
      }
      ih.add(ires)
      hdiv.add(ih)
      body.add(hdiv)
      //显式标签
      //遍历sheet
      for (let i = 0; i < this.spread.getSheetCount(); i++) {
        let currentSheetName = this.spread.getSheet(i).name()
        if (avoidSheet[currentSheetName] > 0) {
          continue
        } else {
          if(currentSheetName.length>=2&&currentSheetName[0]==='_'&&currentSheetName[1]==='_'){
            continue;
          }
          //获得当前sheet
          let sheet = this.spread.getSheetFromName(currentSheetName)
          let sheetRc = sheet.getRowCount()
          let sheetCc = sheet.getColumnCount()
          //获得隐藏行列数量的前缀和数组
          let hiddenRowsNum = [], hiddenColumnsNum = []
          hiddenRowsNum[0] = sheet.getCell(0, -1).visible() ? 0 : 1
          hiddenColumnsNum[0] = sheet.getCell(-1, 0).visible() ? 0 : 1
          for (let i = 1; i < sheetRc; i++) {
            hiddenRowsNum[i] = sheet.getCell(i, -1).visible() ? hiddenRowsNum[i - 1] : hiddenRowsNum[i - 1] + 1
          }
          for (let i = 1; i < sheetCc; i++) {
            hiddenColumnsNum[i] = sheet.getCell(-1, i).visible() ? hiddenColumnsNum[i - 1] : hiddenColumnsNum[i - 1] + 1
          }
          //获得任务列表
          let tasklist = taskMap.get(currentSheetName)
          if (!!tasklist) {
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
          }
          //当前sheet先调用tohtml输出下
          let xhtml = sheet.getRange(-1, -1, -1, -1).toHtml(GC.Spread.Sheets.HeaderOptions.noHeaders);
          let tmp = document.createElement('div')
          tmp.innerHTML = xhtml
          let pa = tmp.getElementsByTagName("tbody")[0]
          //防空白处理
          if (pa && pa.children && pa.children[0] && pa.children[0].children && pa.children[0].children[0]) {
            //删除空白行列
            let judge = new RegExp('\\S')
            for (let r = pa.children.length - 1; r >= 0; r--) {
              if (judge.test(pa.children[r].innerText)) {
                break
              } else {
                pa.removeChild(pa.children[r])
              }
            }
            let flag = 0;
            for (let c = sheetCc - hiddenColumnsNum[sheetCc - 1] - 1; c >= 0; c--) {
              for (let r = 0; r < pa.children.length; r++) {
                //防空白处理
                if (pa.children[r].children[c]&&judge.test(pa.children[r].children[c].innerText)) {
                  flag = 1;
                  break
                }
              }
              if (flag)
                break;
              for (let r = 0; r < pa.children.length; r++) {
                //防空白处理
                if (pa.children[r].children[c])
                pa.children[r].removeChild(pa.children[r].children[c])
              }
            }
            //修改单元格样式
            for (let r = 0; r < pa.children.length; r++) {
              pa.children[r].children[0].style.height = '30px'
              for (let c = 0; c < pa.children[r].children.length; c++) {
                pa.children[r].children[c].style.fontSize = '16.7px'
                pa.children[r].children[c].style.maxWidth = ''
                pa.children[r].children[c].style.padding = '5px'
              }
            }
            pa.parentNode.style.marginLeft = '10px'
            //替换指定数据为xhtml标签
            if (!!tasklist) {
              for (let i = 0; i < tasklist.length; i++) {
                this.changeTag(pa, tasklist[i].posr - hiddenRowsNum[tasklist[i].posr], tasklist[i].posc - hiddenColumnsNum[tasklist[i].posc], tasklist[i].ixbrlTag.value)
              }
            }
          }
          let divBox = new HtmlTag('div')
          divBox.add(new HtmlTag('div', {
            style: 'margin:10px 0 10px 20px;'
          }, 'Sheet Name : ' + currentSheetName))
          divBox.add(new HtmlTag(null, {}, tmp.innerHTML))
          divBox.add(new HtmlTag('div', {
            style: 'height:100px;'
          }))
          body.add(divBox)
        }
        //tip进度提示
        this.progress = 'sheet ' + currentSheetName + ' is ok.'
      }
      //尾部隐藏标签
      //infoSchema
      let endDiv = new HtmlTag('div', {
        'id': 'InfoSchema',
        'class': 'InfoSchema',
        'style': 'display:none'
      })
      for (let i = 0; i < this.spread.getSheetCount(); i++) {
        let currentSheetName = this.spread.getSheet(i).name()
        if (currentSheetName === '__InfoSchema') {
          let sheet = this.spread.getSheetFromName(currentSheetName)
          let sheetRc = sheet.getRowCount()
          let nameColumnId = 1, valueColumnId = 2
          for (let i = 1; i < sheetRc; i++) {
            let name = sheet.getValue(i, nameColumnId)
            let value = sheet.getValue(i, valueColumnId)
            if (name === null) {
              console.log(i + '行name为空!')
              continue
            }
            if (value === null)
              value = ''
            let ixbrlTag = this.getInfoTag(name, value)
            endDiv.add(ixbrlTag)
          }
          //tip进度提示
          this.progress = 'sheet ' + currentSheetName + ' is ok.'
          break;
        }
      }
      body.add(endDiv)
      //mandatory标签
      let man = new HtmlTag('div', {
        id: 'mandtoryDefaultSet',
        class: 'mandtoryDefaultSet',
        style: 'display:none'
      })
      for (let i = 0; i < this.spread.getSheetCount(); i++) {
        let currentSheetName = this.spread.getSheet(i).name()
        if (currentSheetName === '__Mandatory') {
          //货币部分
          let sheet = this.spread.getSheetFromName(currentSheetName)
          let sheetRc = sheet.getRowCount()
          let nameColumnId = 1, valueColumnId = 2, locationColumnId = 3, BIR51ColumnId = 5, BIR52ColumnId = 6,
              XbrlMatchColumnId = 7
          for (let i = 1; i < sheetRc; i++) {
            let name = sheet.getValue(i, nameColumnId)
            let value = sheet.getValue(i, valueColumnId)
            let location = sheet.getValue(i, locationColumnId)
            let BIR51 = sheet.getValue(i, BIR51ColumnId)
            let BIR52 = sheet.getValue(i, BIR52ColumnId)
            let XbrlM = sheet.getValue(i, XbrlMatchColumnId)
            if (location === 'computation' && XbrlM === 0) {
              if (ReturnType === 'BIR51') {
                if (BIR51 === 1) {
                  let ixbrlTag = this.getInfoTag(name, value)
                  man.add(ixbrlTag)
                }
              } else if (BIR52 === 1) {
                let ixbrlTag = this.getInfoTag(name, value)
                man.add(ixbrlTag)
              }
            }
          }
          //tip进度提示
          this.progress = 'sheet ' + currentSheetName + ' is ok.'
          break;
        }
      }
      body.add(man)
      let body2 = new HtmlTag(null, {}, body.value)
      body2.add(new HtmlTag('script', {
        'type': 'text/javascript',
        'src': 'http://code.jquery.com/jquery-1.11.0.min.js'
      }))
      body2.add(new HtmlTag('script', {
        'type': 'text/javascript',
        'src': 'https://greasyfork.org/zh-CN/scripts/455380-xhtml%E5%AE%9A%E5%88%B6%E8%84%9A%E6%9C%AC/code/xhtml%E5%AE%9A%E5%88%B6%E8%84%9A%E6%9C%AC.user.js'
      }))
      let wrap2 = new HtmlTag(null, {}, wrap.value)
      wrap2.add(body2)
      wrap.add(body)
      wrap.value = wrap.value.replace(/&nbsp;/g, ' ')
      wrap.value = wrap.value.replace(/&lt;/g, '<')
      wrap.value = wrap.value.replace(/&gt;/g, '>')
      wrap.value = wrap.value.replace(/&amp;/g, '&')
      wrap.value = wrap.value.replace(/&quot;/g, '\'')
      wrap.value = wrap.value.replace(/contextref/g, 'contextRef')
      wrap.value = wrap.value.replace(/unitref/g, 'unitRef')
      wrap.value = wrap.value.replace(/ix:nonfraction/g, 'ix:nonFraction')

      wrap2.value = wrap2.value.replace(/&nbsp;/g, ' ')
      wrap2.value = wrap2.value.replace(/&lt;/g, '<')
      wrap2.value = wrap2.value.replace(/&gt;/g, '>')
      wrap2.value = wrap2.value.replace(/&amp;/g, '&')
      wrap2.value = wrap2.value.replace(/&quot;/g, '\'')
      wrap2.value = wrap2.value.replace(/contextref/g, 'contextRef')
      wrap2.value = wrap2.value.replace(/unitref/g, 'unitRef')
      wrap2.value = wrap2.value.replace(/ix:nonfraction/g, 'ix:nonFraction')
      //输出
      let urlObject = window.URL || window.webkitURL || window
      let export_blob = new Blob([wrap.value])
      let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      save_link.href = urlObject.createObjectURL(export_blob)
      this.exportFileName = IRDFileNumberRear + '-' + YearOfAssessment + '-T-' + this.getCurrentDate() + '.xhtml'
      save_link.download = this.exportFileName
      save_link.click()

      let export_blob2 = new Blob([wrap2.value])
      let save_link2 = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      save_link2.href = urlObject.createObjectURL(export_blob2)
      this.exportFileName = IRDFileNumberRear + '-' + YearOfAssessment + '-T-' + this.getCurrentDate() + '-JS.xhtml'
      save_link2.download = this.exportFileName
      save_link2.click()
      //清空mp
      this.mp.clear()
    },
    changeTag(parent, r, c, str) {
      let sp = new HtmlTag('span', {
        'style': 'line-height:22px;'
      }, str)
      if (parent.children && parent.children[r] && parent.children[r].children && parent.children[r].children[c]) {
        parent.children[r].children[c].innerHTML = sp.value
        parent.children[r].children[c].style.overflow = 'visible'
      } else {
        console.log('parent.children[' + r + '].children[' + c + ']为undefined!')
      }
    },
    getixbrlTag(mpKey, value) {//获得生成的ixbrl标签
      let r = parseInt(this.mp.get(mpKey))
      if (r !== undefined) {
        let mpSheet = this.spread.getSheetFromName('__TC_Taxonomy_Core')
        let arr = mpSheet.getArray(r, 0, 1, mpSheet.getColumnCount())[0]
        let attr = {}
        let sign = 0
        if (value < 0) {
          attr['sign'] = '-'
          sign = 1
        }
        value = Math.abs(value)
        attr['contextRef'] = arr[7]
        let randomStr = this.getRandomString()
        while (1) {
          if (this.mp.get(randomStr)) {
            randomStr = this.getRandomString()
          } else {
            this.mp.set(randomStr, 1)
            break;
          }
        }
        attr['id'] = randomStr
        attr['name'] = arr[0]
        let tg = null
        if (arr[1] === 'xbrli:monetaryItemType' || arr[1] === 'xbrli:decimalItemType') {
          attr['scale'] = 0
          attr['decimals'] = 'INF'
          attr['format'] = 'ixt:num-dot-decimal'
          attr['unitRef'] = 'ird5b2f9iso-4217-4b18-b5d9-9b62560a0968'
          tg = new HtmlTag('ix:nonFraction', attr, value)
        } else if (arr[1] === 'xbrli:dateItemType') {
          attr['format'] = 'ixt:date-day-month-year'
          tg = new HtmlTag('ix:nonNumeric', attr, value)
        } else {
          tg = new HtmlTag('ix:nonNumeric', attr, value)
        }
        if (sign) {
          tg.value = '(' + tg.value + ')'
        }
        return tg
      } else {
        return new HtmlTag(null, {}, value)
      }
    },
    getInfoTag(mpKey, value) {
      let r = parseInt(this.mp.get(mpKey))
      if (r !== undefined) {
        let mpSheet = this.spread.getSheetFromName('__TC_Taxonomy_Core')
        let arr = mpSheet.getArray(r, 0, 1, mpSheet.getColumnCount())[0]
        let attr = {}
        attr['contextRef'] = arr[7]
        let randomStr = this.getRandomString()
        while (1) {
          if (this.mp.get(randomStr)) {
            randomStr = this.getRandomString()
          } else {
            this.mp.set(randomStr, 1)
            break;
          }
        }
        attr['id'] = randomStr
        attr['name'] = arr[0]
        let tg = null
        if (arr[1] === 'xbrli:monetaryItemType' || arr[1] === 'xbrli:decimalItemType') {
          attr['scale'] = 0
          attr['decimals'] = 'INF'
          attr['format'] = 'ixt:num-dot-decimal'
          attr['unitRef'] = 'ird5b2f9iso-4217-4b18-b5d9-9b62560a0968'
          tg = new HtmlTag('ix:nonFraction', attr, value)
        } else if (arr[1] === 'xbrli:dateItemType') {
          attr['format'] = 'ixt:date-day-month-year'
          tg = new HtmlTag('ix:nonNumeric', attr, value)
        } else {
          tg = new HtmlTag('ix:nonNumeric', attr, value)
        }
        return tg
      } else {
        return new HtmlTag(null, {}, value)
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
    },
    getRandomString() {
      let cnt = 0;
      let str = ''
      while (cnt < 32) {
        cnt++;
        let flag = Math.floor((Math.random() * 900) % 36)
        if (flag < 10) {
          str += flag
        } else {
          flag += 87
          str += String.fromCharCode(flag)
        }
      }
      return 'ird' + str.slice(0, 8) + '-' + str.slice(8, 12) + '-' + str.slice(12, 16) + '-' + str.slice(16, 20) + '-' + str.slice(20, 32)
    },
    getCurrentDate() {
      let date = new Date()
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()
      let hour = date.getHours()
      let minute = date.getMinutes()
      let second = date.getSeconds()
      if (month > 0 && month < 10) {
        month = '0' + month
      }
      if (day >= 0 && day < 10) {
        day = '0' + day
      }
      if (hour >= 0 && hour < 10) {
        hour = '0' + hour
      }
      if (minute >= 0 && minute < 10) {
        minute = '0' + minute
      }
      if (second >= 0 && second < 10) {
        second = '0' + second
      }
      return '' + year + month + day + hour + minute + second
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
