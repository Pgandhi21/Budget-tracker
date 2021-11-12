window.indexedDB =
  window.indexedDB ||
  window.webkitIndexedDB ||
  window.mozIndexedDB ||
  window.msIndexedDB;

let db;
var request = window.indexedDB.open("budgetDatabase", 1);

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("success: " + db);
};

request.onupgradeneeded = function (event) {
  let db = event.target.result;
  db.createObjectStore("Pending_Transactions", { autoIncrement: true });
};

request.onerror = function (event) {
  console.log("error");
};

function saveRecord(data) {
  var transaction = db.transaction(["Pending_Transactions"], "readwrite");
  var objectStore = transaction.objectStore("Pending_Transactions");
  objectStore.add(data);
  objectStore.onsuccess = function (event) {
    alert("Transactions have been added to your database.");
  };

  objectStore.onerror = function (event) {
    alert("Unable to add transactions to your database!");
  };
}

function checkDatabase() {
  const transactionStore = db
    .transaction(["Pending_Transactions"], "readwrite")
    .objectStore("Pending_Transactions");
  const allData = transactionStore.getAll();
  console.log(allData);
  allData.onsuccess = function () {
    if (allData.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(allData.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transactionStore = db
            .transaction(["Pending_Transactions"], "readwrite")
            .objectStore("Pending_Transactions");
          transactionStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
