//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  console.error(
    "error: Your browser doesn't support a stable version of IndexedDB."
  );
}

var db;
var request = window.indexedDB.open("libraryDB", 4);

request.onupgradeneeded = function (event) {
  var db = event.target.result;
  var bookObjStore = db.createObjectStore("book", { keyPath: "id" });
  var memberObjStore = db.createObjectStore("member", { keyPath: "id" });
  db.createObjectStore("reservation", { keyPath: "id" });
  loadBasicData(bookObjStore, memberObjStore)
};

function loadBasicData(bookObjStore, memberObjStore){
    const memberData = [
        { id: "4d95ccff-7795-42cd-9bec-7a28082d80cc", firstName: "Martin", lastName: "Doe", address: "50 Beauford Place St.Johns Canada", phone: "7099866432" },
        { id: "4f4d31a4-b647-4a46-aa73-bc67ea38a427", firstName: "John", lastName: "Doe", address: "60 Beauford Place St.Johns Canada", phone: "7099866132" },
        { id: "db5f0ae1-6c09-44ae-ae5c-60385b645db8", firstName: "Tom", lastName: "Doe", address: "60 Airport Heights St.Johns Canada", phone: "7099866532" },
        { id: "88652946-a440-4216-bfea-fb4f021143d8", firstName: "Eve", lastName: "Doe", address: "10A Airport Heights St.Johns Canada", phone: "7099864436" }
     ];

    const bookData = [
        { id: "048c5d47-0699-4e3b-93df-de954303710f", title: "Harry Potter vol-1", author: "J. K. Rowling", publisher: "Bloomsbury", reserved: false },
        { id: "0c85e050-aadc-4aa7-b87c-628b2a63e1b9", title: "Harry Potter vol-2", author: "J. K. Rowling", publisher: "Bloomsbury", reserved: false },
        { id: "454fcdf2-0d33-4234-b70e-4a9adb8dea40", title: "Lord of the Ring vol-1", author: "J.R.R. Tolkien", publisher: "Houghton Mifflin", reserved: false },
        { id: "1140eab5-291a-408d-8203-aed9b1eaab0c", title: "Lord of the Ring vol-2", author: "J.R.R. Tolkien", publisher: "Houghton Mifflin", reserved: false }
    ]; 


    for (var i in bookData) {
        bookObjStore.add(bookData[i]);
    }

    for (var i in memberData) {
        memberObjStore.add(memberData[i]);
    }
     
}


request.onerror = function (event) {
  console.error("error: "+ event);
};

request.onsuccess = function (event) {
  db = request.result;
  console.log("success: " + db);

  loadDataAndGenerateGrid();
  loadDropdowns();
};