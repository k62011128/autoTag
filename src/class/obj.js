function htmlTag(tagName=null, attributes = {}, value = '') {
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

export {htmlTag}
