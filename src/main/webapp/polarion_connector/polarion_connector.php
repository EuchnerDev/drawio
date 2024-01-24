<?php
session_start();
//header needed for CORS
if (isset($_SERVER['HTTP_ORIGIN']))
{
	$http_origin = $_SERVER['HTTP_ORIGIN'];
}
else
{
	$http_origin = "";
}

if ($http_origin == "http://de01147.euco.net" || $http_origin == "http://svc-alm.euco.net" || $http_origin == "http://de14013.euco.net" )
{  
    header("Access-Control-Allow-Origin: $http_origin");
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");

header("Access-Control-Allow-Credentials: true");

header("Content-Type: application/json");

$draw_io_server = "https://svc-draw.euco.net";
//$draw_io_server = "http://de01147.euco.net/draw.io";
$draw_io_plugin_server = "https://svc-draw.euco.net";

$python_cmd = "D:\Programme\Python\python.exe";
$drawio_home = $draw_io_server."/index.html";
$plugin_home = $draw_io_plugin_server."/polarion_connector/";
$drawio_static_param = "?p=pol_con&splash=0&libs=uml;general&lang=de";
$plugin_home = $draw_io_plugin_server."/polarion_connector/";
$libLocation = $draw_io_plugin_server."/HWFBLib/";
$json_string = file_get_contents("php://input");
$data = json_decode($json_string);
logger("Start", false);
logger("Session:\r\n".implode(PHP_EOL, $_SESSION));
//look for get params
if(!empty($data->model_xml))
{
	logger("JSON way:\r\n");
	//empty get, might be POST with JSON
	//Get JSON Data 
	logger("JSON params:\r\n".$json_string);
	if(!empty($data->model_xml))
	{
		if(isset($_SESSION['project_id']))
		{	
			//project_id has been set through import
			exportDiagramToPolarion();
		}
		else
		{
			//look for project_id elsewhere
		}
	}
}
if(!empty($_GET))
{
	logger("Start", false);
	logger("GET way:\r\n");
	logger("GET params:\r\n".implode(PHP_EOL, $_GET));
	//GET params received
	$_SESSION['project_id'] = $_GET['project_id'];
	$_SESSION['element_id'] = $_GET['element_id'];
	if($_GET['action'] == 'import')
	{
		//import existing diagram into draw.io
		importDiagramFromPolarion();
	}

	if($_GET['action'] == 'init')
	{
		//init diagram of polarion workitem
		initDiagramInPolarionWorkItem($_GET['project_id'], $_GET['element_id']);
	}
}

function initDiagramInPolarionWorkItem($project_id, $element_id)
{
	global $python_cmd, $drawio_home, $drawio_static_param, $plugin_home, $data;
	
	//Get path and create filename
	$pathprefix = realpath(__DIR__);
	$modelname = $pathprefix."\\".$project_id."_".$element_id;
	$model_uri = $plugin_home.$project_id."_".$element_id.".mxg";

	copy($pathprefix."\\template.mxg", $modelname.".mxg");
	copy($pathprefix."\\template.mxg.png", $modelname.".mxg.png");
	
	//create polarion command
	$update_polarion_cmd = $python_cmd." D:\\Programme\\Jenkins\\scripts\\euchnerPolarion\\diagrams.py";
	$update_polarion_cmd .= " init"; //mode
	$update_polarion_cmd .= " ".$project_id; //project
	$update_polarion_cmd .= " ".$element_id; //-work_item 
	$update_polarion_cmd .= " ".$modelname.".mxg"; //-file_name 
	$update_polarion_cmd .= " 2>&1";
	
	//execute polarion cmd
	$output = null;
	$retval = null;
	exec($update_polarion_cmd, $output, $retval);
	logger($update_polarion_cmd."\r\n");
	logger(implode(PHP_EOL, $output)."\r\n");
	logger($retval."\r\n");
	
	shell_exec("del ".$modelname.".mxg");
	shell_exec("del ".$modelname.".mxg.png");
	
	importDiagramFromPolarion();
}
	
function importDiagramFromPolarion()
{
	global $python_cmd, $drawio_home, $drawio_static_param, $plugin_home, $data, $libLocation;
	//Get ID's from session
	$project_id = $_SESSION['project_id'];
	$element_id = $_SESSION['element_id'];
	
	//Get path and create filename
	$pathprefix = realpath(__DIR__);
	$modelname = $pathprefix."\\".$project_id."_".$element_id;
	$model_uri = $plugin_home.$project_id."_".$element_id.".mxg";
	
	//create polarion command
	$update_polarion_cmd = $python_cmd." D:\\Programme\\Jenkins\\scripts\\euchnerPolarion\\diagrams.py";
	$update_polarion_cmd .= " get"; //mode
	$update_polarion_cmd .= " ".$project_id; //project
	$update_polarion_cmd .= " ".$element_id; //-work_item 
	$update_polarion_cmd .= " ".$modelname.".mxg"; //-file_name 
	$update_polarion_cmd .= " 2>&1";
	
	//execute polarion cmd
	$output = null;
	$retval = null;
	exec($update_polarion_cmd, $output, $retval);
	logger($update_polarion_cmd."\r\n");
	logger(implode(PHP_EOL, $output)."\r\n");
	logger($retval."\r\n");
	
	if ($retval == 0)
	{
		$redir = $drawio_home.$drawio_static_param."&clibs=U".$libLocation.$project_id.".xml&open=U".$model_uri;
		logger("Redirect to:\r\n");
		logger($redir."\r\n");
		header("Location: ".$redir);
	}
	else
	{
		header("");
		echo implode(PHP_EOL, $output);
	}
	die();
}


function exportDiagramToPolarion()
{
	global $python_cmd, $drawio_home, $drawio_static_param, $plugin_home, $data;
	//Get ID's from session
	$project_id = $_SESSION['project_id'];
	$element_id = $_SESSION['element_id'];
	
	//Get path and create filename
	$pathprefix = realpath(__DIR__);
	$modelname = $pathprefix."\\".$project_id."_".$element_id;

	//Save xml diagram
	file_put_contents($modelname.".mxg", $data->model_xml);

	//generate png
	$cmd = "draw.io_20.3.0.exe --crop -x -f png -o ".$modelname.".mxg.png ".$modelname.".mxg";

	shell_exec($cmd);

	//create polarion command
	$update_polarion_cmd = $python_cmd." D:\\Programme\\Jenkins\\scripts\\euchnerPolarion\\diagrams.py";
	$update_polarion_cmd .= " set"; //mode
	$update_polarion_cmd .= " ".$project_id; //project
	$update_polarion_cmd .= " ".$element_id; //-work_item 
	$update_polarion_cmd .= " ".$modelname.".mxg"; //-file_name 
	$update_polarion_cmd .= " 2>&1";

	//execute polarion cmd
	$output = null;
	$retval = null;
	exec($update_polarion_cmd, $output, $retval);
	logger($update_polarion_cmd."\r\n");
	logger(implode(PHP_EOL, $output)."\r\n");
	logger($retval."\r\n");
	//delete temporary files
	shell_exec("del ".$modelname.".mxg");
	shell_exec("del ".$modelname.".mxg.png");
}

function logger($text, $append=true)
{
	if($append)
	{
		file_put_contents("D:\Tmp\log.txt", $text."\r\n", FILE_APPEND);
	}
	else
	{
		file_put_contents("D:\Tmp\log.txt", $text."\r\n");
	}
}