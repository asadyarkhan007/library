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
  let firstName = document.querySelector("input[name='firstName']").value;
  let lastName = document.querySelector("input[name='lastName']").value;
  let address = document.querySelector("input[name='address']").value;
  let phone = document.querySelector("input[name='phone']").value;

  var request = db
    .transaction(["member"], "readwrite")
    .objectStore("member")
    .put({
      id: id,
      firstName: firstName,
      lastName: lastName,
      address: address,
      phone: phone
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
  document.querySelector("input[name='firstName']").value = null;
  document.querySelector("input[name='lastName']").value = null;
  document.querySelector("input[name='address']").value = null;
  document.querySelector("input[name='phone']").value = null;
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
  var transaction = db.transaction(["member"]);
  var objectStore = transaction.objectStore("member");
  var request = objectStore.get(id);

  request.onerror = function (event) {
    console.error("Unable to retrieve data from database!");
  };

  request.onsuccess = function (event) {
    if (request.result) {
      console.log(request.result);
      document.querySelector("input[name='id']").value = request.result.id;
      document.querySelector("input[name='firstName']").value =
        request.result.firstName;
      document.querySelector("input[name='lastName']").value =
        request.result.lastName;
      document.querySelector("input[name='address']").value =
        request.result.address;
      document.querySelector("input[name='phone']").value =
        request.result.phone;
    } else {
      console.log("Record not found in database!");
    }
  };
}

function deleteRecord(id) {
  var request = db
    .transaction(["member"], "readwrite")
    .objectStore("member")
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
  var objectStore = db.transaction("member").objectStore("member");

  let datagridDiv = document.querySelector("#datagrid");

  let gridTxt = "<div>";
  if (searchText == undefined) {
    gridTxt +=
      '<span> Search #:</span><span> <input type="text" onkeyup="onSearchEnter(event)"  placeholder="search..." name="searchText" ></span>';
  } else {
    gridTxt +=
      '<span> Search #:</span><span> <input type="text"  onkeyup="onSearchEnter(event)" placeholder="search.." name="searchText" value=\'' +
      searchText +
      "'></span>";
  }

  gridTxt +=
    '<span> <input type="button" onclick="search()" name="searchBtn"  placeholder="Insert" value="Search Record"></span>' +
    '<span> <input type="button" onclick="clearAll()" name="clearBtn" placeholder="Insert" value="Clear All"></span>' +
    "</div>" +
    "<table>" +
    "<tr><th>ID</th><th>First Name</th><th>Last Name</th><th>Address</th><th>Phone</th><th>Actions</th></tr>" +
    "</table>";
  datagridDiv.innerHTML = gridTxt;
  let recordCount=0;
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      recordCount++;
      if (searchText == undefined || searchText == "") {
        generateDataGridRowsAndColumns(cursor);
      } else if (cursor.value.id.startsWith(searchText) || cursor.value.firstName.toLowerCase().startsWith(searchText.toLowerCase()) ||
       cursor.value.lastName.toLowerCase().startsWith(searchText.toLowerCase()) || cursor.value.address.toLowerCase().startsWith(searchText.toLowerCase()) 
       || cursor.value.phone.toLowerCase().startsWith(searchText.toLowerCase())) {
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
  td.appendChild(document.createTextNode(cursor.value.firstName));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.lastName));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.address));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.phone));
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

