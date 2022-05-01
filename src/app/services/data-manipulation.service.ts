import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataManipulationService {

  constructor() { }

  trim(str : string) {
    return str === undefined || str === null ? "" : str.trim();
  }

  formatFullname(first : string, last : string, username : string) {    
    const newFirst = this.formatName(first);
    const newLast = this.formatName(last);
    const newUsername = this.formatUsername(username);
    return [newFirst, newLast, newUsername];
  }

  formatName(name : string) {
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
  }

  formatUsername(username : string) {
    return username.toLowerCase();
  }

  getInitials(firstName : string, lastName : string) {
    return firstName[0].toUpperCase() + lastName[0].toUpperCase();
  }

  getElapsedTime(date : string) {
    function getSecondsAgo(dateSent : number, dateNow : number) {
      return Math.floor((dateNow - dateSent) / 1000);
    }

    function formatUnit(elapsedTime : number, unit : string) {
      unit += elapsedTime > 1 ? 's' : '';
      return unit;
    }

    function getMinutesAgo(dateSent : number, dateNow : number) {
      return Math.floor(getSecondsAgo(dateSent, dateNow) / 60);
    }

    function getHoursAgo(dateSent : number, dateNow : number) {
      return Math.floor(getMinutesAgo(dateSent, dateNow) / 60);
    }

    function getDaysAgo(dateSent : number, dateNow : number) {
      return Math.floor(getHoursAgo(dateSent, dateNow) / 24);
    }
  
    const dateSent = Date.parse(date);
    const dateNow = Date.now();

    const secsAgo = getSecondsAgo(dateSent, dateNow);
    const minAgo = getMinutesAgo(dateSent, dateNow);
    const hrsAgo = getHoursAgo(dateSent, dateNow);
    const daysAgo = getDaysAgo(dateSent, dateNow);

    const elapsedTime = secsAgo < 60 ? secsAgo : minAgo < 60 ? minAgo : hrsAgo < 24 ? hrsAgo : daysAgo;
    const timeUnit =  secsAgo < 60 ? 'sec' : minAgo < 60 ? 'min' : hrsAgo < 24 ? 'hr' : 'day';

    return `${elapsedTime} ${formatUnit(elapsedTime, timeUnit)} ago`;
  }
  
}