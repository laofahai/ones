## ONES二次开发扩展目录

目前已支持APP的Action和Model扩展，文件命名方式同源文件名称，类命名方式为Extend + 原className，需继承源类，如：

`class ExtendGoodsAction extends GoodsAction {}`

或者：
`class ExtendGoodsModel extends GoodsModel {}`

可覆盖源类中的方法，或者扩展其他方法，避免因修改源文件造成的APP升级困难