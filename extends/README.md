## ONES二次开发扩展目录

目前已支持APP的Action、Model扩展及Workflow，文件命名方式同源文件名称，类命名方式为Extend + 原className，需继承源类；workflow节点类可直接继承WorkflowAbstract如：

`class ExtendGoodsAction extends GoodsAction {}`

`class ExtendGoodsModel extends GoodsModel {}`

`class ExtendOrdersSave extends OrdersSave {}`

`class ExtendNewWorkflowNode extends WorkflowAbstract`

可覆盖源类中的方法，或者扩展其他方法，避免因修改源文件造成的APP升级困难

目录：
Action: /extends/apps/appName/SourceAction.class.php
Model: 同action
Workflow: /extends/apps/appName/workflow/workflowName/SourceNode.class.php