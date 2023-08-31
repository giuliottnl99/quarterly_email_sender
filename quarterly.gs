let sheetTrimestrali;

function returnSheetTrimestrali(){
  if(sheetTrimestrali!=null){
    return sheetTrimestrali;
  }

  sheetTrimestrali = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("foglio_trimestrali_future");
  return sheetTrimestrali;
}

function sendEmailNextQuarters() {
  // Get the sheet and range of data to process
  var sheet = returnSheetTrimestrali();
  var dataRange = sheet.getRange('A2:A200' + sheet.getLastRow());
  
  // Get the values in the data range
  var data = dataRange.getValues();
  
  // Loop through each row of data
  for (var i = 0; i < data.length; i++) {
    //se data[i]==null -> chiudo il ciclo
    if(data[i]==null || data[i]=="")
      break;

    var row = i + 2; // Account for header row and 0-based index
    
    // Check if the quarter report is in the past
    if (isPast(row)) {
      setNewDate(row);
    } else {
      // Check if an email has already been sent for this quarter
      if (alreadySent(row)) {
        continue;
      }
      
      // Check if the quarter report is tomorrow
      if (isTomorrow(row)) {
        sendEmailAlertTrimestrali(row);
      }
    }
  }
}


function getNextQuarterly(symbol, numRiga){

  var apiKey = 'this is my secret key';
  var url = 'https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&symbol=' + symbol + '&apikey=' + apiKey;

  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  let rows = json.split("\n");
  let rowNextDate = rows[1];
  let rowNextDateValues = rowNextDate.split(",");
  let nextDate = rowNextDateValues[2];
  let sheet = returnSheetTrimestrali();
  //se non c'è una nextDate riportata da alphaVantage, mette la prossima data tra 2 giorni, per evitare cicli continui. Inoltre, mette la cella blu
  if(nextDate==null || nextDate==""){
    var date = new Date();
    date.setDate(date.getDate() + 2);
    //setto poi il colore
    sheet.getRange(numRiga, 2).setFontColor("#0000FF");
    return date;
  }
  //altrimenti metto la cella della data nera e imposto
  sheet.getRange(numRiga, 2).setFontColor("black");
  return nextDate;
}

function setNewDate(numRiga) {
  const sheet = returnSheetTrimestrali();
  const symbol = sheet.getRange(numRiga, 1).getValue();
  var nextQuarterlyDate = getNextQuarterly(symbol, numRiga);
  // var nextQuarterly = convertDate(nextQuarterlyDate)
  sheet.getRange(numRiga, 2).setValue(nextQuarterlyDate);
}

function convertDate(date){

  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var day = date.getDate().toString().padStart(2, '0');
  var customFormatDate = `${year}-${month}-${day}`;
  return customFormatDate;
}



function alreadySent(row) {
  const sheet = returnSheetTrimestrali();
  const date = sheet.getRange(row, 2).getValue();
  if (date instanceof Date) {
    const cellColor = sheet.getRange(row, 2).getFontColor();
    if (cellColor !== "#ff0000") {
      return false;
    } else {
      return true;
    }
  } else {
    sheet.getRange(row, 2).setValue("errore funzione alreadySent");
    throw Exception();
  }
}

function isTomorrow(row) {
  const sheet = returnSheetTrimestrali();
  const date = sheet.getRange(row, 2).getValue();
  //se è blu, vuol dire che la data è fittizia e quindi la mail non deve essere inviata
  if(sheet.getRange(row, 2).getFontColor() == "#0000FF"){
    return false;
  }

  
  if (date instanceof Date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if(date.getDate() == tomorrow.getDate() &&
      date.getMonth() == tomorrow.getMonth() &&
      date.getFullYear() == tomorrow.getFullYear()){
        sheet.getRange(row, 2).setFontColor("#ff0000");
        return true;
      }
  } else {
    sheet.getRange(row, 2).setValue("errore funzione isTomorrow");
    throw Exception();
  }
}



function sendEmailAlertTrimestrali(row) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var title = sheet.getRange(row, 1).getValue();
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  var recipient = "giuliorossi11@yahoo.it";
  var subject = "Trimestrale " + title;
  var body = "La trimestrale del titolo " + title + " verrà rilasciata domani.";
  MailApp.sendEmail(recipient, subject, body);
  sheet.getRange(row, 2).setFontColor("#ff0000");
  
}

function isPast(numRiga) {
  const sheet = returnSheetTrimestrali();
  const date = sheet.getRange(numRiga, 2).getValue();
  if (date instanceof Date) {
    //se è passato, ritorno true
    return compareDates(date, new Date())<0;
  } else {
    sheet.getRange(numRiga, 2).setValue("errore funzione isPast");
    throw Exception("errore funzione isPast");
  }
}



