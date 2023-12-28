 
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
  let bookId = document.querySelector("#bookSelect").value;
  let memberId = document.querySelector("#memberSelect").value;
  let fromDate = document.querySelector("input[name='fromDate']").value;
  let toDate = document.querySelector("input[name='toDate']").value;

  if(!bookId || !memberId || !fromDate || !toDate) {
    alert("Please provide all fields before save!");
    return;
  }

  var request = db
    .transaction(["reservation"], "readwrite")
    .objectStore("reservation")
    .put({
      id: id,
      bookId: bookId,
      memberId: memberId,
      fromDate: fromDate,
      toDate: toDate
    });
  
    
  request.onsuccess = function (event) {
    console.log("Record has been added to your database.");
    markBookReservation(bookId, true);
  };

  request.onerror = function (event) {
    console.error("Unable to add data is already exist in your database! ");
  };


}

function markBookReservation(bookId, flag) {
  let getRequest = db
    .transaction(["book"], "readwrite")
    .objectStore("book").get(bookId);
    

    getRequest.onsuccess = function(event) {
      let record = event.target.result;
  
      // Update the specific field in the record
      record.reserved = flag;
  
      // Put the updated record back into the object store
      let updateRequest = db.transaction(["book"], "readwrite").objectStore("book").put(record);
  
      updateRequest.onsuccess = function() {
        console.log("Book reservation hae been marked as "+ flag);
        clearInputFields();
        loadDropdowns();
        loadDataAndGenerateGrid();
      };
  
      updateRequest.onerror = function() {
        console.error("Unable to update reservation for book! ");
      }
    };

    getRequest.onerror = function() {
      console.error("No redord exists! to update");
    }
  
 
}

function clearInputFields() {
  document.querySelector("select[name='bookSelect']").innerHTML = "<option value=\"none\" selected disabled hidden>Select a Book</option>";
  document.querySelector("select[name='memberSelect']").innerHTML = "<option value=\"none\" selected disabled hidden>Select a Member</option>";
  document.querySelector("input[name='fromDate']").value = null;
  document.querySelector("input[name='toDate']").value = null;
}

function clearAll() {
   clearInputFields();
   document.querySelector("input[name='searchText']").value ='';
   loadDataAndGenerateGrid();
   loadDropdowns();
}

function search() {
  let searchText = document.querySelector("input[name='searchText']").value;
  loadDataAndGenerateGrid(searchText);
}


function deleteRecord(id, bookId) {
  var request = db
    .transaction(["reservation"], "readwrite")
    .objectStore("reservation")
    .delete(id);

  request.onsuccess = function (event) {
    console.log("record removed");
  };

  request.onerror = function (event) {
    console.error("Unable to remove record");
  };
  markBookReservation(bookId, false);
}

function loadDropdowns() {
  let bookSelect = document.querySelector("#bookSelect");
  var objectStore = db.transaction("book").objectStore("book");

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      if(!cursor.value.reserved) {
        let opt = document.createElement("option");
        opt.innerHTML = "id:"+cursor.value.id + ', name:' + cursor.value.title;
        opt.setAttribute("value",  cursor.value.id);
        bookSelect.appendChild(opt);
      }
      cursor.continue();
    } else {
      console.log("All records added");
    }
  }

  let memberSelect = document.querySelector("#memberSelect");
  var objectStore = db.transaction("member").objectStore("member");

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;

    if (cursor) {
      let opt = document.createElement("option");
      opt.setAttribute("value", cursor.value.id);
      opt.innerHTML = "id:"+cursor.value.id + ', name:' + cursor.value.firstName;
      memberSelect.appendChild(opt);
      cursor.continue();
    } else {
      console.log("All records added");
    }
  }
}


function loadDataAndGenerateGrid(searchText) {

  var objectStore = db.transaction("reservation").objectStore("reservation");

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
    "<tr><th>ID</th><th>Book ID</th><th>Member ID</th><th>Start Date</th><th>End Date</th><th>Actions</th></tr>" +
    "</table>";
  datagridDiv.innerHTML = gridTxt;
  let recordCount=0;
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
    
      recordCount++;
    
      if (searchText == undefined || searchText == "") {
        generateDataGridRowsAndColumns(cursor);
      } else if (cursor.value.id.startsWith(searchText) || cursor.value.bookId.toLowerCase().startsWith(searchText.toLowerCase()) ||
       cursor.value.memberId.toLowerCase().startsWith(searchText.toLowerCase()) || cursor.value.fromDate.toLowerCase().startsWith(searchText.toLowerCase()) 
       || cursor.value.toDate.toLowerCase().startsWith(searchText.toLowerCase())) {
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
  td.appendChild(document.createTextNode(cursor.value.bookId));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.memberId));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.fromDate));
  tr.appendChild(td);
  td = document.createElement("TD");
  td.appendChild(document.createTextNode(cursor.value.toDate));
  tr.appendChild(td);

  tr.appendChild(td);


  let deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = 'Cancel Reservation';
  deleteBtn.onclick = function(e){
   let text = "Are you sure want to cancel reservation!\nEither OK or Cancel.";
   if (confirm(text) == true) {
      let id = e.target.parentNode.parentNode.cells[0].innerText;
      let bookId = e.target.parentNode.parentNode.cells[1].innerText;
      deleteRecord(id, bookId);
   } 
  };

  td = document.createElement("TD");
  td.appendChild(deleteBtn);
  tr.appendChild(td);


  table.appendChild(tr);
}

