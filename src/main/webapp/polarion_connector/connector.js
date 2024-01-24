let ui;

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
  var links = "http://de14010.euco.net/draw_io_plugins/polarion_connector/dostuff.php";//?"+params;
  var node = encoder.encode(ui.editor.graph.getModel());  
  //var img_mod = ui.editor.graph.createImage(null, "#FFFFFF");
  var img_to_send = "";//create_image_from_xml_node(node);

//  let project_id = prompt("Please enter your Polarion Projekt ID", "");
//  let element_id = prompt("Please enter your Polarion Element ID", "");
  
  sendJSON(links, mxUtils.getPrettyXml(node), "", "");
  
}

function sendJSON(url, model_xml, project_id, element_id){
              
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
 
                }
            };
 
            // Converting JSON data to string
            var data = JSON.stringify({ "model_xml": model_xml ,"project_id" : project_id, "element_id" : element_id});
 
            // Sending data with the request
            xhr.send(data);
        }