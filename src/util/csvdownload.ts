import {
    parse
} from "json2csv"

/**
 * 数据导出csv
 * 需引入json2csv插件
 * npm install json2csv -s
 */
export class CSVDownload {
    /**
     * 下载静态方法
     * @param fileName 文件名
     * @param fields 对应每列的头
     * @param rows 对象集合，对象属性名为field中的值
     */
    public static download(fileName: string, fields: string[], rows: any[]): void {
        try {

            const result = parse(rows, {
                fields: fields,
                excelStrings: true
            });
            if (this.MyBrowserIsIE()) {
                // IE10以及Edge浏览器
                var BOM = "\uFEFF";
                // 文件转Blob格式
                var csvData = new Blob([BOM + result], {
                    type: "text/csv"
                });
                navigator.msSaveBlob(csvData, `${fileName}.csv`);
            } else {
                let csvContent: string = "data:text/csv;charset=utf-8,\uFEFF" + result;
                // 非ie 浏览器
                this.createDownLoadClick(csvContent, `${fileName}.csv`);
            }
        } catch (err) {
            alert(err);
        }
    }

    //创建a标签下载
    private static createDownLoadClick(content: string, fileName: string): void {
        const link = document.createElement("a");
        link.href = encodeURI(content);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 判断是否IE浏览器
    private static MyBrowserIsIE(): boolean {
        let isIE = false;
        if (
            navigator.userAgent.indexOf("compatible") > -1 &&
            navigator.userAgent.indexOf("MSIE") > -1
        ) {
            // ie浏览器
            isIE = true;
        }
        if (navigator.userAgent.indexOf("Trident") > -1) {
            // edge 浏览器
            isIE = true;
        }
        return isIE;
    }
}