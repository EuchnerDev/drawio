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

function showWaiting()
{
var html = '<html>' +
'<head><script>' +
'function showLoading() {' +
'  if (document.getElementById(\"divLoadingFrame\") != null) {' +
'    return;' +
'  }' +
'  var style = document.createElement(\"style\");' +
'  style.id = \"styleLoadingWindow\";' +
'  style.innerHTML = `' +
'        .loading-frame {' +
'            position: fixed;' +
'            background-color: rgba(0, 0, 0, 0.8);' +
'            left: 0;' +
'            top: 0;' +
'            right: 0;' +
'            bottom: 0;' +
'            z-index: 4;' +
'        }' +
'' +
'        .loading-track {' +
'            height: 50px;' +
'            display: inline-block;' +
'            position: absolute;' +
'            top: calc(50% - 50px);' +
'            left: 50%;' +
'        }' +
'' +
'        .loading-dot {' +
'            height: 5px;' +
'            width: 5px;' +
'            background-color: white;' +
'            border-radius: 100%;' +
'            opacity: 0;' +
'        }' +
'' +
'        .loading-dot-animated {' +
'            animation-name: loading-dot-animated;' +
'            animation-direction: alternate;' +
'            animation-duration: .75s;' +
'            animation-iteration-count: infinite;' +
'            animation-timing-function: ease-in-out;' +
'        }' +
'' +
'        @keyframes loading-dot-animated {' +
'            from {' +
'                opacity: 0;' +
'            }' +
'' +
'            to {' +
'                opacity: 1;' +
'            }' +
'        }' +
'    `' +
'  document.body.appendChild(style);' +
'  var frame = document.createElement(\"div\");' +
'  frame.id = \"divLoadingFrame\";' +
'  frame.classList.add(\"loading-frame\");' +
'  for (var i = 0; i < 10; i++) {' +
'    var track = document.createElement(\"div\");' +
'    track.classList.add(\"loading-track\");' +
'    var dot = document.createElement(\"div\");' +
'    dot.classList.add(\"loading-dot\");' +
'    track.style.transform = \"rotate(\" + String(i * 36) + \"deg)\";' +
'    track.appendChild(dot);' +
'    frame.appendChild(track);' +
'  }' +
'  document.body.appendChild(frame);' +
'  var wait = 0;' +
'  var dots = document.getElementsByClassName(\"loading-dot\");' +
'  for (var i = 0; i < dots.length; i++) {' +
'    window.setTimeout(function(dot) {' +
'      dot.classList.add(\"loading-dot-animated\");' +
'    }, wait, dots[i]);' +
'    wait += 150;' +
'  }' +
'};'+
'</script></head>' +
'' +
'<body onload=\"showLoading();\">' +
'<img src=http://de14010.euco.net/draw_io_plugins/polarion_connector/loading.gif>' +
'<br><br>Please wait while diagramm is being uploaded.' +
'</body>' +
'</html>' +

'';
waitWindow = window.open("","wildebeast","width=300,height=300,scrollbars=1,resizable=1");
//waitWindow.document.open();
waitWindow.document.write(html);
//waitWindow.document.close();

}

function exportPolarion () {
  var encoder = new mxCodec();
  var links = "http://de14010.euco.net/draw_io_plugins/polarion_connector/polarion_connector.php";//?"+params;
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
					waitWindow.close();
					alert ("Diagram updated");
					
                }
            };
 
            // Converting JSON data to string
            var data = JSON.stringify({ "model_xml": model_xml ,"project_id" : project_id, "element_id" : element_id});
 
            // Sending data with the request
            xhr.send(data);
			showWaiting();
        }