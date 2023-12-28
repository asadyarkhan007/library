 
function onSearchEnter(e){
   console.log(e);
   if (e.keyCode === 13) {
      document.querySelector("input[name='searchBtn']").click();
  }
}
function save() {
  let id = document.querySelector("input[name='id']").value;
  if (id == undefined || id == "") {
    id = crypto.randomUUID();
  }
  let title = document.querySelector("input[name='title']").value;
  let author = document.querySelector("input[name='author']").value;
  let publisher = document.querySelector("input[name='publisher']").value;

  var request = db
    .transaction(["book"], "readwrite")
    .objectStore("book")
    .put({
      id: id,
      title: title,
      author: author,
      publisher: publisher,
      reserved: false
    });

  request.onsuccess = function (event) {
    console.log("Record has been added to your database.");
    clearInputFields();
  };

  request.onerror = function (event) {
    console.error("Unable to add data is already exist in your database! ");
  };

  loadDataAndGenerateGrid();
}

function clearInputFields() {
  document.querySelector("input[name='id']").value = null;
  document.querySelector("input[name='title']").value = null;
  document.querySelector("input[name='author']").value = null;
  document.querySelector("input[name='publisher']").value = null;
}

function clearAll() {
   clearInputFields();
   document.querySelector("input[name='searchText']").value ='';
   loadDataAndGenerateGrid();
}

function search() {
  let searchText = document.querySelector("input[name='searchText']").value;
  loadDataAndGenerateGrid(searchText);
}

function editRecord(id) {
  var transaction = db.transaction(["book"]);
  var objectStore = transaction.objectStore("book");
  var request = objectStore.get(id);

  request.onerror = function (event) {
    console.error("Unable to retrieve data from database!");
  };

  request.onsuccess = function (event) {
    if (request.result) {
      console.log(request.result);
      document.querySelector("input[name='id']").value = request.result.id;
      document.querySelector("input[name='title']").value =
        request.result.title;
      document.querySelector("input[name='author']").value =
        request.result.author;
      document.querySelector("input[name='publisher']").value =
        request.result.publisher;
    } else {
      console.log("Record not found in database!");
    }
  };
}

function deleteRecord(id) {
  var request = db
    .transaction(["book"], "readwrite")
    .objectStore("book")
    .delete(id);

  request.onsuccess = function (event) {
    console.log("record removed");
  };

  request.onerror = function (event) {
    console.error("Unable to remove record");
  };

  loadDataAndGenerateGrid();
}


function loadDataAndGenerateGrid(searchText) {
  var objectStore = db.transaction("book").objectStore("book");

  let datagridDiv = document.querySelector("#datagrid");

  let gridTxt = "<div>";
  if (searchText == undefined) {
    gridTxt +=
      '<span> Search #:</span><span> <input type="text" onkeyup="onSearchEnter(event)"  placeholder="search..." name="searchText" ></span>';
  } else {
    gridTxt +=
      '<span> Search #:</span><span> <input type="text"  onkeyup="onSearchEnter(event)" placeholder="search..." name="searchText" value=\'' + searchText +'\'></span>';
  }

  gridTxt +=
    '<span> <input type="button" onclick="search()" name="searchBtn"  placeholder="Insert" value="Search Record"></span>' +
    '<span> <input type="button" onclick="clearAll()" name="clearBtn" placeholder="Insert" value="Clear All"></span>' +
    "</div>" +

    "<table>" +
    "<tr><th>ID</th><th>Title</th><th>Author</th><th>Publsiher</th><th>Reserved</th><th>Actions</th></tr>" +
    "</table>";
  let recordCount=0;  
  datagridDiv.innerHTML = gridTxt;
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      recordCount++;
     
        if (searchText == undefined || searchText == "") {
          generateDataGridRowsAndColumns(cursor);
        } else if (cursor.value.id.startsWith(searchText) || cursor.value.title.toLowerCase().startsWith(searchText.toLowerCase()) ||
        cursor.value.author.toLowerCase().startsWith(searchText.toLowerCase()) || cursor.value.publisher.toLowerCase().startsWith(searchText.toLowerCase()) ) {
          generateDataGridRowsAndColumns(cursor);
        }
      cursor.continue();
    } else {
      console.log("All records added");
    }

    if(recordCount ==0 && !cursor) {
      let table = document.querySelector("#datagrid table");
      let tr = document.createElement("TR");
      let td = document.createElement("TD");
      td.setAttribute("colspan","6");
      td.setAttribute("style","text-align:center");
      td.appendChild(document.createTextNode("No record found"));
      tr.appendChild(td);
      table.appendChild(tr);

    }

  };
}

function generateDataGridRowsAndColumns(cursor) {
  let table = document.querySelector("#datagrid table");
  let tr = document.createElement("TR");
  let td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.id));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.title));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.author));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.publisher));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.reserved));
  tr.appendChild(td);

  let editBtn = document.createElement('button');
  editBtn.innerHTML = 'Edit Record';
  editBtn.onclick = function(e){
   let id = e.target.parentNode.parentNode.cells[0].innerText;
   editRecord(id);
  };

  let deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = 'Delete Record';
  deleteBtn.onclick = function(e){
   let text = "Are you sure want to delete!\nEither OK or Cancel.";
   if (confirm(text) == true) {
      let id = e.target.parentNode.parentNode.cells[0].innerText;
      deleteRecord(id);
   } 
  };

  td = document.createElement("TD");
  td.appendChild(editBtn);
  td.appendChild(deleteBtn);
  tr.appendChild(td);


  table.appendChild(tr);
}

