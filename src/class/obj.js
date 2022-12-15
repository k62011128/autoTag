function HtmlTag(tagName=null, attributes = {}, value = '') {
    if(tagName===null){
        this.value=value
        return this
    }
    let res = '<' + tagName;
    for (let key in attributes) {
        res += ' ' + key + '=' + `'${attributes[key]}'`
    }
    res += '>' + value + '</' + tagName + '>'
    this.value = res
    this.add = (child) => {
        if (this.value.length > 0){
            let op = '', ed = ''
            for (let i = this.value.length - 1; i >= 0; i--) {
                if (this.value[i] === '<') {
                    op = this.value.slice(0, i)
                    ed = this.value.slice(i, this.value.length)
                    break;
                }
            }
            this.value=op+child.value+ed
        }
        else
            this.value=child.value
    }
    return this
}
let xHtmlScript='let infoBox = document.createElement(\'div\')\n' +
    '        let content_box = document.createElement(\'div\')\n' +
    '        let currentPageIndexInput = document.createElement(\'input\')\n' +
    '        let datalist = [{}, {}]\n' +
    '        let searchResultBox = document.createElement(\'div\')\n' +
    '        let bkkdIcon=document.createElement(\'div\')\n' +
    '        window.onload = function () {\n' +
    '            let showBox = document.createElement(\'div\')\n' +
    '            let pageIndexBox = document.createElement(\'div\')\n' +
    '            let prevBtn = document.createElement(\'button\')\n' +
    '            let nextBtn = document.createElement(\'button\')\n' +
    '            let searchBtn = document.createElement(\'button\')\n' +
    '            let searchInput = document.createElement(\'input\')\n' +
    '            let searchBox = document.createElement(\'div\')\n' +
    '            let resultBox = document.createElement(\'div\')\n' +
    '            let ft = document.createElement(\'div\')\n' +
    '            let header = document.createElement(\'div\')\n' +
    '            let quantity = document.createElement(\'div\')\n' +
    '            let headerInfo = document.createElement(\'div\')\n' +
    '            let close_btn = document.createElement(\'div\')\n' +
    '            let style = document.createElement(\'style\')\n' +
    '            let blankBlock = document.createElement(\'div\')\n' +
    '            let fc = document.body.firstChild\n' +
    '\n' +
    '            let factsArr = document.getElementsByTagName(\'ix:nonFraction\')\n' +
    '            let pageNum = Math.max(1, Math.ceil(datalist.length / 10))\n' +
    '\n' +
    '            showBox.id = \'showBox\'\n' +
    '            showBox.style.height = \'calc(100vh - 100px)\'\n' +
    '            showBox.style.width = \'200px\'\n' +
    '            showBox.style.border = \'2px solid rgb(0, 55, 104)\'\n' +
    '            showBox.style.position = \'fixed\'\n' +
    '            showBox.style.display = \'none\'\n' +
    '            showBox.style.flexDirection = \'column\'\n' +
    '            showBox.style.justifyContent = \'center\'\n' +
    '            showBox.style.alignItems = \'center\'\n' +
    '            showBox.style.right = \'0px\'\n' +
    '            showBox.style.top = \'50px\'\n' +
    '            showBox.style.backgroundColor = \'white\'\n' +
    '            showBox.style.overflow = \'auto\'\n' +
    '            pageIndexBox.id = \'pageIndexBox\'\n' +
    '            pageIndexBox.style.backgroundColor = \'white\'\n' +
    '            pageIndexBox.style.height = \'10%\'\n' +
    '            pageIndexBox.style.width = \'95%\'\n' +
    '            pageIndexBox.style.display = \'flex\'\n' +
    '            pageIndexBox.style.justifyContent = \'center\'\n' +
    '            pageIndexBox.style.alignItems = \'center\'\n' +
    '            pageIndexBox.style.margin = \'0 0 auto 0\'\n' +
    '            pageIndexBox.style.border = \'2px solid rgba(220, 220, 220,0.5)\'\n' +
    '            prevBtn.id = \'prevBtn\'\n' +
    '            prevBtn.innerText = \'prev\'\n' +
    '            prevBtn.style.height = \'35px\'\n' +
    '            prevBtn.addEventListener(\'click\', () => {\n' +
    '                let val = Number(currentPageIndexInput.value)\n' +
    '                if (isNaN(val)) {\n' +
    '                    alert(\'请输入数字\')\n' +
    '                    return\n' +
    '                }\n' +
    '                currentPageIndexInput.value = Math.max(1, currentPageIndexInput.value - 1)\n' +
    '                currentPageIndexInput.value = Math.min(pageNum, currentPageIndexInput.value)\n' +
    '                showList(currentPageIndexInput.value)\n' +
    '            })\n' +
    '            currentPageIndexInput.id = \'currentPageIndexInput\'\n' +
    '            currentPageIndexInput.style.height = \'30px\'\n' +
    '            currentPageIndexInput.style.width = \'50px\'\n' +
    '            currentPageIndexInput.style.textAlign = \'center\'\n' +
    '            currentPageIndexInput.defaultValue = \'1\'\n' +
    '            currentPageIndexInput.style.margin = \'0 5px 0 5px\'\n' +
    '            currentPageIndexInput.onkeyup = (e) => {\n' +
    '                if (e.keyCode === 13) {\n' +
    '                    let val = Number(currentPageIndexInput.value)\n' +
    '                    if (isNaN(val)) {\n' +
    '                        alert(\'请输入数字\')\n' +
    '                    } else {\n' +
    '                        if (val > pageNum) {\n' +
    '                            val = pageNum\n' +
    '                        }\n' +
    '                        if (val < 1) {\n' +
    '                            val = 1\n' +
    '                        }\n' +
    '                        currentPageIndexInput.value=val\n' +
    '                        showList(val)\n' +
    '                    }\n' +
    '                }\n' +
    '            }\n' +
    '            nextBtn.id = \'nextBtn\'\n' +
    '            nextBtn.innerText = \'next\'\n' +
    '            nextBtn.style.height = \'35px\'\n' +
    '            nextBtn.addEventListener(\'click\', () => {\n' +
    '                let val = Number(currentPageIndexInput.value)\n' +
    '                if (isNaN(val)) {\n' +
    '                    alert(\'请输入数字\')\n' +
    '                    return\n' +
    '                }\n' +
    '                currentPageIndexInput.value = Math.min(pageNum, val + 1)\n' +
    '                currentPageIndexInput.value = Math.max(1, currentPageIndexInput.value)\n' +
    '                showList(currentPageIndexInput.value)\n' +
    '            })\n' +
    '            pageIndexBox.appendChild(prevBtn)\n' +
    '            pageIndexBox.appendChild(currentPageIndexInput)\n' +
    '            pageIndexBox.appendChild(nextBtn)\n' +
    '            searchResultBox.id = \'searchResultBox\'\n' +
    '\n' +
    '            searchResultBox.style.overflow = \'auto\'\n' +
    '            searchResultBox.style.flex = \'1\'\n' +
    '            searchResultBox.style.width = \'97%\'\n' +
    '            searchResultBox.style.backgroundColor = \'white\'\n' +
    '            showBox.appendChild(pageIndexBox)\n' +
    '            showBox.appendChild(searchResultBox)\n' +
    '            document.body.appendChild(showBox)\n' +
    '\n' +
    '            searchBtn.id = \'searchBtn\'\n' +
    '            searchBtn.style.height = \'40px\'\n' +
    '            searchBtn.style.width = \'40px\'\n' +
    '            searchBtn.style.backgroundColor = \'white\'\n' +
    '            searchBtn.style.position=\'relative\'\n' +
    '            searchBtn.style.margin = \'0 0 0 5px\'\n' +
    '            searchBtn.style.cursor = \'pointer\'\n' +
    '            searchBtn.addEventListener(\'click\', () => {\n' +
    '                if (!searchInput.value) {\n' +
    '                    alert(\'请勿输入空值\')\n' +
    '                    return\n' +
    '                }\n' +
    '                datalist = searchFacts(factsArr, searchInput.value)\n' +
    '                quantity.innerHTML = datalist.length\n' +
    '                pageNum = Math.max(1, Math.ceil(datalist.length / 10))\n' +
    '                currentPageIndexInput.value = 1\n' +
    '                showList(1)\n' +
    '                showBox.style.display = \'flex\'\n' +
    '            })\n' +
    '            bkkdIcon.id=\'bkkdIcon\'\n' +
    '            bkkdIcon.classList.add(\'mybkkd\')\n' +
    '            searchBtn.appendChild(bkkdIcon)\n' +
    '            searchInput.id = \'searchInput\'\n' +
    '            searchInput.style.backgroundColor = \'white\'\n' +
    '            searchInput.style.height = \'70%\'\n' +
    '            searchInput.style.width = \'200px\'\n' +
    '            searchInput.style.margin = \'0 0 0 50px\'\n' +
    '            searchInput.placeholder = \'Search Facts\'\n' +
    '            searchInput.style.paddingLeft = \'8px\'\n' +
    '            searchInput.onkeyup = (e) => {\n' +
    '                if (e.keyCode === 13) {\n' +
    '                    searchBtn.click()\n' +
    '                }\n' +
    '            }\n' +
    '\n' +
    '            searchBox.id = \'searchBox\'\n' +
    '            searchBox.style.height = \'50px\'\n' +
    '            searchBox.style.width = \'100%\'\n' +
    '            searchBox.style.position = \'fixed\'\n' +
    '            searchBox.style.display = \'flex\'\n' +
    '            searchBox.style.justifyContent = \'center\'\n' +
    '            searchBox.style.alignItems = \'center\'\n' +
    '            searchBox.style.right = \'0%\'\n' +
    '            searchBox.style.top = \'0%\'\n' +
    '            searchBox.style.transform = \'translate(0,0)\'\n' +
    '            searchBox.style.backgroundColor = \'#003768\'\n' +
    '            resultBox.id = \'resultBox\'\n' +
    '            resultBox.style.height = \'30px\'\n' +
    '            resultBox.style.width = \'auto\'\n' +
    '            resultBox.style.justifyContent = \'center\'\n' +
    '            resultBox.style.alignItems = \'center\'\n' +
    '            resultBox.style.display = \'flex\'\n' +
    '            resultBox.style.flex = \'column\'\n' +
    '            resultBox.style.margin = \'0 10px 0 auto\'\n' +
    '            resultBox.style.cursor = \'pointer\'\n' +
    '            ft.id = \'ft\'\n' +
    '            ft.style.color = \'rgba(255,255,255,.7)\'\n' +
    '            ft.style.height = \'20px\'\n' +
    '            ft.innerHTML = \'Facts\'\n' +
    '            ft.style.margin = \'0 5px 0 0\'\n' +
    '            ft.style.textAlign = \'center\'\n' +
    '            quantity.id = \'quantity\'\n' +
    '            quantity.style.backgroundColor = \'white\'\n' +
    '            quantity.style.font = \'black\'\n' +
    '            quantity.style.height = \'20px\'\n' +
    '            quantity.style.width = \'auto\'\n' +
    '            quantity.style.padding = \'0 5px 0 5px\'\n' +
    '            quantity.style.borderRadius = \'3px\'\n' +
    '            quantity.style.textAlign = \'center\'\n' +
    '            quantity.innerHTML = \'0\'\n' +
    '            resultBox.addEventListener(\'click\', () => {\n' +
    '                if (showBox.style.display !== \'flex\') {\n' +
    '                    showBox.style.display = \'flex\'\n' +
    '                } else {\n' +
    '                    showBox.style.display = \'none\'\n' +
    '                }\n' +
    '            })\n' +
    '            searchBox.appendChild(searchInput)\n' +
    '            searchBox.appendChild(searchBtn)\n' +
    '            resultBox.appendChild(ft)\n' +
    '            resultBox.appendChild(quantity)\n' +
    '            searchBox.appendChild(resultBox)\n' +
    '\n' +
    '\n' +
    '            infoBox.style.height = \'400px\'\n' +
    '            infoBox.style.width = \'500px\'\n' +
    '            infoBox.style.position = \'fixed\'\n' +
    '            infoBox.style.left = \'50%\'\n' +
    '            infoBox.style.top = \'50%\'\n' +
    '            infoBox.style.transform = \'translate(-50%,-50%)\'\n' +
    '            infoBox.style.display = \'none\'\n' +
    '            infoBox.style.border = \'2px solid #003768\'\n' +
    '            infoBox.style.borderRadius = \'0.3rem\'\n' +
    '            infoBox.style.flexDirection = \'column\'\n' +
    '            infoBox.id = \'infoBox\'\n' +
    '            header.id = \'header\'\n' +
    '            header.style.height = \'20px\'\n' +
    '            header.style.width = \'100%\'\n' +
    '            header.style.backgroundColor = \'#003768\'\n' +
    '            header.style.display = \'flex\'\n' +
    '            let flag=0\n' +
    '            let ofx=0,ofy=0,h=parseInt(infoBox.style.height),w=parseInt(infoBox.style.width)\n' +
    '            header.addEventListener(\'mousedown\',(e)=>{\n' +
    '                flag=1\n' +
    '                ofx=e.offsetX\n' +
    '                ofy=e.offsetY\n' +
    '            })\n' +
    '            document.body.addEventListener(\'mousemove\',(e)=>{\n' +
    '                if(flag){\n' +
    '                    infoBox.style.left=e.screenX-ofx+w/2+\'px\'\n' +
    '                    infoBox.style.top=e.screenY-ofy+h/2-103+\'px\'\n' +
    '                }\n' +
    '            })\n' +
    '            document.body.addEventListener(\'mouseup\',(e)=>{\n' +
    '                flag=0\n' +
    '            })\n' +
    '            headerInfo.id = \'headerInfo\'\n' +
    '            headerInfo.style.color = \'white\'\n' +
    '            headerInfo.innerText = \'Attributes\'\n' +
    '            headerInfo.style.margin = \'0 0 0 5px\'\n' +
    '            close_btn.id = \'close_btn\'\n' +
    '            close_btn.style.margin = \'0 0 0 auto\'\n' +
    '            close_btn.style.height = \'100%\'\n' +
    '            close_btn.style.width = \'20px\'\n' +
    '            close_btn.style.position=\'relative\'\n' +
    '            close_btn.style.cursor = \'pointer\'\n' +
    '            close_btn.addEventListener(\'click\', () => {\n' +
    '                infoBox.style.display = \'none\'\n' +
    '            })\n' +
    '            close_btn.classList.add(\'closeIcon\')\n' +
    '            header.appendChild(headerInfo)\n' +
    '            header.appendChild(close_btn)\n' +
    '            content_box.id = \'content_box\'\n' +
    '            content_box.style.flex = \'1\'\n' +
    '            content_box.style.display = \'flex\'\n' +
    '            content_box.style.justifyContent = \'center\'\n' +
    '            content_box.style.alignItems = \'center\'\n' +
    '            content_box.style.backgroundColor = \'white\'\n' +
    '            content_box.style.width = \'100%\'\n' +
    '            infoBox.appendChild(header)\n' +
    '            infoBox.appendChild(content_box)\n' +
    '\n' +
    '            style.type = \'text/css\';\n' +
    '            style.innerHTML = `\n' +
    '            .mark{\n' +
    '                border-top: 2px solid #FF6600;\n' +
    '                border-bottom: 2px solid #FF6600;\n' +
    '            }\n' +
    '            .mark:hover{\n' +
    '                cursor: pointer;\n' +
    '                background-color: rgba(255,0,0,0.3);\n' +
    '            }\n' +
    '            .listItem{\n' +
    '                word-break:break-all;\n' +
    '                width: 97%;\n' +
    '                height: 20%;\n' +
    '                cursor: pointer;\n' +
    '            }\n' +
    '            .listItem:hover{\n' +
    '                background-color: rgba(220, 220, 220,0.5);\n' +
    '            }\n' +
    '            .mybkkd {\n' +
    '                font-size: 10px;\n' +
    '                display: inline-block;\n' +
    '                width: 10px;\n' +
    '                box-sizing: content-box;\n' +
    '                height: 10px;\n' +
    '                border: 2px solid black;\n' +
    '                position: absolute;\n' +
    '                border-radius: 10px;\n' +
    '                left:10px;\n' +
    '                top:8px;\n' +
    '              }\n' +
    '            .mybkkd:before {\n' +
    '                content: "";\n' +
    '                display: inline-block;\n' +
    '                position: absolute;\n' +
    '                right: -7px;\n' +
    '                bottom: -5px;\n' +
    '                border-width: 0;\n' +
    '                background: black;\n' +
    '                width: 10px;\n' +
    '                height: 2px;\n' +
    '                transform: rotate(50deg);\n' +
    '            }\n' +
    '            .closeIcon:before{\n' +
    '                content: "";\n' +
    '                display: inline-block;\n' +
    '                position: absolute;\n' +
    '                right: 0px;\n' +
    '                bottom: 8px;\n' +
    '                border-width: 0;\n' +
    '                background: white;\n' +
    '                width: 20px;\n' +
    '                height: 3px;\n' +
    '                transform: rotate(45deg);\n' +
    '            }\n' +
    '            .closeIcon:after{\n' +
    '                content: "";\n' +
    '                display: inline-block;\n' +
    '                position: absolute;\n' +
    '                right: 0px;\n' +
    '                bottom: 8px;\n' +
    '                border-width: 0;\n' +
    '                background: white;\n' +
    '                width: 20px;\n' +
    '                height: 3px;\n' +
    '                transform: rotate(-45deg);\n' +
    '            }\n' +
    '            `\n' +
    '            blankBlock.id = \'blankBlock\'\n' +
    '            blankBlock.style.height = \'50px\'\n' +
    '            document.body.style.margin = \'0\'\n' +
    '            document.querySelector(\'head\').appendChild(style)\n' +
    '            document.body.insertBefore(searchBox, fc)\n' +
    '            document.body.insertBefore(blankBlock, fc)\n' +
    '            document.body.appendChild(infoBox)\n' +
    '\n' +
    '            //给每一个标签添加醒目标记\n' +
    '            for (let i = 0; i < factsArr.length; i++) {\n' +
    '                let label = factsArr[i]\n' +
    '                label.parentNode.classList.add(\'mark\')\n' +
    '                label.addEventListener(\'click\', () => {\n' +
    '                    getInfo(label)\n' +
    '                })\n' +
    '            }\n' +
    '        };\n' +
    '\n' +
    '        function getInfo(label) {\n' +
    '            infoBox.style.display = \'flex\'\n' +
    '            content_box.innerHTML = \'\'\n' +
    '            let tableBox = document.createElement(\'div\')\n' +
    '            tableBox.id = \'tableBox\'\n' +
    '            tableBox.style.display = \'flex\'\n' +
    '            tableBox.style.height = \'99%\'\n' +
    '            tableBox.style.width = \'99%\'\n' +
    '            tableBox.style.overflow = \'auto\'\n' +
    '            tableBox.style.alignItems = \'center\'\n' +
    '            tableBox.style.justifyContent = \'center\'\n' +
    '            let tab = document.createElement(\'table\')\n' +
    '            tab.id = \'tab\'\n' +
    '            tab.style.height = \'99%\'\n' +
    '            tab.style.width = \'99%\'\n' +
    '            tab.style.border = \'1px solid black\'\n' +
    '            tab.style.borderCollapse = \'collapse\'\n' +
    '            for (let i = 0; i < label.attributes.length - 1; i++) {\n' +
    '                let tr = document.createElement(\'tr\')\n' +
    '                let td_name = document.createElement(\'td\')\n' +
    '                td_name.innerText = label.attributes[i].name\n' +
    '                td_name.style.border = \'1px solid black\'\n' +
    '                td_name.style.borderCollapse = \'collapse\'\n' +
    '                let td_value = document.createElement(\'td\')\n' +
    '                td_value.innerText = label.attributes[i].value\n' +
    '                td_value.style.border = \'1px solid black\'\n' +
    '                td_value.style.borderCollapse = \'collapse\'\n' +
    '                td_value.style.overflowX = \'auto\'\n' +
    '                tr.appendChild(td_name)\n' +
    '                tr.appendChild(td_value)\n' +
    '                tab.appendChild(tr)\n' +
    '            }\n' +
    '            tableBox.appendChild(tab)\n' +
    '            content_box.appendChild(tableBox)\n' +
    '        }\n' +
    '\n' +
    '        function searchFacts(arr, val) {\n' +
    '            let res = []\n' +
    '            let valTest = new RegExp(val, \'i\')\n' +
    '            for (let i = 0; i < arr.length; i++) {\n' +
    '                let label = arr[i]\n' +
    '                if (valTest.test(label.attributes[\'name\'].value)) {\n' +
    '                    res.push(label)\n' +
    '                }\n' +
    '            }\n' +
    '            return res\n' +
    '        }\n' +
    '\n' +
    '        function showList(pageIndex) {\n' +
    '            searchResultBox.innerHTML = \'\'\n' +
    '            let l = Math.max(0, (pageIndex - 1) * 10),\n' +
    '                r = Math.min(datalist.length, pageIndex * 10)\n' +
    '            for (let i = l; i < r; i++) {\n' +
    '                let tmp = document.createElement(\'div\')\n' +
    '                tmp.innerHTML = datalist[i].attributes[\'name\'].value\n' +
    '                tmp.classList.add(\'listItem\')\n' +
    '                tmp.addEventListener(\'click\', () => {\n' +
    '                    datalist[i].scrollIntoView(false)\n' +
    '                    getInfo(datalist[i])\n' +
    '                })\n' +
    '                tmp.addEventListener(\'mouseover\', () => {\n' +
    '                    datalist[i].parentNode.style.backgroundColor = \'rgba(255,0,0,0.3)\'\n' +
    '                })\n' +
    '                tmp.addEventListener(\'mouseout\', () => {\n' +
    '                    datalist[i].parentNode.style.backgroundColor = \'\'\n' +
    '                })\n' +
    '                searchResultBox.appendChild(tmp)\n' +
    '            }\n' +
    '        }'

export {HtmlTag,xHtmlScript}
