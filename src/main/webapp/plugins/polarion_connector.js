let ui;
let waitWindow;
Draw.loadPlugin(main);

function main (ui) {
  setupActions(ui);
}

function setupActions (editorUi) {
  ui = editorUi;

  mxResources.parse('euchnerFunctions=EuchnerFunctions');
  mxResources.parse('efExport=Export to Polarion');
  
  //editorUi.actions.addAction('editData...', editData, null, null, 'Ctrl+M');
  editorUi.actions.addAction('efExport', exportPolarion);
  
  function setMenu (_menu, parent) {
    editorUi.menus.addMenuItems(_menu,
      [
        '-',
        'efExport',
        '-'
      ]
    );
  }
  var menu = editorUi.menubar.addMenu('EuchnerFunctions', setMenu);
  menu.parentNode.insertBefore(menu, menu.previousSibling.previousSibling.previousSibling);
}

function exportPolarion () {
  var encoder = new mxCodec();
  var links = "http://de14010.euco.net/draw_io_plugins/polarion_connector/polarion_connector.php";
  var node = encoder.encode(ui.editor.graph.getModel());  
  var img_to_send = "";
  
  sendJSON(links, mxUtils.getPrettyXml(node)); 
}

function sendJSON(url, model_xml){
              
            // Creating a XHR object
            let xhr = new XMLHttpRequest();
			
            // open a connection
            xhr.open("POST", url, true);			

            // Set the request header i.e. which type of content you are sending
            xhr.setRequestHeader("Content-Type", "application/json");
			xhr.withCredentials = true;			
            // Create a state change callback
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
 
                    // Print received data from server
                    //result.innerHTML = this.responseText;
					waitWindow.close();
					alert ("Diagram updated");
					
                }
            };
 
            // Converting JSON data to string
            var data = JSON.stringify({ "model_xml": model_xml});
 
            // Sending data with the request
            xhr.send(data);
			showWaiting();
        }