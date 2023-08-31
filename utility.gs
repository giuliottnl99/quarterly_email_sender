function compareDates(date1, date2) {
  //se sono tutti uguali, ritorno 0
    if (date1.getFullYear() == date2.getFullYear() 
        && date1.getMonth() == date2.getMonth() 
        && date1.getDate() == date2.getDate()){
       return 0;
    }
  //Altrimenti ritorno 
    if (date1.getFullYear() < date2.getFullYear() ||
    date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth() ||
    date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() < date2.getDate()){
      return -1;
    }
    else{
      return 1;
    }

}


