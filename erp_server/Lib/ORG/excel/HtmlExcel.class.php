<?php
include_once ('IExcel.php');
/**
 * @desc php生成excel类函数
 * @author mengdejun
 * @date 20100806
 * @version 1.1.2
 */
class HtmlExcel implements IExcel
{
	private $_line=array();
	private $isHeader=false;
	private $convert=false;
	public function __construct(){}

	/**
	 * @desc 添加表头信息,注:表头仅可添加一次,若无表头则将内容行的第一行作为表头
	 * @param array $array
	 * @param unknown_type $sheet
	 */
	public function addHead(array $array, $sheet = "sheet1")
	{
		if(!$this->isHeader)
			$this->_line[]=$this->getLine($array);
		$this->isHeader=true;
	}

	/**
	 * @desc 添加自定义字符转换或过滤函数
	 * @param unknown_type $functionName 回调函数名
	 */
	public function addConvert($functionName="convert")
	{
		$this->convert=$functionName;
	}

	protected function getLine(array $array,$sheet='sheet1')
	{
		$_temp="";
		$_count=sizeof($array);
		$index=0;
			foreach($array as $value):
				$_temp.=$this->convert($value);
					if($index==$_count-1):
						$_temp.="\t\n";
					else:
						$_temp.="\t";
					endif;
				$index++;
			endforeach;
		return $_temp;
	}

	/**
	 * @desc 添加excel行,若没有设置表头则将该数组的第一个元素作为表头
	 * @param array $array
	 * @param unknown_type $sheet
	 */
	public function addRow(array $array, $sheet = "sheet1")
	{
		$this->_line[]=$this->getLine($array,$sheet);
		return $this->_line;
	}

	/**
	 * @desc 嵌套添加excel行,若没有设置表头则将该数组的第一个元素作为表头
	 * @param array $array
	 * @param unknown_type $sheet
	 */
	public function addRows(array $array,$sheet = "sheet1")
	{
		foreach($array as $value):
			if(is_array($value)):
				$this->addRow($value);
			else:
				$this->addRow($array);
			endif;
		endforeach;
	}

	/**
	 * @desc 添加工作簿,暂不支持V1.0
	 * @deprecated
	 * @param array $array
	 */
	public function addSheet($sheet) {return;}

	/**
	 * @desc 返回excel表行数
	 */
	public function getRows()
	{
		return sizeof($this->_line);
	}

	/**
	 * @desc 返回excel内容
	 */
	public function getBody()
	{
		return $this->_line;
	}

	/**
	 * @desc 导出excel文件
	 * @param unknown_type $fileName 导出文件名
	 */
	public function export($fileName = "excel")
	{
		header("Content-Type: application/vnd.ms-excel;");
		header("Content-Disposition:filename={$fileName}.xls");
		for($index=0;$index<sizeof($this->_line);$index++):
			echo $this->_line[$index];
		endfor;
	}

	/**
	 * @desc 用户自定义编码转化以及数据筛选函数
	 * @param unknown_type $str
	 */
	protected function convert($str)
	{
		if(function_exists($this->convert)):
			return call_user_func($this->convert,$str);
		else:
			return $str;
		endif;
	}

	/**
	 * @desc 设置表格内容
	 * @param unknown_type $array
	 */
	public function setBody($array)
	{
		$this->_line=$array;
	}
	/**
	 * @desc 释放资源
	 */
	public function release()
	{
		unset($this->_line);
	}
	public function import($fileName,$convert_callback_function=null){}
}
?>